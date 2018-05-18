import { Observable, merge } from 'rxjs'
import { EventSource, Command } from 'command-bus'

export interface Epic<T> {
  (ev: EventSource, api: T): Observable<Command | null>
}

export interface Proxy {
  (src$: Observable<Command | null>): Observable<Command | null>
}

export default function combineEpic<T>(epics: Epic<T>[], proxy?: Proxy) {
  return (ev: EventSource, api: T) => {
    const observables = epics.map(f => f(ev, api))
    const command$ = merge(...observables)
    return proxy ? command$.pipe(proxy) : command$
  }
}
