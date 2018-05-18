import { makeHashGroup, omit } from '@cotto/utils.ts'

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

type S = TodosDomainState

//
// ─── HELPER / UTILS  ──────────────────────────────────────────────────────────────────────
//
export const hasTodoContent = <T extends { content: string }>(src: T) => {
  return src.content.trim().length > 0
}

export const createNewTodoEntity = (content: string): Todo => ({
  id: -1,
  content,
  completed: false,
  milestone: 0,
  createdAt: Date.now(),
  updatedAt: Date.now(),
})

export const updateTodoEntity = (todo: Todo): Todo => ({
  ...todo,
  updatedAt: Date.now(),
})

//
// ─── PATCH ──────────────────────────────────────────────────────────────────────
//
export const defaultTodoState = (): S => ({})

export const onBoot = (todos: Todo[]) => (state: S): S => {
  return { ...state, ...makeHashGroup(todos, 'id') }
}

export const onPut = (todo: Todo) => (state: S): S => {
  return { ...state, [todo.id]: todo }
}

export const onDelete = (todo: Todo) => (state: S): S => {
  return omit(state, todo.id + '')
}
