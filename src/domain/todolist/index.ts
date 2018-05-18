import { merge } from 'rxjs'
import { map } from 'rxjs/operators'
import { factory, EventSource, select } from 'command-bus'
import { constant } from '@cotto/utils.ts'
import { Storage } from '@/lib/storage'
import { Todo } from '@/domain/todo'

//
// ─── ENTITY ─────────────────────────────────────────────────────────────────────
//
export interface TodoListDomainState {
  list: Todo[]
}

type S = TodoListDomainState

//
// ─── PATCH ──────────────────────────────────────────────────────────────────────
//
export const onAdd = (todo: Todo) => (state: S): S => {
  return { list: [todo, ...state.list] }
}

export const onDelete = (todo: Todo) => (state: S): S => {
  return { list: state.list.filter(x => x.id !== todo.id) }

}

//
// ─── REPOSITORYR ────────────────────────────────────────────────────────────────
//
export type TodoListRepository = Storage<S>

export const createTodoListRepository = (): TodoListRepository => {
  return new Storage(constant({ list: [] }))
}

//
// ─── COMMAND ────────────────────────────────────────────────────────────────────
//
const input = factory('TOODLIST/INPUT/')
const output = factory('TOODLIST/OUTPUT/')

export const INPUT = {
  BOOT: input<Todo[]>('BOOT'),
  ADD: input<Todo>('ADD'),
  DELETE: input<Todo>('DELETE'),
}

export const OUTPUT = {
  CHANGE: output<S>('CHANGE'),
}

export const TODOLIST = { INPUT, OUTPUT }

//
// ─── SERVICE ────────────────────────────────────────────────────────────────────
//
export interface TodoListExternalApi {
  repo: TodoListRepository
}

export const todoListService = (ev: EventSource, api: TodoListExternalApi) => {
  return merge(
    select(ev, INPUT.BOOT).pipe(
      map(command => command.payload),
      map(list => list.sort((a, b) => b.id - a.id)),
      map(list => api.repo.update(s => ({ ...s, list }))),
    ),
    select(ev, INPUT.ADD).pipe(
      map(action => action.payload),
      map(todo => api.repo.update(onAdd(todo))),
    ),
    select(ev, INPUT.DELETE).pipe(
      map(command => command.payload),
      map(todo => api.repo.update(onDelete(todo))),
    ),
  ).pipe(
    map(OUTPUT.CHANGE),
  )
}
