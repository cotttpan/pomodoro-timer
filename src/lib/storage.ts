import { pick } from '@cotto/utils.ts'

const clone = <T, K extends keyof T>(a: T, b?: Pick<T, K>): T => {
  return Object.assign({}, a, b)
}

export interface ReadonlyStorage<T> {
  latest(): T
  get<K extends keyof T>(key: K): T[K]
  pick<K extends keyof T>(keys: K[]): Pick<T, K>
  validate(predicate: (state: T) => boolean): boolean
}

export class Storage<T> implements ReadonlyStorage<T> {
  private state: T

  constructor(init: () => T) {
    this.state = init()
  }
  latest() {
    return clone(this.state)
  }
  get<K extends keyof T>(key: K) {
    return this.state[key]
  }
  pick<K extends keyof T>(keys: K[]) {
    return pick(this.state, keys)
  }
  set<K extends keyof T>(nextState: Pick<T, K>) {
    this.state = clone(this.state, nextState)
    return this.state
  }
  update<K extends keyof T>(patch: (state: T) => Pick<T, K>) {
    this.state = clone(this.state, patch(this.state))
    return this.state
  }
  validate(predicate: (state: T) => boolean) {
    return predicate(this.state)
  }
}

export default Storage
