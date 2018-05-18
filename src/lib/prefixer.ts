import { identity } from '@cotto/utils.ts'

export type Factory<T = string> = (val: T) => string

const defaults = identity as Factory<any>

export default function prefixer<T = string>(constant: string, fn: Factory<T> = defaults) {
  return (val: T) => `${constant}${fn(val)}`
}
