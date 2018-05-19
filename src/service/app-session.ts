import { merge } from 'rxjs'
import { filter, map } from 'rxjs/operators'
import { EventSource, select } from 'command-bus'
import { existy } from '@cotto/utils.ts'
import { INTENTS, APP_SESSION, TODO } from './shared'
import { appSessionService, AppSessionRepository } from '@/domain/app-session'
import { TodoRepository } from '@/domain/todo'

export type RepoGroup = {
  todo: TodoRepository,
  appSession: AppSessionRepository,
}

export const currentTimerTargetEpic = (ev: EventSource, repo: RepoGroup) => {
  return merge(
    select(ev, INTENTS.POMODORO_TIMER_START).pipe(
      map(action => String(action.payload.todoId)),
      map(id => repo.todo.get(id)),
      filter(existy),
      map(todo => APP_SESSION.INPUT.PATCH(s => ({ ...s, currentTimerTarget: todo }))),
    ),
    select(ev, INTENTS.POMODORO_TIMER_RESET).pipe(
      map(() => APP_SESSION.INPUT.PATCH(s => ({ ...s, currentTimerTarget: undefined }))),
    ),
    select(ev, TODO.OUTPUT.CHANGE).pipe(
      map(() => repo.appSession.get('currentTimerTarget')),
      map(target => target ? String(target.id) : ''),
      map(id => repo.todo.get(id)),
      map(todo => APP_SESSION.INPUT.PATCH(s => ({ ...s, currentTimerTarget: todo }))),
    ),
  )
}

export const bootAppSessionService = (ev: EventSource, repo: RepoGroup) => {
  return appSessionService(currentTimerTargetEpic(ev, repo), { repo: repo.appSession })
}
