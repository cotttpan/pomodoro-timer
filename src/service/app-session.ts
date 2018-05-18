import { merge } from 'rxjs'
import { filter, map } from 'rxjs/operators'
import { EventSource, select, scoped } from 'command-bus'
import { existy } from '@cotto/utils.ts'
import { Storage } from '@/lib/storage'
import { Todo } from '@/model/todos'
import { RepositoryGroup, INTENTS, TODOS } from './common'

//
// ─── TYPES ──────────────────────────────────────────────────────────────────────
//
export interface AppSession {
  currentTimerTarget?: Todo
}

export type AppSessionRepository = Storage<AppSession>

//
// ─── REPOSITORY ─────────────────────────────────────────────────────────────────
//
export const createAppSessionRepository = (): AppSessionRepository => {
  const init = () => ({ currentTimerTarget: undefined })
  return new Storage<AppSession>(init)
}

//
// ─── COMMAND ────────────────────────────────────────────────────────────────────
//
const RESULT = scoped('APP_SESSION/RESULT/')
export const RESULTS = {
  CHANGE: RESULT<AppSession>('CHANGE'),
}

//
// ─── SERVICE ────────────────────────────────────────────────────────────────────
//
export const currentTimerTargetEpic = (ev: EventSource, repo: RepositoryGroup) => {
  return merge(
    select(ev, INTENTS.POMODORO_TIMER_START).pipe(
      map(action => String(action.payload.todoId)),
      map(id => repo.todos.get(id)),
      filter(existy),
      map(todo => repo.appSession.set({ currentTimerTarget: todo })),
      map(RESULTS.CHANGE),
    ),
    select(ev, INTENTS.POMODORO_TIMER_RESET).pipe(
      map(() => repo.appSession.set({ currentTimerTarget: undefined })),
      map(RESULTS.CHANGE),
    ),
    select(ev, TODOS.CHANGE).pipe(
      map(() => repo.appSession.get('currentTimerTarget')),
      map(todo => todo ? String(todo.id) : ''),
      map(id => repo.todos.get(id)),
      map(todo => repo.appSession.set({ currentTimerTarget: todo })),
      map(RESULTS.CHANGE),
    ),
  )
}

export const bootAppSessionService = (ev: EventSource, repo: RepositoryGroup) => {
  return currentTimerTargetEpic(ev, repo)
}
