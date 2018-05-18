import { factory } from 'command-bus'
import { TodosDomainState as S, Todo } from './entity'

const input = factory('TODOS/INPUT/')
const output = factory('TODOS/OUTPUT/')

export const INPUT = {
  ADD: input<{ content: string }>('ADD'),
  DELETE: input<{ id: number }>('DELETE'),
  UPDATE: input<{ id: number, content: string }>('UPDATE'),
  INCREMENT_MILESTONE: input<{ id: number }>('INCREMENT_MILESTONE'),
  TOGGLE_COMPLETION: input<{ id: number }>('TOGGLE_COMPLETION'),
}

export const OUTPUT = {
  BOOT: output<S>('BOOT'),
  ADD: output<Todo>('ADD'),
  UPDATE: output<Todo>('UPDATE'),
  DELETE: output<Todo>('DELETE'),
  CHANGE: output<S>('CHANGE'),
  ERROR: output<{ message: string }>('ERROR'),
}

export const TODO = { INPUT, OUTPUT }
