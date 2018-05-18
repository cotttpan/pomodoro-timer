import { observeOn, concatMap } from 'rxjs/operators'
import { asyncScheduler, from } from 'rxjs'
import { values } from '@cotto/utils.ts'
import { EventSource } from 'command-bus'
import combineEpic from '@/lib/combineEpic'
import { OUTPUT } from './command'
import * as epics from './service'

export * from './entity'
export * from './helper'
export * from './repository'

export { POMODORO_TIMER } from './command'


export type PomodoroTimerExternalApi = epics.Api

export const pomodoroTimerService = (ev: EventSource, api: epics.Api) => {
  return combineEpic(values(epics))(ev, api).pipe(
    concatMap(command => from([
      command,
      OUTPUT.CHANGE(api.repo.latest()),
    ])),
    observeOn(asyncScheduler),
  )
}
