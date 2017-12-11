'use strict';

/* OBJECTS */

/**
 * Checks if value is a plain object
 * @param  {Any}  obj
 * @return {Boolean}
 */
function isPlainObject (value) {
  return typeof value === 'object' && value !== null && value.prototype == null && value.constructor === Object
}

/**
 * Use this instead of Object.entries() for compatibility
 *
 * @param {Object} obj
 */
function entries (obj) {
  if (Object.entries) { return Object.entries(obj) }
  return Object.keys(obj).map(function (key) { return [ key, obj[key] ]; })
}

/**
 * Use this instead of Object.assign() for compatibility
 *
 * @param {Object} ...obj
 */
function extend () {
  var objects = [], len = arguments.length;
  while ( len-- ) objects[ len ] = arguments[ len ];

  if (Object.assign) { return Object.assign.apply(Object, objects) }
  if (objects.length === 0) { throw new TypeError('Cannot convert undefined or null to object') }
  if (objects.length === 1) { return objects[0] }

  for (var key in objects[1]) {
    objects[0][key] = objects[1][key];
  }

  return extend.apply(void 0, [ objects[0] ].concat( objects.slice(2) ))
}

/* ARRAYS */

/**
 * Use this instead of Array.prototype.includes() for compatibility
 *
 * @param {Array} arr
 * @param {Any} value
 */
