const convert = require('../dist/cjs')

test('converts `[ "a", \'b\', { c: 3 } ]` correctly`', () => {
  expect(convert([ "a", 'b', { c: 3 } ])).toBe(`[
  'a',
  'b',
  [
    'c' => 3
  ]
]`)
})

test('converts `{ a: { b: { c: [] } } }` correctly`', () => {
  expect(convert({ a: { b: { c: [] } } })).toBe(`[
  'a' => [
    'b' => [
      'c' => []
    ]
  ]
]`)
})

