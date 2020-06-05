/* OBJECTS */

/**
 * Checks if value is a plain object
 * @param  {Any}  obj
 * @return {Boolean}
 */
export function isPlainObject(value) {
  return (
    typeof value === 'object' &&
    value !== null &&
    value.prototype == null &&
    value.constructor === Object
  )
}

/* STRINGS */

/**
 * Escapes regular expression special characters
 * @param  {String} str
 * @return {String}
 */
export function escapeRegex(str) {
  return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')
}
