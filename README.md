# JS data to PHP converter

This package takes a JavaScript expression, evaluates and converts it to a PHP expression.

[Try it out in the online demo.](https://loilo.github.io/node-js-php-data)

---
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
---

## Why?

I was missing a nice & clean JavaScript to PHP data converter.

The [online demo of js2php](http://endel.me/js2php/) basically does the job, but provides no opportunity for any kind of output formatting.

## Installation

Install it from npm:

```bash
npm install --save js-php-data
```

### Use in Node.js

To use this package in Node, you can just `require`:

```javascript
const jsPhpData = require('js-php-data')
```

If you need this to work in Node.js v4 or below, try this instead:

```javascript
var jsPhpData = require('js-php-data/dist/cjs.es5')
```

### Use in the browser

You can use this package in your browser with one of the following snippets:

* The most common version. Compiled to ES5, runs in all major browsers down to IE 11:

  ```html
  <script src="node_modules/js-php-data/dist/browser.min.js"></script>
  ```

* Not transpiled to ES5, runs in browsers that support ES2015:

  ```html
  <script src="node_modules/js-php-data/dist/browser.es2015.min.js"></script>
  ```

* If you're really living on the bleeding edge and use ES modules directly in the browser, you can `import` the package as well:

  ```javascript
  import jsPhpData from "./node_modules/js-php-data/dist/browser.module.min.js"
  ```

  As opposed to the snippets above, this will not create a global `jsPhpData` function.


## Usage

Once you have got hold of the `jsPhpData` function, you can use it by passing it a value.

```javascript
jsPhpData({
  foo: 'bar',
  baz: 5
})

/*
[
  'foo' => 'bar',
  'baz' => 5
]
*/
```

You may also pass some optional configuration options:

---

### `castToObject`

**Type:** `boolean`

**Default:** `false`

PHP arrays are used for converted JavaScript arrays as well as JavaScript objects.

This is usually fine, but you can enable this option to make the distinction extra clear by prepending an `(object)` type cast to converted objects. This is especially useful if you want to convert the result back to JavaScript later (for example with `json_encode`), since sometimes converted arrays and objects are then indistinguishable.

---

### `bracketArrays`

**Type:** `boolean`

**Default:** `true`

Use PHP's bracket `[]` notation for arrays. If set to `false`, the older/more compatible `array()` notation will be used.

---

### `trailingCommas`

**Type:** `boolean`

**Default:** `false`

If set to `true`, the last items of all arrays will have a comma appended.

---

### `indentation`

**Type:** `int|"tab"`

**Default:** `2`

By how many spaces arrays should be indented. If set to `"tab"`, one tab will be used instead.

---

### `startingIndentationLevel`

**Type:** int

**Default:** `0`

Puts extra indentation before all output code. Indentation width is determined by multiplying this option with the given `indentation`.

---

### `quotes`

**Type:** `"single"|"double"`

**Default:** `"single"`

Which quotes to use to delimit creating strings.

---

### `removeUndefinedProperties`

**Type:** `boolean`

**Default:** `true`

If set to `true`, properties with an `undefined` value will be omitted from the output.

If set to `false`, the value will be replaced with `null`.

---

### `onCircular`

**Type:** `"null"|"nullWithComment"|"string"|"throw"`

**Default:** `"nullWithComment"`

How to handle circular references.

* `"null"`: replace them with `null`
* `"nullWithComment"`: replace them with `null` and a adjoining `/* CIRCULAR */` comment
* `"string"`: replace them with `"::CIRCULAR::"`
* `"throw"`: Throw an error

---

### `onNaN`

**Type:** `"null"|"nullWithComment"|"string"|"throw"`

**Default:** `"nullWithComment"`

How to handle circular references.

* `"null"`: replace them with `null`
* `"nullWithComment"`: replace them with `null` and a adjoining `/* NaN */` comment
* `"string"`: replace them with `"::NaN::"`
* `"throw"`: Throw an error


## Known limitations

This tool is about converting plain structures. Resolving circular dependencies or converting objects with prototypes is not supported on purpose.
