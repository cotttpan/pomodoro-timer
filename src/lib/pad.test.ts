import pad from './pad'

test('pad', () => {
  expect(pad(0, '0', 2)).toBe('00')
  expect(pad(10, '0', 2)).toBe('10')
})
