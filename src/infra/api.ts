import { Todo, Api as TodoCrudApi } from '@/model/todos'
import IDB from './db'
import { omit } from '@cotto/utils.ts'

export default (idb: IDB): TodoCrudApi => ({
  getAllUnCompletedTodos(): Promise<Todo[]> {
    return idb.transaction('r', idb.todos, async () => {
      return idb.todos.toCollection()
        .filter(todo => !Boolean(todo.completed))
        .sortBy('updatedAt')
    })
  },

  addTodo(todo: Todo): Promise<Todo> {
    return idb.transaction('rw', idb.todos, async () => {
      const id = await idb.todos.put(omit(todo, 'id'))
      return idb.todos.get(id)!
    })
  },

  updateTodo(todo: Todo): Promise<Todo> {
    return idb.transaction('rw', idb.todos, async () => {
      await idb.todos.put(todo)
      return todo
    })
  },

  deleteTodo(todo: Todo): Promise<Todo> {
    return idb.transaction('rw', idb.todos, async () => {
      await idb.todos.delete(todo.id)
      return todo
    })
  },
})
