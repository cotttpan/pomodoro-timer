import { observeOn, concatMap } from 'rxjs/operators'
import { asyncScheduler, from } from 'rxjs'
import { EventSource } from 'command-bus'
import { values } from '@cotto/utils.ts'
import combineEpic from '@/lib/combineEpic'
import * as epics from './service'
import { OUTPUT } from './command'

export * from './entity'
export * from './repository'
export { TODO } from './command'

export type PomodoroTimerExternalApi = epics.Api

export const todoService = (ev: EventSource, api: PomodoroTimerExternalApi) => {
  const service = combineEpic(values(epics))
  return service(ev, api).pipe(
    concatMap(command => from([
      command,
      OUTPUT.CHANGE(api.repo.latest()),
    ])),
    observeOn(asyncScheduler),
  )
}
