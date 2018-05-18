import Dexie from 'dexie'
import { Todo } from '@/model/todos'
import { Overwrite } from '@cotto/utils.ts'

export interface DBOptions {
  addons?: ((db: Dexie) => void)[],
  autoOpen?: boolean,
  indexedDB?: IDBFactory,
  IDBKeyRange?: { new(): IDBKeyRange }
}


export default class PomodoroTimerIDB extends Dexie {
  todos!: Dexie.Table<Overwrite<Todo, { id?: number }>, number>

  constructor(options: DBOptions = {}) {
    super('PomodoroTimerDB', options)
    this.version(1).stores({
      todos: '++id,createdAt,updatedAt',
    })
  }
}

