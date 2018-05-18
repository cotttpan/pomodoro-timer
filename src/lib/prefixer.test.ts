import prefixer from './prefixer'
import cc from 'classcat'

test('add prefix', () => {
  const px = prefixer('a ')
  expect(px('b c')).toBe('a b c')
})

test('add prefix useing factory', () => {
  const cx = prefixer('a ', cc)
  expect(cx(['b', 'c'])).toBe('a b c')
})
