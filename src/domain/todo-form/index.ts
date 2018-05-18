import { map, debounceTime } from 'rxjs/operators'
import { factory, EventSource, select } from 'command-bus'
import { constant } from '@cotto/utils.ts'
import { Storage } from '@/lib/storage'

//
// ─── ENTITY ─────────────────────────────────────────────────────────────────────
//
export interface TodoFormDomainState {
  newEntryTodoContent?: string
  editingTodoId?: number
  editingTodoContent?: string
}

type S = TodoFormDomainState

//
// ─── REPOSITORYR ────────────────────────────────────────────────────────────────
//
export type TodoFormRepository = Storage<S>

export const createTodoFormRepository = (): TodoFormRepository => {
  return new Storage(constant({}))
}

//
// ─── COMMAND ────────────────────────────────────────────────────────────────────
//
const input = factory('TODO_FORM/INPUT/')
const output = factory('TODO_FORM/OUTPUT/')

export const TODO_FORM = {
  INPUT: {
    PATCH: input<(s: S) => S>('PATCH'),
  },
  OUTPUT: {
    CHANGE: output<S>('CHANGE'),
  },
}

//
// ─── SERVICE ────────────────────────────────────────────────────────────────────
//
export interface TodoFormExternalApi {
  repo: TodoFormRepository
}

export const todoFormService = (ev: EventSource, api: TodoFormExternalApi) => {
  return select(ev, TODO_FORM.INPUT.PATCH).pipe(
    map(command => command.payload),
    debounceTime(10),
    map(patch => api.repo.update(patch)),
    map(TODO_FORM.OUTPUT.CHANGE),
  )
}
