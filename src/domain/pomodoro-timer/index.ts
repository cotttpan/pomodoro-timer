import { observeOn } from 'rxjs/operators'
import { asyncScheduler } from 'rxjs'
import { values } from '@cotto/utils.ts'
import combineEpic from '@/lib/combineEpic'
import * as epics from './service'

export * from './entity'
export * from './helper'
export * from './repository'

export { POMODORO_TIMER } from './command'


export type PomodoroTimerExternalApi = epics.Api

export const pomodoroTimerService = combineEpic(
  values(epics),
  observeOn(asyncScheduler),
)
