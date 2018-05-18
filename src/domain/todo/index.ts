import { observeOn, concatMap } from 'rxjs/operators'
import { asyncScheduler, from } from 'rxjs'
import { EventSource } from 'command-bus'
import { values } from '@cotto/utils.ts'
import combineEpic from '@/lib/combineEpic'
import * as epics from './service'
import { TodoExternalApi } from './service' // tslint:disable-line
import { OUTPUT } from './command'

export * from './entity'
export * from './repository'
export { TODO } from './command'
export { TodoExternalApi }

export const todoService = (ev: EventSource, api: epics.Api) => {
  const service = combineEpic(values(epics))
  return service(ev, api).pipe(
    concatMap(command => from([
      command,
      OUTPUT.CHANGE(api.repo.latest()),
    ])),
    observeOn(asyncScheduler),
  )
}
