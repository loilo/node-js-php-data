import prettier from 'prettier'
import phpPlugin from '@prettier/plugin-php'
import internalConvert from './convert'

export default function convert(
  value,
  {
    castToObject = false,
    bracketArrays = true,
    indentation = 4,
    trailingCommas = false,
    quotes = 'single',
    removeUndefinedProperties = true,
    onCircular = 'nullWithComment'
  } = {}
) {
  if (
    indentation !== 'tab' &&
    !(Number.isInteger(indentation) && indentation >= 0)
  ) {
    throw new Error('`indentation` must be non-negative integer or "tab"')
  }
  if (!['single', 'double'].includes(quotes)) {
    throw new Error('`quotes` must be either "single" or "double"')
  }

  const unconvertableOptions = ['null', 'nullWithComment', 'string', 'throw']
  if (!unconvertableOptions.includes(onCircular)) {
    throw new Error(
      '`onCircular` must be either "null", "nullWithComment", "string" or "throw"'
    )
  }

  const rawResult = internalConvert(value, {
    castToObject,
    quotes,
    removeUndefinedProperties,
    onCircular
  })

  const formattedResult = prettier.format(`<?php return ${rawResult};`, {
    parser: 'php',
    plugins: [phpPlugin],
    phpVersion: bracketArrays ? '7.4' : '5.3',
    trailingCommaPHP: trailingCommas,
    tabWidth: Number.isInteger(indentation) ? indentation : undefined,
    useTabs: indentation === 'tab',
    singleQuote: quotes === 'single'
  })

  return formattedResult.replace(/^.*?\sreturn(.+);\s*$/s, '$1').trim()
}
