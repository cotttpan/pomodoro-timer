import PomodoroTimerIDB, { DBOptions } from './db'
import { todoExternalApiImple } from './api'

const IDBOptions: DBOptions = {}

/* Setup for test env
------------------------- */
if (process.env.NODE_ENV === 'test') {
  IDBOptions.indexedDB = require('fake-indexeddb') // tslint:disable-line
  IDBOptions.IDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange')// tslint:disable-line
}

export const createDatabase = () => {
  return new PomodoroTimerIDB(IDBOptions)
}

export const createInfraApi = (idb: PomodoroTimerIDB) => ({
  ...todoExternalApiImple(idb),
})
