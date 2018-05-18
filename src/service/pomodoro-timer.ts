import { merge } from 'rxjs'
import { mapTo, map, filter } from 'rxjs/operators'
import { EventSource, select, Command } from 'command-bus'
import { values, existy } from '@cotto/utils.ts'
import { ACTIONS as POMODORO_TIMER_ACTIONS, bootPomodoroTimerService } from '@/model/pomodoro-timer'
import { RepositoryGroup, INTENTS, POMODORO_TIMER } from './common'

export const bootPomodoroTimerAppService = (ev: EventSource, repo: RepositoryGroup, api = { Notification }) => {
  const actions$ = merge<Command>(
    select(ev, INTENTS.POMODORO_TIMER_START).pipe(
      filter(() => repo.appSession.validate(state => state.currentTimerTarget != undefined)),
      mapTo(POMODORO_TIMER_ACTIONS.START()),
    ),
    select(ev, INTENTS.POMODORO_TIMER_PAUSE).pipe(
      mapTo(POMODORO_TIMER_ACTIONS.PAUSE()),
    ),
    select(ev, INTENTS.POMODORO_TIMER_RESUME).pipe(
      mapTo(POMODORO_TIMER_ACTIONS.RESUME()),
    ),
    select(ev, INTENTS.POMODORO_TIMER_SKIP).pipe(
      filter(() => repo.appSession.validate(s => !!s.currentTimerTarget)),
      mapTo(POMODORO_TIMER_ACTIONS.SKIP()),
    ),
    select(ev, INTENTS.POMODORO_TIMER_RESET).pipe(
      mapTo(POMODORO_TIMER_ACTIONS.RESET()),
    ),
    select(ev, INTENTS.CLEAN_COMPLETED_TODOS).pipe(
      map(() => repo.appSession.get('currentTimerTarget')),
      filter(existy),
      filter(todo => todo.completed),
      mapTo(POMODORO_TIMER_ACTIONS.RESET()),
    ),
    select(ev, values(POMODORO_TIMER)),
  )
  return bootPomodoroTimerService(actions$, repo.pomodoroTimer, api)
}
