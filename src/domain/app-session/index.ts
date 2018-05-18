import { map } from 'rxjs/operators'
import { EventSource, select, factory } from 'command-bus'
import { Storage } from '@/lib/storage'

//
// ─── ENTITY ─────────────────────────────────────────────────────────────────────
//
export interface AppSessinoState {
  currentTimerTarget?: { id: number, content: string }
}

type S = AppSessinoState

//
// ─── REPOSITORY ─────────────────────────────────────────────────────────────────
//
export type AppSessionRepository = Storage<S>

export const createAppSessionRepository = (): AppSessionRepository => {
  return new Storage((): S => ({}))
}

//
// ─── COMMAND ────────────────────────────────────────────────────────────────────
//
const input = factory('APP_SESSION/INPUT/')
const output = factory('APP_SESSION/OUTPUT/')

export const APP_SESSION = {
  INPUT: { PATCH: input<(s: S) => S>('PATCH') },
  OUTPUT: { CHANGE: output<S>('CHANGE') },
}

//
// ─── SERVICE ────────────────────────────────────────────────────────────────────
//
export type AppSessionExternalApi = {
  repo: AppSessionRepository,
}

export const appSessionService = (ev: EventSource, api: AppSessionExternalApi) => {
  return select(ev, APP_SESSION.INPUT.PATCH).pipe(
    map(command => command.payload),
    map(patch => api.repo.update(patch)),
    map(APP_SESSION.OUTPUT.CHANGE),
  )
}
