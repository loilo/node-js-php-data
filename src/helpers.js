
/* OBJECTS */

/**
 * Checks if value is a plain object
 * @param  {Any}  obj
 * @return {Boolean}
 */
export function isPlainObject (value) {
  return typeof value === 'object' && value !== null && value.prototype == null && value.constructor === Object
}

/**
 * Use this instead of Object.entries() for compatibility
 *
 * @param {Object} obj
 */
export function entries (obj) {
  if (Object.entries) return Object.entries(obj)
  return Object.keys(obj).map(key => [ key, obj[key] ])
}

/**
 * Use this instead of Object.assign() for compatibility
 *
 * @param {Object} ...obj
 */
export function extend (...objects) {
  if (Object.assign) return Object.assign(...objects)
  if (objects.length === 0) throw new TypeError('Cannot convert undefined or null to object')
  if (objects.length === 1) return objects[0]

  for (let key in objects[1]) {
    objects[0][key] = objects[1][key]
  }

  return extend(objects[0], ...objects.slice(2))
}

/* ARRAYS */

/**
 * Use this instead of Array.prototype.includes() for compatibility
 *
 * @param {Array} arr
 * @param {Any} value
 */
export function has (array, value) {
  return array.includes
    ? array.includes(value)
    : array.indexOf(value) !== -1
}

/* NUMBERS */

/**
 * Checks if a value is an integer
 *
 * @param  {Any} value
 * @return {Boolean}
 */
export function isInteger (value) {
  if (Number.isInteger) return Number.isInteger(value)

  return typeof value === 'number' &&
    isFinite(value) &&
    Math.floor(value) === value
}

/**
 * Checks if a value is an integer with a value of 0 or greater
 *
 * @param  {Any} value
 * @return {Boolean}
 */
export function isNonNegativeInteger (value) {
  return isInteger(value) && value >= 0
}

/* STRINGS */

/**
 * Escapes regular expression special characters
 * @param  {String} str
 * @return {String}
 */
export function escapeRegex (str) {
  return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')
}

/**
 * Checks if a string starts with another string
 *
 * @param  {String} haystack
 * @param  {String} needle
 * @return {Boolean}
 */
export function startsWith (haystack, needle) {
  if (haystack.startsWith) return haystack.startsWith(needle)
  return haystack.slice(0, needle.length) === needle
}
