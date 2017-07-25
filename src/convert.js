import {
  isPlainObject, entries, extend,
  has,
  isNonNegativeInteger,
  escapeRegex, startsWith
} from './helpers'

export default function internalConvert (value, options = {}, { refs = [], trail = [] } = {}) {
  const {
    castToObject = false,
    bracketArrays = true,
    indentation = 2,
    trailingCommas = false,
    startingIndentationLevel = 0,
    quotes = 'single',
    removeUndefinedProperties = true,
    onCircular = 'nullWithComment',
    onNaN = 'nullWithComment'
  } = options

  if (indentation !== 'tab' && !isNonNegativeInteger(indentation)) {
    throw new Error('`indentation` must be non-negative integer or "tab"')
  }
  if (!has([ 'single', 'double' ], quotes)) {
    throw new Error('`quotes` must be either "single" or "double"')
  }

  const unconvertableOptions = [ 'null', 'nullWithComment', 'string', 'throw' ]
  if (!has(unconvertableOptions, onCircular)) {
    throw new Error('`onCircular` must be either "null", "nullWithComment", "string" or "throw"')
  }
  if (!has(unconvertableOptions, onNaN)) {
    throw new Error('`onNaN` must be either "null", "nullWithComment", "string" or "throw"')
  }

  function stringify (value, delimiter) {
    if (!delimiter) delimiter = quotes === 'single' ? "'" : '"'
    return delimiter + value.replace(new RegExp(escapeRegex(delimiter), 'g'), '\\' + delimiter) + delimiter
  }

  function indent (level = 1) {
    const indentationChar = indentation === 'tab' ? '\t' : ' '.repeat(indentation)
    return indentationChar.repeat(startingIndentationLevel + level)
  }

  function outerIndent () {
    return trail.length ? '' : indent(0)
  }

  function circular () {
    switch (onCircular) {
      case 'null': return 'null'
      case 'nullWithComment': return 'null /* CIRCULAR */'
      case 'string': return stringify('::CIRCULAR::')
      case 'throw': throw new Error('err:circular:' + JSON.stringify(trail))
    }
  }

  function notANumber () {
    switch (onNaN) {
      case 'null': return 'null'
      case 'nullWithComment': return 'null /* NaN */'
      case 'string': return stringify('::NaN::')
      case 'throw': throw new Error('err:NaN:' + JSON.stringify(trail))
    }
  }

  function handleError (err) {
    if (trail.length) {
      throw err
    } else {
      let errorTrail
      if (startsWith(err.message, 'err:type:')) {
        errorTrail = JSON.parse(err.message.slice(9)).slice(0, -1)
        throw new Error(`Disallowed value type in ${printTrail(errorTrail)}`)
      } else if (startsWith(err.message, 'err:plain:')) {
        errorTrail = JSON.parse(err.message.slice(10)).slice(0, -1)
        throw new Error(`Disallowed non-plain object in ${printTrail(errorTrail)}`)
      } else if (startsWith(err.message, 'err:circular:')) {
        errorTrail = JSON.parse(err.message.slice(13))
        throw new Error(`Circular reference: ${printTrail(errorTrail)}`)
      } else if (startsWith(err.message, 'err:NaN:')) {
        errorTrail = JSON.parse(err.message.slice(8))
        throw new Error(`Invalid NaN: ${printTrail(errorTrail)}`)
      } else {
        throw err
      }
    }
  }

  function printTrail (trail) {
    return 'INPUT' + trail.map((item, index) => {
      if (typeof item === 'number') return '[' + String(item) + ']'
      if (item.match(/^[a-z0-9_$]+$/i)) return `.${item}`
      return `[${stringify(item, '"')}]`
    }).join('')
  }

  function object (obj) {
    let str = ''

    str += outerIndent()

    if (castToObject) str += '(object) '

    str += bracketArrays ? '[' : 'array('

    let items = entries(obj)

    if (removeUndefinedProperties) {
      items = items.filter(([ key, value ]) => typeof value !== 'undefined')
    }

    if (items.length) str += '\n'

    let i = 1
    for (const [key, value] of items) {
      let convertedValue
      try {
        convertedValue = internalConvert(value, extend({}, options, {
          startingIndentationLevel: startingIndentationLevel + 1
        }), {
          refs: refs.concat(obj),
          trail: trail.concat(key)
        })
      } catch (err) {
        handleError(err)
      }

      str +=
        indent() +
        stringify(key) +
        ' => ' +
        convertedValue

      if (trailingCommas || i !== items.length) str += ','

      str += '\n'
      i++
    }

    if (items.length) str += indent(0)

    str += bracketArrays ? ']' : ')'

    return str
  }

  function array (arr) {
    let str = ''

    str += outerIndent()

    str += (bracketArrays ? '[' : 'array(')
    if (arr.length) str += '\n'

    for (let i = 0; i < arr.length; i++) {
      let convertedValue
      try {
        convertedValue = internalConvert(arr[i], extend({}, options, {
          startingIndentationLevel: startingIndentationLevel + 1
        }), {
          refs: refs.concat([ arr ]),
          trail: trail.concat(i)
        })

        str += indent() + convertedValue
        if (trailingCommas || i + 1 < arr.length) str += ','
        str += '\n'
      } catch (err) {
        handleError(err)
      }
    }

    if (arr.length) str += indent(0)

    str += bracketArrays ? ']' : ')'
    return str
  }

  let str = ''
  if (Array.isArray(value)) {
    if (has(refs, value)) {
      try {
        str += circular()
      } catch (err) {
        return handleError(err)
      }
    } else {
      str += array(value, options)
    }
  } else if (value == null) {
    str += outerIndent()
    str += 'null'
  } else if (typeof value === 'object') {
    if (isPlainObject(value)) {
      if (has(refs, value)) {
        try {
          str += circular()
        } catch (err) {
          handleError(err)
        }
      } else {
        str += object(value, options)
      }
    } else {
      handleError(new Error('err:plain:' + JSON.stringify(trail)))
    }
  } else if (typeof value === 'number') {
    str += outerIndent()
    if (isNaN(value)) {
      str += notANumber()
    } else {
      if (value === Infinity) {
        str += 'INF'
      } else if (value === -Infinity) {
        str += '-INF'
      } else {
        str += String(value)
      }
    }
  } else if (typeof value === 'boolean') {
    str += outerIndent()
    str += String(value)
  } else if (typeof value === 'string') {
    str += outerIndent()
    str += stringify(value)
  } else {
    handleError(new Error('err:type:' + JSON.stringify(trail)))
  }

  return str
}
