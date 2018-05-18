import { Storage } from '@/lib/storage'
import { defaultTodoState } from './entity'

export const createTodoReposiory = () => {
  return new Storage(defaultTodoState)
}

export type TodoRepository = Storage<ReturnType<typeof defaultTodoState>>
