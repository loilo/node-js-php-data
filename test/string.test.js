const convert = require('../dist/cjs')

test('converts `foo` to `\'foo\'`', () => {
  expect(convert('foo')).toBe("'foo'")
})

test('converts `` to `\'\'`', () => {
  expect(convert('')).toBe("''")
})

test('converts `f\'oo` to `\'f\\\'oo\'`', () => {
  expect(convert('f\'oo')).toBe("'f\\'oo'")
})
