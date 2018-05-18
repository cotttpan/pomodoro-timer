import PomodoroTimerIDB, { DBOptions } from './db'

export const createDatabase = () => {
  const IDBOptions: DBOptions = {
  }

  /* Setup for test env
  ------------------------- */
  if (process.env.NODE_ENV === 'test') {
    IDBOptions.indexedDB = require('fake-indexeddb') // tslint:disable-line
    IDBOptions.IDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange')// tslint:disable-line
  }

  return new PomodoroTimerIDB(IDBOptions)
}

export { default as createInfraApi } from './api'
