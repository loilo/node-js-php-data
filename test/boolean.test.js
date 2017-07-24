const convert = require('../dist/cjs')

test('converts `true` to `true`', () => {
  expect(convert(true)).toBe('true')
})

test('converts `false` to `false`', () => {
  expect(convert(false)).toBe('false')
})
