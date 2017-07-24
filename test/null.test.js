const convert = require('../dist/cjs')

test('converts `null` to `null`', () => {
  expect(convert(null)).toBe('null')
})

test('converts `undefined` to `null`', () => {
  expect(convert(undefined)).toBe('null')
})

test('removes `undefined` property', () => {
  expect(convert({ foo: undefined })).toBe('[]')
})
