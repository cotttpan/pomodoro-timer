import { merge } from 'rxjs'
import { mapTo, map, filter } from 'rxjs/operators'
import { EventSource, select, Command } from 'command-bus'
import { values, existy } from '@cotto/utils.ts'
import { pomodoroTimerService, PomodoroTimerRepository, PomodoroTimerExternalApi } from '@/domain/pomodoro-timer'
import { AppSessionRepository } from '@/domain/app-session'
import { TodoRepository } from '@/domain/todo'
import { INTENTS, POMODORO_TIMER } from './shared'

type RepositoryGroup = {
  appSession: AppSessionRepository
  pomodoroTimer: PomodoroTimerRepository,
  todo: TodoRepository,
}

export const bootPomodoroTimerAppService = (ev: EventSource, repo: RepositoryGroup, api = { Notification }) => {
  const domainApi: PomodoroTimerExternalApi = {
    repo: repo.pomodoroTimer,
    sendNotification: (title: string, opts: NotificationOptions) => {
      return new api.Notification(title, opts)
    },
  }

  const actions$ = merge<Command>(
    select(ev, INTENTS.POMODORO_TIMER_START).pipe(
      filter(() => repo.appSession.validate(state => state.currentTimerTarget != undefined)),
      mapTo(POMODORO_TIMER.INPUT.START()),
    ),
    select(ev, INTENTS.POMODORO_TIMER_PAUSE).pipe(
      mapTo(POMODORO_TIMER.INPUT.PAUSE()),
    ),
    select(ev, INTENTS.POMODORO_TIMER_RESUME).pipe(
      mapTo(POMODORO_TIMER.INPUT.RESUME()),
    ),
    select(ev, INTENTS.POMODORO_TIMER_SKIP).pipe(
      filter(() => repo.appSession.validate(s => !!s.currentTimerTarget)),
      mapTo(POMODORO_TIMER.INPUT.SKIP()),
    ),
    select(ev, INTENTS.POMODORO_TIMER_RESET).pipe(
      mapTo(POMODORO_TIMER.INPUT.RESET()),
    ),
    select(ev, INTENTS.CLEAN_COMPLETED_TODOS).pipe(
      map(() => repo.appSession.get('currentTimerTarget')),
      filter(existy),
      map(src => repo.todo.get(src.id + '')),
      filter(existy),
      filter(todo => todo.completed),
      mapTo(POMODORO_TIMER.INPUT.RESET()),
    ),
    select(ev, values(POMODORO_TIMER.OUTPUT)),
  )
  return pomodoroTimerService(actions$, domainApi)
}
