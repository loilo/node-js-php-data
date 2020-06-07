# JS data to PHP converter

[![Test status on Travis](https://badgen.net/travis/loilo/node-js-php-data?label=build)](https://travis-ci.org/loilo/node-js-php-data)
[![Version on npm](https://badgen.net/npm/v/js-php-data)](https://www.npmjs.com/package/js-php-data)

> This package takes a JavaScript expression and converts it into a PHP expression.

[✨ Try it out in the online demo.](https://loilo.github.io/node-js-php-data/)

## Why?

For a PHP/JS developer, it's quite common having to convert JavaScript (or even JSON) data into a PHP array. This is tedious to do manually and I wanted a copy&paste solution.

Therefore, the actual purpose of this package is its online demo, the package is merely a byproduct.

## Installation

Install it from npm:

```bash
npm install js-php-data
```

### Use in Node.js

To use this package in Node, you can just `require`:

```javascript
const jsPhpData = require('js-php-data')
```

### Use in the Browser

You can use this package in your browser with one of the following snippets:

- Compiled to ES5, runs in all major browsers down to IE 11 (exposes a global function `jsPhpData`):

  ```html
  <script src="https://unpkg.com/js-php-data/dist/js-php-data.umd.js"></script>
  ```

- As an ES module, for modern browsers:

  ```javascript
  import jsPhpData from 'https://unpkg.com/js-php-data'
  ```

## Usage

Once you have somehow imported the `jsPhpData` function from this module, you can use it by passing it a value.

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

- `"null"`: replace them with `null`
- `"nullWithComment"`: replace them with `null` and a adjoining `/* CIRCULAR */` comment
- `"string"`: replace them with `"::CIRCULAR::"`
- `"throw"`: Throw an error

---

## Known limitations

This tool is about converting plain structures. Resolving circular dependencies or converting objects with prototypes is not supported on purpose.
