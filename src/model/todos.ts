import { Observable, from, of, merge, asyncScheduler } from 'rxjs'
import { map, filter, catchError, flatMap, concatMap, observeOn } from 'rxjs/operators'
import { omit, makeHashGroup, existy, not } from '@cotto/utils.ts'
import { EventSource, scoped, select } from 'command-bus'
import Storage from '@/lib/storage'
import { PROCESS_ERROR } from './common'
//
// ─── TYPES ──────────────────────────────────────────────────────────────────────
//
export interface Todo {
  id: number
  content: string
  completed: boolean
  milestone: number
  createdAt: number
  updatedAt: number
}

export interface TodosDomainState {
  [id: string]: Todo
}

export type TodosRepository = Storage<TodosDomainState>

type Repo = TodosRepository
type S = TodosDomainState

export interface Api {
  getAllUnCompletedTodos(): Promise<Todo[]>
  addTodo(todo: Todo): Promise<Todo>
  updateTodo(todo: Todo): Promise<Todo>
  deleteTodo(todo: Todo): Promise<Todo>
}

//
// ─── ENTITY UTILS ─────────────────────────────────────────────────────────────────────
//
export const createNewTodo = (content: string): Todo => ({
  id: -1,
  content,
  completed: false,
  milestone: 0,
  createdAt: Date.now(),
  updatedAt: Date.now(),
})

export const updateTodo = (todo: Todo): Todo => ({
  ...todo,
  updatedAt: Date.now(),
})

export const isEmptyContent = (src: { content: string }) => {
  return src.content.trim().length <= 0
}

//
// ─── REPOSITORY ──────────────────────────────────────────────────────────────────────
//
export const createTodosRepository = () => {
  return new Storage(initialTodosDomainState)
}

export const initialTodosDomainState = (): S => ({})

export const onBoot = (todos: Todo[]) => (state: S) => {
  return { ...state, ...makeHashGroup(todos, 'id') }
}

export const onPut = (todo: Todo) => (state: S): S => {
  return { ...state, [todo.id]: todo }
}

export const onDelete = (todo: Todo) => (state: S): S => {
  return omit(state, todo.id + '')
}

//
// ─── COMMAND ────────────────────────────────────────────────────────────────────
//
const ACTION = scoped('TODOS/ACTION/')
const RESULT = scoped('TODOS/RESULT/')

export const ACTIONS = {
  /* todo */
  ADD_NEW_TODO: ACTION<{ content: string }>('ADD_NEW_TODO'),
  DELETE_TODO: ACTION<{ id: number }>('DELETE_TODO'),
  UPDATE_TODO_CONTENT: ACTION<{ id: number, content: string }>('UPDATE_TODO_CONTENT'),
  INCREMENT_MILESTONE: ACTION<{ id: number }>('MILESTONEW_CHANGE'),
  TOGGLE_COMPLETION: ACTION<{ id: number }>('TOGGLE_COMPLETION'),
}

export const RESULTS = {
  BOOT: RESULT<TodosDomainState>('BOOT'),
  ADD: RESULT<Todo>('ADD'),
  UPDATE: RESULT<Todo>('UPDATE'),
  DELETE: RESULT<Todo>('DELETE'),
  CHANGE: RESULT<TodosDomainState>('CHANGE'),
}

//
// ─── SERVICE / PROCESS ────────────────────────────────────────────────────────────────────
//
export const addTodoProcess = (repo: Repo, api: Api) => (todo$: Observable<Todo>) => {
  return todo$.pipe(
    flatMap(src => from(api.addTodo(src)).pipe(
      flatMap(todo => of(repo.update(onPut(todo))).pipe(
        map(() => RESULTS.ADD(todo)),
      )),
      catchError(() => of(PROCESS_ERROR({ message: 'Failed to add todo...' }))),
    )),
  )
}

export const updateTodoProcess = (repo: Repo, api: Api) => (todo$: Observable<Todo>) => {
  return todo$.pipe(
    flatMap(todo => from(api.updateTodo(todo)).pipe(
      map(result => repo.update(onPut(result))),
      map(todos => RESULTS.UPDATE(todos[todo.id])),
      catchError(() => of(PROCESS_ERROR({ message: 'Failed to update todo...' }))),
    )),
  )
}

export const deleteTodoProcess = (repo: Repo, api: Api) => (todo$: Observable<Todo>) => {
  return todo$.pipe(
    flatMap(todo => from(api.deleteTodo(todo)).pipe(
      map(result => repo.update(onDelete(result))),
      map(() => RESULTS.DELETE(todo)),
      catchError(() => of(PROCESS_ERROR({ message: 'Failed to delete todo...' }))),
    )),
  )
}


//
// ─── SERVICE / EPIC ────────────────────────────────────────────────────────────────────
//
export const bootEpic = (_ev: EventSource, repo: Repo, api: Api) => {
  return from(api.getAllUnCompletedTodos()).pipe(
    map(todos => repo.update(onBoot(todos))),
    map(RESULTS.BOOT),
    catchError(() => of(PROCESS_ERROR({ message: 'Failed to initial fetch...' }))),
  )
}

export const addTodoEpic = (ev: EventSource, repo: Repo, api: Api) => {
  return select(ev, ACTIONS.ADD_NEW_TODO).pipe(
    map(action => action.payload),
    filter(not(isEmptyContent)),
    map(src => createNewTodo(src.content)),
    addTodoProcess(repo, api),
  )
}

export const deleteTodoEpic = (ev: EventSource, repo: Repo, api: Api) => {
  return select(ev, ACTIONS.DELETE_TODO).pipe(
    map(action => repo.get(action.payload.id + '')),
    filter(existy),
    deleteTodoProcess(repo, api),
  )
}

export const updateTodoContentEpic = (ev: EventSource, repo: Repo, api: Api) => {
  return select(ev, ACTIONS.UPDATE_TODO_CONTENT).pipe(
    filter(action => !isEmptyContent(action.payload)),
    concatMap(action => of(repo.get(action.payload.id + '')).pipe(
      filter(existy),
      map(todo => ({ ...todo, content: action.payload.content })),
      map(updateTodo),
      updateTodoProcess(repo, api),
    )),
  )
}

export const incrementMileStoreEpic = (ev: EventSource, repo: Repo, api: Api) => {
  return select(ev, ACTIONS.INCREMENT_MILESTONE).pipe(
    map(action => repo.get(action.payload.id + '')),
    filter(existy),
    map(todo => updateTodo({ ...todo, milestone: todo.milestone + 1 })),
    updateTodoProcess(repo, api),
  )
}

export const toggleTodoCompletetionEpic = (ev: EventSource, repo: Repo, api: Api) => {
  return select(ev, ACTIONS.TOGGLE_COMPLETION).pipe(
    map(action => repo.get(action.payload.id + '')),
    filter(existy),
    map(todo => updateTodo({ ...todo, completed: !todo.completed })),
    updateTodoProcess(repo, api),
  )
}

export const bootToodsService = (ev: EventSource, repo: Repo, api: Api) => {
  return merge(
    bootEpic(ev, repo, api),
    addTodoEpic(ev, repo, api),
    deleteTodoEpic(ev, repo, api),
    updateTodoContentEpic(ev, repo, api),
    incrementMileStoreEpic(ev, repo, api),
    toggleTodoCompletetionEpic(ev, repo, api),
  ).pipe(
    concatMap(command => from([command, RESULTS.CHANGE(repo.latest())])),
    observeOn(asyncScheduler),
  )
}
