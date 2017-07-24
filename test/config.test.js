const convert = require('../dist/cjs')

test('respects `castToObject: true`', () => {
  expect(convert({ a: true }, { castToObject: true })).toBe(`(object) [
  'a' => true
]`)
})

test('inherits `castToObject: true`', () => {
  expect(convert({ a: { b: true } }, { castToObject: true })).toBe(`(object) [
  'a' => (object) [
    'b' => true
  ]
]`)
})

test('respects `bracketArrays: false`', () => {
  expect(convert([], { bracketArrays: false })).toBe(`array()`)
  expect(convert({}, { bracketArrays: false })).toBe(`array()`)
})

test('respects `indentation: 3`', () => {
  expect(convert([ 1, 2, 3 ], { indentation: 3 })).toBe(`[
   1,
   2,
   3
]`)
})

test('respects `indentation: "tab"`', () => {
  expect(convert([ 1, 2, 3 ], { indentation: 'tab' })).toBe(`[
\t1,
\t2,
\t3
]`)
})

test('respects `startingIndentationLevel: 1`', () => {
  expect(convert([ 1, 2, 3 ], { startingIndentationLevel: 1 })).toBe(`  [
    1,
    2,
    3
  ]`)
})

test('respects `startingIndentationLevel: 1` combined with `indentation: 1`', () => {
  expect(convert([ 1, 2, 3 ], { startingIndentationLevel: 1, indentation: 1 })).toBe(` [
  1,
  2,
  3
 ]`)
})

test('respects `quotes: "double"`', () => {
  expect(convert('foo', { quotes: 'double' })).toBe(`"foo"`)
})

test('escapes `quotes: "double"`', () => {
  expect(convert('f"oo', { quotes: 'double' })).toBe(`"f\\"oo"`)
})

test('respects `removeUndefinedProperties: false`', () => {
  expect(convert({ a: undefined }, { removeUndefinedProperties: false })).toBe(`[
  'a' => null
]`)
})

const a = {}
a.a = a

test('respects `onCircular: "null"`', () => {
  expect(convert(a, { onCircular: 'null' })).toBe(`[
  'a' => null
]`)
})

test('respects `onCircular: "nullWithComment"`', () => {
  expect(convert(a, { onCircular: 'nullWithComment' })).toBe(`[
  'a' => null /* CIRCULAR */
]`)
})


test('respects `onCircular: "string"`', () => {
  expect(convert(a, { onCircular: 'string' })).toBe(`[
  'a' => '::CIRCULAR::'
]`)
})

test('respects `onCircular: "throw"`', () => {
  expect(() => {
    convert(a, { onCircular: 'throw' })
  }).toThrow()
})

const notANumber = NaN

test('respects `onNaN: "null"`', () => {
  expect(convert(notANumber, { onNaN: 'null' })).toBe(`null`)
})

test('respects `onNaN: "nullWithComment"`', () => {
  expect(convert(notANumber, { onNaN: 'nullWithComment' })).toBe(`null /* NaN */`)
})

test('respects `onNaN: "string"`', () => {
  expect(convert(notANumber, { onNaN: 'string' })).toBe(`'::NaN::'`)
})

test('respects `onNaN: "throw"`', () => {
  expect(() => {
    convert(notANumber, { onNaN: 'throw' })
  }).toThrow()
})
