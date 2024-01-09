import convert from '../../../src/index.js'
import * as acorn from 'acorn'
import * as estree from 'estree-walker'
import JSON5 from 'json5'
import MagicString from 'magic-string'
import { SimpleWorkerResponse } from './transform-utils.js'
import { SourceMapConsumer } from '../source-map/source-map.js'

function supplementSpecifier(specifier: string) {
  return /^https?:\/\//.test(specifier)
    ? specifier
    : `https://cdn.skypack.dev/${specifier}`
}

export type TransformOptions = {
  withSourceMap: boolean
}

/**
 * Transform a block of code.
 * The resulting code represents a Promise expression resolving to the last
 * expression statement inside the transformed code block.
 **/
function transformCodeToExpressionCode(code: string): {
  code: string
  map: string
  usesImports: boolean
} {
  try {
    JSON5.parse(code)

    const string = new MagicString(code)
    string.prepend('(async () => (')
    string.append('))()')

    return {
      code: string.toString(),
      map: string.generateMap({ hires: true }).toString(),
      usesImports: false
    }
  } catch {}

  let id = '_' + crypto.randomUUID().replaceAll('-', '_')
  let usesImports = false

  const modifiedCode = new MagicString(code)
  const ast = acorn.parse(code, {
    ecmaVersion: 'latest',
    sourceType: 'module',
    allowAwaitOutsideFunction: true
  })

  const importers: Array<{ importer: string; specifiers: string }> = []
  estree.walk(ast as any, {
    enter(node, parent) {
      const nodeAny = node as any
      const parentAny = parent as any

      switch (node.type) {
        case 'BlockStatement': {
          if (
            parent.type === 'Program' &&
            parent.body[parent.body.length - 1] === node
          ) {
            modifiedCode.appendLeft(nodeAny.start, `response${id} = `)
          }
          break
        }

        // We need to rewrite all import declarations because they would be hoisted,
        // and we need to run code before the first import actually happens
        case 'ImportDeclaration': {
          usesImports = true

          let importer = `import(${JSON.stringify(
            supplementSpecifier(String(node.source.value))
          )})`
          let specifiers = ''

          if (node.specifiers.length > 0) {
            if (node.specifiers[0].type === 'ImportNamespaceSpecifier') {
              specifiers = node.specifiers[0].local.name
            } else {
              let specifiersMap = []
              for (let importSpecifier of node.specifiers) {
                if (importSpecifier.type === 'ImportDefaultSpecifier') {
                  specifiersMap.push(['default', importSpecifier.local.name])
                } else {
                  specifiersMap.push([
                    (
                      (importSpecifier as acorn.ImportSpecifier)
                        .imported as acorn.Identifier
                    ).name,
                    importSpecifier.local.name
                  ])
                }
              }
              specifiers = `{ ${specifiersMap
                .map(([importedName, localName]) =>
                  importedName === localName
                    ? localName
                    : `${importedName}: ${localName}`
                )
                .join(', ')} }`
            }
          }

          importers.push({ importer, specifiers })

          modifiedCode.remove(nodeAny.start, nodeAny.end)
          break
        }

        case 'ExportDefaultDeclaration':
        case 'ExportNamedDeclaration':
        case 'ExportAllDeclaration':
          throw new Error(
            'Cannot use export declarations in transformation code.'
          )

        case 'Program': {
          let preImporters = ''
          if (importers.length > 0) {
            preImporters = `let [
${importers.map(({ specifiers }) => `  ${specifiers}`).join(',\n')}
] = await Promise.all([
${importers.map(({ importer }) => `  ${importer}`).join(',\n')}
]);`
          }

          modifiedCode.prependLeft(
            nodeAny.start,
            `(async () => {

let response${id}

${preImporters}

`
          )

          modifiedCode.appendRight(
            nodeAny.end,
            `

return response${id}

})()`
          )
          break
        }

        case 'Identifier': {
          if (
            parent &&
            parent.type === 'VariableDeclarator' &&
            parent.id === node
          ) {
            modifiedCode.appendLeft(nodeAny.end, ` = response${id}`)
          }
          break
        }

        default: {
          if (parent) {
            if (
              parent.type === 'ExpressionStatement' &&
              parent.expression === node
            ) {
              modifiedCode.prependRight(nodeAny.start, `response${id} = (`)
              modifiedCode.appendLeft(nodeAny.end, ')')
            } else if (
              node.type === 'Literal' &&
              parent.type === 'ImportExpression' &&
              parent.source === node &&
              !/^https?:\/\//.test(String(node.value))
            ) {
              modifiedCode.overwrite(
                nodeAny.start,
                nodeAny.end,
                JSON.stringify(supplementSpecifier(String(node.value)))
              )
            }
          }

          break
        }
      }
    }
  })

  return {
    code: modifiedCode.toString(),
    map: modifiedCode.generateMap({ hires: true }).toString(),
    usesImports
  }
}

export async function transform(
  code: string,
  options: any
): Promise<SimpleWorkerResponse> {
  const getOffset = (row: number, column: number) => {
    const rowOffset = code
      .split('\n')
      .slice(0, Number(row) - 1)
      .join('\n').length
    return rowOffset + Number(column) - 1
  }

  try {
    const transformed = transformCodeToExpressionCode(code)

    try {
      const value = await eval(transformed.code)

      try {
        return {
          type: 'transformed',
          payload: convert(value, options)
        }
      } catch (error) {
        console.warn('Conversion error:', error)

        return {
          type: 'error',
          payload: {
            offset: 0,
            message: String(error)
          }
        }
      }
    } catch (error) {
      console.warn('Runtime error: %o', error)
      let offset = 0

      const match = ((error as any)?.stack as string | undefined)?.match(
        /<anonymous>:(?<row>[0-9]+):(?<column>[0-9]+)/
      )

      if (match) {
        const { row, column } = match.groups!

        const consumer = await new SourceMapConsumer(transformed.map)
        const originalPosition = consumer.originalPositionFor({
          line: Number(row),
          column: Number(column)
        })
        offset = getOffset(
          originalPosition.line! ?? 1,
          originalPosition.column! ?? 1
        )
        consumer.destroy()
      }

      // Runtime error
      return {
        type: 'error',
        payload: {
          offset,
          message: String(error)
        }
      }
    }
  } catch (error) {
    console.warn('Parsing error:', error)

    const pattern = /\s*\((?<row>[0-9]+):(?<column>[0-9]+)\)$/
    const match = String((error as any)?.message).match(pattern)

    let offset: number, message: string
    if (match) {
      const { row, column } = match.groups!
      offset = getOffset(Number(row), Number(column))
      message = (error as any)?.message.replace(pattern, '') ?? String(error)
    } else {
      offset = 0
      message = String((error as any)?.message ?? error)
    }

    // Parsing error
    return {
      type: 'error',
      payload: { offset, message }
    }
  }
}
