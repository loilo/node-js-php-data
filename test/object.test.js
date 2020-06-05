const convert = require('../dist/js-php-data')

test('converts `{ a: 1 }` correctly', () => {
  expect(convert({ a: 1 })).toBe(`[
    'a' => 1
]`)
})

test('converts `{ a: 1, b: "true", c: null }` correctly`', () => {
  expect(convert({ a: 1, b: 'true', c: null })).toBe(`[
    'a' => 1,
    'b' => 'true',
    'c' => null
]`)
})

test('converts `{ 0: "a" }` correctly', () => {
  expect(convert({ 0: 'a' })).toBe(`[
    '0' => 'a'
]`)
})

test('converts `{ "f\'oo": "bar" }` correctly', () => {
  expect(convert({ "f'oo": 'bar' })).toBe(`[
    'f\\'oo' => 'bar'
]`)
})

test('fails on constructed objects', () => {
  expect(() => {
    convert(new Map())
  }).toThrow()
})
