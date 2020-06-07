const convert = require('../dist/js-php-data')

test("converts `foo` to `'foo'`", () => {
  expect(convert('foo')).toBe("'foo'")
})

test("converts `` to `''`", () => {
  expect(convert('')).toBe("''")
})

test("converts `f'oo` to `'f\\'oo'`", () => {
  expect(convert("f'oo")).toBe("'f\\'oo'")
})

test('escapes newline characters', () => {
  expect(convert('foo\nbar')).toBe(`"foo\\nbar"`)
})

test('escapes dollar signs in double quotes', () => {
  expect(convert('$foo')).toBe(`'$foo'`)
  expect(convert('$foo', { quotes: 'double' })).toBe(`"\\$foo"`)
})
