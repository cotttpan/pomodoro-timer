import { merge } from 'rxjs'
import { filter, map } from 'rxjs/operators'
import { EventSource, select } from 'command-bus'
import { existy } from '@cotto/utils.ts'
import { RepositoryGroup, INTENTS, APP_SESSION, TODO } from './shared'
import { appSessionService } from '@/domain/app-session'

export const currentTimerTargetEpic = (ev: EventSource, repo: RepositoryGroup) => {
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

export const bootAppSessionService = (ev: EventSource, repo: RepositoryGroup) => {
  return appSessionService(currentTimerTargetEpic(ev, repo), { repo: repo.appSession })
}
