import { merge } from 'rxjs'
import { map, filter, switchMap, take } from 'rxjs/operators'
import { EventSource, select, Command } from 'command-bus'
import { existy, values } from '@cotto/utils.ts'
import {
  ACTIONS as TODOS_ACTIONS,
  bootToodsService,
  Api as InfraApi,
} from '@/model/todos'
import { INTENTS, POMODORO_TIMER, TODOS, RepositoryGroup } from './common'

export const bootToodsAppService = (ev: EventSource, repo: RepositoryGroup, api: InfraApi) => {
  const actions$ = merge<Command>(
    select(ev, INTENTS.ADD_TODO).pipe(
      map(action => TODOS_ACTIONS.ADD_NEW_TODO(action.payload)),
    ),
    select(ev, INTENTS.UPDATE_TODO).pipe(
      map(action => TODOS_ACTIONS.UPDATE_TODO_CONTENT(action.payload)),
    ),
    select(ev, INTENTS.DELETE_TODO).pipe(
      map(action => TODOS_ACTIONS.DELETE_TODO(action.payload)),
    ),
    select(ev, INTENTS.TOGGLE_TODO_COMPLETION).pipe(
      map(action => TODOS_ACTIONS.TOGGLE_COMPLETION(action.payload)),
    ),
    select(ev, POMODORO_TIMER.TIMEUP).pipe(
      switchMap(() => select(ev, POMODORO_TIMER.END).pipe(
        take(1),
        map(() => repo.appSession.get('currentTimerTarget')),
        filter(existy),
        map(todo => TODOS_ACTIONS.INCREMENT_MILESTONE({ id: todo.id })),
      )),
    ),
    select<any>(ev, values(TODOS)),
  )
  return bootToodsService(actions$, repo.todos, api)
}