function has (array, value) {
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
function isInteger (value) {
  if (Number.isInteger) { return Number.isInteger(value) }

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
function isNonNegativeInteger (value) {
  return isInteger(value) && value >= 0
}

/* STRINGS */

/**
 * Escapes regular expression special characters
 * @param  {String} str
 * @return {String}
 */
function escapeRegex (str) {
  return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')
}

/**
 * Checks if a string starts with another string
 *
 * @param  {String} haystack
 * @param  {String} needle
 * @return {Boolean}
 */
function startsWith (haystack, needle) {
  if (haystack.startsWith) { return haystack.startsWith(needle) }
  return haystack.slice(0, needle.length) === needle
}

function internalConvert (value, options, ref) {
  if ( options === void 0 ) options = {};
  if ( ref === void 0 ) ref = {};
  var refs = ref.refs; if ( refs === void 0 ) refs = [];
  var trail = ref.trail; if ( trail === void 0 ) trail = [];

  var castToObject = options.castToObject; if ( castToObject === void 0 ) castToObject = false;
  var bracketArrays = options.bracketArrays; if ( bracketArrays === void 0 ) bracketArrays = true;
  var indentation = options.indentation; if ( indentation === void 0 ) indentation = 2;
  var trailingCommas = options.trailingCommas; if ( trailingCommas === void 0 ) trailingCommas = false;
  var startingIndentationLevel = options.startingIndentationLevel; if ( startingIndentationLevel === void 0 ) startingIndentationLevel = 0;
  var quotes = options.quotes; if ( quotes === void 0 ) quotes = 'single';
  var removeUndefinedProperties = options.removeUndefinedProperties; if ( removeUndefinedProperties === void 0 ) removeUndefinedProperties = true;
  var onCircular = options.onCircular; if ( onCircular === void 0 ) onCircular = 'nullWithComment';
  var onNaN = options.onNaN; if ( onNaN === void 0 ) onNaN = 'nullWithComment';

  if (indentation !== 'tab' && !isNonNegativeInteger(indentation)) {
    throw new Error('`indentation` must be non-negative integer or "tab"')
  }
  if (!has([ 'single', 'double' ], quotes)) {
    throw new Error('`quotes` must be either "single" or "double"')
  }

  var unconvertableOptions = [ 'null', 'nullWithComment', 'string', 'throw' ];
  if (!has(unconvertableOptions, onCircular)) {
    throw new Error('`onCircular` must be either "null", "nullWithComment", "string" or "throw"')
  }
  if (!has(unconvertableOptions, onNaN)) {
    throw new Error('`onNaN` must be either "null", "nullWithComment", "string" or "throw"')
  }

  function stringify (value, delimiter) {
    if (!delimiter) { delimiter = quotes === 'single' ? "'" : '"'; }
    return delimiter + value.replace(/\\/g, '\\\\').replace(new RegExp(escapeRegex(delimiter), 'g'), '\\' + delimiter) + delimiter
  }

  function indent (level) {
    if ( level === void 0 ) level = 1;

    var indentationChar = indentation === 'tab' ? '\t' : ' '.repeat(indentation);
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
      case 'throw': handleError(new Error('err:circular:' + JSON.stringify(trail)));
    }
  }

  function notANumber () {
    switch (onNaN) {
      case 'null': return 'null'
      case 'nullWithComment': return 'null /* NaN */'
      case 'string': return stringify('::NaN::')
      case 'throw': handleError(new Error('err:NaN:' + JSON.stringify(trail)));
    }
  }

  function handleError (err) {
    var errorTrail;
    if (startsWith(err.message, 'err:type:')) {
      errorTrail = JSON.parse(err.message.slice(9)).slice(0, -1);
      if (errorTrail.length) {
        throw new Error(("Disallowed value type in " + (printTrail(errorTrail))))
      } else {
        throw new Error("Disallowed input type")
      }
    } else if (startsWith(err.message, 'err:plain:')) {
      errorTrail = JSON.parse(err.message.slice(10)).slice(0, -1);
      if (errorTrail.length) {
        throw new Error(("Disallowed non-plain object in " + (printTrail(errorTrail))))
      } else {
        throw new Error("Disallowed non-plain object input")
      }
    } else if (startsWith(err.message, 'err:circular:')) {
      errorTrail = JSON.parse(err.message.slice(13));
      throw new Error(("Circular reference: " + (printTrail(errorTrail))))
    } else if (startsWith(err.message, 'err:NaN:')) {
      errorTrail = JSON.parse(err.message.slice(8));
      if (errorTrail.length) {
        throw new Error(("Invalid NaN: " + (printTrail(errorTrail))))
      } else {
        throw new Error('Invalid NaN input')
      }
    } else {
      throw err
    }
  }

  function printTrail (trail) {
    return 'INPUT' + trail.map(function (item, index) {
      if (typeof item === 'number') { return '[' + String(item) + ']' }
      if (item.match(/^[a-z0-9_$]+$/i)) { return ("." + item) }
      return ("[" + (stringify(item, '"')) + "]")
    }).join('')
  }

  function object (obj) {
    var str = '';

    str += outerIndent();

    if (castToObject) { str += '(object) '; }

    str += bracketArrays ? '[' : 'array(';

    var items = entries(obj);

    if (removeUndefinedProperties) {
      items = items.filter(function (ref) {
        var key = ref[0];
        var value = ref[1];

        return typeof value !== 'undefined';
      });
    }

    if (items.length) { str += '\n'; }

    var i = 1;
    for (var i$1 = 0, list = items; i$1 < list.length; i$1 += 1) {
      var ref = list[i$1];
      var key = ref[0];
      var value = ref[1];

      var convertedValue = (void 0);
      try {
        convertedValue = internalConvert(value, extend({}, options, {
          startingIndentationLevel: startingIndentationLevel + 1
        }), {
          refs: refs.concat(obj),
          trail: trail.concat(key)
        });
      } catch (err) {
        handleError(err);
      }

      str +=
        indent() +
        stringify(key) +
        ' => ' +
        convertedValue;

      if (trailingCommas || i !== items.length) { str += ','; }

      str += '\n';
      i++;
    }

    if (items.length) { str += indent(0); }

    str += bracketArrays ? ']' : ')';

    return str
  }

  function array (arr) {
    var str = '';

    str += outerIndent();

    str += (bracketArrays ? '[' : 'array(');
    if (arr.length) { str += '\n'; }

    for (var i = 0; i < arr.length; i++) {
      var convertedValue = (void 0);
      try {
        convertedValue = internalConvert(arr[i], extend({}, options, {
          startingIndentationLevel: startingIndentationLevel + 1
        }), {
          refs: refs.concat([ arr ]),
          trail: trail.concat(i)
        });

        str += indent() + convertedValue;
        if (trailingCommas || i + 1 < arr.length) { str += ','; }
        str += '\n';
      } catch (err) {
        handleError(err);
      }
    }

    if (arr.length) { str += indent(0); }

    str += bracketArrays ? ']' : ')';
    return str
  }

  var str = '';
  if (Array.isArray(value)) {
    if (has(refs, value)) {
      try {
        str += circular();
      } catch (err) {
        return handleError(err)
      }
    } else {
      str += array(value, options);
    }
  } else if (value == null) {
    str += outerIndent();
    str += 'null';
  } else if (typeof value === 'object') {
    if (isPlainObject(value)) {
      if (has(refs, value)) {
        try {
          str += circular();
        } catch (err) {
          handleError(err);
        }
      } else {
        str += object(value, options);
      }
    } else {
      handleError(new Error('err:plain:' + JSON.stringify(trail)));
    }
  } else if (typeof value === 'number') {
    str += outerIndent();
    if (isNaN(value)) {
      str += notANumber();
    } else {
      if (value === Infinity) {
        str += 'INF';
      } else if (value === -Infinity) {
        str += '-INF';
      } else {
        str += String(value);
      }
    }
  } else if (typeof value === 'boolean') {
    str += outerIndent();
    str += String(value);
  } else if (typeof value === 'string') {
    str += outerIndent();
    str += stringify(value);
  } else {
    handleError(new Error('err:type:' + JSON.stringify(trail)));
  }

  return str
}

function convert (value, options) {
  return internalConvert(value, options)
}

module.exports = convert;
