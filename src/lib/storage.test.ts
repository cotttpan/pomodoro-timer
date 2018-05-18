import Storage from './storage'

const init = () => ({ a: 1, b: 'b', c: true })

test('#latest', () => {
  const store = new Storage(init)
  const state = store.latest()
  expect(state).toEqual({ a: 1, b: 'b', c: true })
})

test('#get', () => {
  const store = new Storage(init)
  const a = store.get('a')
  const b = store.get('b')
  expect(a).toBe(1)
  expect(b).toBe('b')
})

test('#pick', () => {
  const store = new Storage(init)
  const state = store.pick(['a', 'b'])
  expect(state).toEqual({ a: 1, b: 'b' })
})

test('#set', () => {
  const store = new Storage(init)
  const state = store.set({ a: 10, c: false })
  const result = { a: 10, b: 'b', c: false }
  expect(state).toEqual(result)
  expect(store.latest()).toEqual(result)
})


test('#update', () => {
  const store = new Storage(init)
  const nextState = store.update(state => ({
    ...state,
    a: state.a + 1,
    b: state.b + '!',
  }))
  const result = { a: 2, b: 'b!', c: true }
  expect(nextState).toEqual(result)
  expect(store.latest()).toEqual(result)
})

test('#validate', () => {
  const store = new Storage(init)
  const result = store.validate(s => s.a > 10)
  expect(result).toBe(false)
})
