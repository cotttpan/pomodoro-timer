import { from, of, merge } from 'rxjs'
import { map, filter, catchError, flatMap, concatMap, tap } from 'rxjs/operators'
import { select, EventSource } from 'command-bus'
import { existy } from '@cotto/utils.ts'

import { TodoRepository } from './repository'
import * as entity from './entity'
import { INPUT, OUTPUT } from './command'

export interface TodoExternalApi {
  getAllUnCompletedTodos(): Promise<entity.Todo[]>
  addTodo(todo: entity.Todo): Promise<entity.Todo>
  updateTodo(todo: entity.Todo): Promise<entity.Todo>
  deleteTodo(todo: entity.Todo): Promise<entity.Todo>
}

export type Api = TodoExternalApi & { repo: TodoRepository }

export const bootEpic = (_ev: EventSource, api: Api) => {
  return from(api.getAllUnCompletedTodos()).pipe(
    map(todos => api.repo.update(entity.onBoot(todos))),
    map(OUTPUT.BOOT),
    catchError(() => of(OUTPUT.ERROR({ message: 'Failed to initial fetch...' }))),
  )
}


export const addTodoEpic = (ev: EventSource, api: Api) => {
  return select(ev, INPUT.ADD).pipe(
    map(action => action.payload),
    filter(entity.hasTodoContent),
    map(src => entity.createNewTodoEntity(src.content)),
    flatMap(src => from(api.addTodo(src)).pipe(
      tap(todo => api.repo.update(entity.onPut(todo))),
      map(OUTPUT.ADD),
      catchError(() => of(OUTPUT.ERROR({ message: 'Failed to add todo...' }))),
    )),
  )
}

export const deleteTodoEpic = (ev: EventSource, api: Api) => {
  return select(ev, INPUT.DELETE).pipe(
    map(action => api.repo.get(action.payload.id + '')),
    filter(existy),
    flatMap(todo => from(api.deleteTodo(todo)).pipe(
      tap(result => api.repo.update(entity.onDelete(result))),
      map(OUTPUT.DELETE),
      catchError(() => of(OUTPUT.ERROR({ message: 'Failed to delete todo...' }))),
    )),
  )
}

export const updateEpic = (ev: EventSource, api: Api) => {
  const todo$ = merge(
    /* content */
    select(ev, INPUT.UPDATE).pipe(
      map(command => command.payload),
      filter(entity.hasTodoContent),
      concatMap(src => of(api.repo.get(src.id + '')).pipe(
        filter(existy),
        map(todo => entity.updateTodoEntity({ ...todo, content: src.content })),
      )),
    ),
    /* milestone */
    select(ev, INPUT.INCREMENT_MILESTONE).pipe(
      map(action => api.repo.get(action.payload.id + '')),
      filter(existy),
      map(todo => entity.updateTodoEntity({ ...todo, milestone: todo.milestone + 1 })),
    ),
    /* toggle completion */
    select(ev, INPUT.TOGGLE_COMPLETION).pipe(
      map(action => api.repo.get(action.payload.id + '')),
      filter(existy),
      map(todo => entity.updateTodoEntity({ ...todo, completed: !todo.completed })),
    ),
  )
  return todo$.pipe(
    flatMap(todo => from(api.updateTodo(todo)).pipe(
      tap(result => api.repo.update(entity.onPut(result))),
      map(OUTPUT.UPDATE),
      catchError(() => of(OUTPUT.ERROR({ message: 'Failed to update todo...' }))),
    )),
  )
}
