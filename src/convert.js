import { isPlainObject, escapeRegex } from './helpers'

export default function internalConvert(
  value,
  options = {},
  { refs = [], trail = [] } = {}
) {
  const {
    castToObject = false,
    quotes = 'single',
    removeUndefinedProperties = true,
    onCircular = 'nullWithComment'
  } = options

  function stringify(value, delimiter = quotes === 'single' ? "'" : '"') {
    return (
      delimiter +
      value
        .replace(/\\/g, '\\\\')
        .replace(new RegExp(escapeRegex(delimiter), 'g'), `\\${delimiter}`) +
      delimiter
    )
  }

  function circular() {
    switch (onCircular) {
      case 'null':
        return 'null'
      case 'nullWithComment':
        return 'null /* CIRCULAR */'
      case 'string':
        return stringify('::CIRCULAR::')
      case 'throw':
        handleError(new Error(`err:circular:${JSON.stringify(trail)}`))
    }
  }

  function handleError(error) {
    let errorTrail
    if (error.message.startsWith('err:type:')) {
      errorTrail = JSON.parse(error.message.slice(9)).slice(0, -1)
      if (errorTrail.length > 0) {
        throw new Error(`Disallowed value type in ${printTrail(errorTrail)}`)
      } else {
        throw new Error(`Disallowed input type`)
      }
    } else if (error.message.startsWith('err:plain:')) {
      errorTrail = JSON.parse(error.message.slice(10)).slice(0, -1)
      if (errorTrail.length > 0) {
        throw new Error(
          `Disallowed non-plain object in ${printTrail(errorTrail)}`
        )
      } else {
        throw new Error(`Disallowed non-plain object input`)
      }
    } else if (error.message.startsWith('err:circular:')) {
      errorTrail = JSON.parse(error.message.slice(13))
      throw new Error(`Circular reference: ${printTrail(errorTrail)}`)
    } else if (error.message.startsWith('err:NaN:')) {
      errorTrail = JSON.parse(error.message.slice(8))
      if (errorTrail.length > 0) {
        throw new Error(`Invalid NaN: ${printTrail(errorTrail)}`)
      } else {
        throw new Error('Invalid NaN input')
      }
    } else {
      throw error
    }
  }

  function printTrail(trail) {
    return (
      'INPUT' +
      trail
        .map((item, index) => {
          if (typeof item === 'number') return `[${item}]`
          if (item.match(/^[a-z0-9_$]+$/i)) return `.${item}`
          return `[${stringify(item, '"')}]`
        })
        .join('')
    )
  }

  function printObject(value) {
    let result = ''

    if (castToObject) result += '(object) '

    result += '['

    let items = Object.entries(value)
    refs = refs.concat(value)

    if (removeUndefinedProperties) {
      items = items.filter(([key, value]) => typeof value !== 'undefined')
    }

    if (items.length > 0) result += '\n'

    for (const [key, value] of items) {
      let convertedValue
      try {
        convertedValue = internalConvert(
          value,
          { ...options },
          {
            refs,
            trail: trail.concat(key)
          }
        )
      } catch (err) {
        handleError(err)
      }

      result += `${stringify(key)} => ${convertedValue},\n`
    }
    result += ']'

    return result
  }

  function printArray(value) {
    let result = ''

    result += '['
    if (value.length > 0) result += '\n'

    refs = refs.concat([value])

    for (let i = 0; i < value.length; i++) {
      let convertedValue
      try {
        convertedValue = internalConvert(
          value[i],
          { ...options },
          {
            refs,
            trail: trail.concat(i)
          }
        )

        result += `${convertedValue},\n`
      } catch (err) {
        handleError(err)
      }
    }

    result += ']'
    return result
  }

  let result = ''
  if (Array.isArray(value)) {
    if (refs.includes(value)) {
      try {
        result += circular()
      } catch (err) {
        return handleError(err)
      }
    } else {
      result += printArray(value, options)
    }
  } else if (value == null) {
    result += 'null'
  } else if (typeof value === 'object' && value !== null) {
    if (isPlainObject(value)) {
      if (refs.includes(value)) {
        try {
          result += circular()
        } catch (err) {
          handleError(err)
        }
      } else {
        result += printObject(value, options)
      }
    } else {
      handleError(new Error(`err:plain:${JSON.stringify(trail)}`))
    }
  } else if (typeof value === 'number') {
    if (isNaN(value)) {
      result += 'NAN'
    } else {
      if (value === Infinity) {
        result += 'INF'
      } else if (value === -Infinity) {
        result += '-INF'
      } else {
        result += String(value)
      }
    }
  } else if (typeof value === 'boolean') {
    result += String(value)
  } else if (typeof value === 'string') {
    result += stringify(value)
  } else {
    handleError(new Error(`err:type:${JSON.stringify(trail)}`))
  }

  return result
}
