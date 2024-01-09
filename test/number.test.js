import convert from '../src/index.js'

test('converts `5` to `5`', () => {
  expect(convert(5)).toBe('5')
})

test('converts `3.14` to `3.14`', () => {
  expect(convert(3.14)).toBe('3.14')
})

test('converts `-15` to `-15`', () => {
  expect(convert(-15)).toBe('-15')
})

test('converts `NaN` to `NAN`', () => {
  expect(convert(NaN)).toBe('NAN')
})

test('converts `Infinity` to `INF`', () => {
  expect(convert(Infinity)).toBe('INF')
})

test('converts `-Infinity` to `-INF`', () => {
  expect(convert(-Infinity)).toBe('-INF')
})
