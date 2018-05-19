import { observeOn, concatMap } from 'rxjs/operators'
import { asyncScheduler, of } from 'rxjs'
import { values } from '@cotto/utils.ts'
import combineEpic from '@/lib/combineEpic'
import { OUTPUT } from './command'
import * as epics from './service'

export * from './entity'
export * from './helper'
export * from './repository'

export { POMODORO_TIMER } from './command'


export type PomodoroTimerExternalApi = epics.Api

export const pomodoroTimerService = combineEpic(
  values(epics),
  (command$, api) => command$.pipe(
    concatMap(command => of(command, OUTPUT.CHANGE(api.repo.latest()))),
    observeOn(asyncScheduler),
  ),
)
