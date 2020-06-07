const convert = require('../dist/js-php-data')

test('respects `castToObject`', () => {
  expect(convert({ a: true })).toBe(`[
    'a' => true
]`)

  expect(convert({ a: true }, { castToObject: false })).toBe(`[
    'a' => true
]`)
  expect(convert({ a: { b: true } }, { castToObject: false })).toBe(`[
    'a' => [
        'b' => true
    ]
]`)

  expect(convert({ a: true }, { castToObject: true })).toBe(`(object) [
    'a' => true
]`)
  expect(convert({ a: { b: true } }, { castToObject: true })).toBe(`(object) [
    'a' => (object) [
        'b' => true
    ]
]`)
})

test('respects `bracketArrays`', () => {
  expect(convert([])).toBe(`[]`)
  expect(convert([], { bracketArrays: true })).toBe(`[]`)
  expect(convert([], { bracketArrays: false })).toBe(`array()`)
})

test('respects `indentation`', () => {
  expect(convert({ a: true })).toBe(`[
    'a' => true
]`)
  expect(convert({ a: true }, { indentation: 3 })).toBe(`[
   'a' => true
]`)
  expect(convert({ a: 1, b: 2, c: 3 }, { indentation: 'tab' })).toBe(`[
\t'a' => 1,
\t'b' => 2,
\t'c' => 3
]`)
})

test('respects `trailingCommas`', () => {
  expect(convert([1])).toBe(`[1]`)
  expect(convert([1], { trailingCommas: true })).toBe(`[1]`)
  expect(convert({ a: 1 })).toBe(`[
    'a' => 1
]`)
  expect(convert({ a: 1 }, { trailingCommas: false })).toBe(`[
    'a' => 1
]`)
  expect(convert({ a: 1 }, { trailingCommas: true })).toBe(`[
    'a' => 1,
]`)
})

test('respects `quotes`', () => {
  expect(convert('foo')).toBe(`'foo'`)
  expect(convert('foo', { quotes: 'double' })).toBe(`"foo"`)
  expect(convert('foo', { quotes: 'single' })).toBe(`'foo'`)
})

test('escapes quotes`', () => {
  expect(convert('f"oo', { quotes: 'double' })).toBe(`"f\\"oo"`)
  expect(convert("f'oo", { quotes: 'single' })).toBe(`'f\\'oo'`)
})

test('respects `removeUndefinedProperties`', () => {
  expect(convert({ a: undefined })).toBe(`[]`)
  expect(convert({ a: undefined }, { removeUndefinedProperties: true })).toBe(
    `[]`
  )
  expect(convert({ a: undefined }, { removeUndefinedProperties: false }))
    .toBe(`[
    'a' => null
]`)
})

test('respects `onCircular`', () => {
  const a = {}
  a.a = a

  expect(convert(a)).toBe(`[
    'a' => null /* CIRCULAR */
]`)
  expect(convert(a, { onCircular: 'nullWithComment' })).toBe(`[
    'a' => null /* CIRCULAR */
]`)
  expect(convert(a, { onCircular: 'null' })).toBe(`[
    'a' => null
]`)
  expect(convert(a, { onCircular: 'string' })).toBe(`[
    'a' => '::CIRCULAR::'
]`)
  expect(() => {
    convert(a, { onCircular: 'throw' })
  }).toThrow()
})
