import { fromEvent, merge, timer, of } from 'rxjs'
import { switchMap, filter, map, takeUntil, share, tap, take } from 'rxjs/operators'
import { EventSource, select } from 'command-bus'
import { existy } from '@cotto/utils.ts'
import { PomodoroTimerRepository } from './repository'
import * as entity from './entity'
import { INPUT, OUTPUT } from './command'

export interface Api {
  repo: PomodoroTimerRepository
  sendNotification: (title: string, body: NotificationOptions) => Notification
}

export const bootEpic = (_: EventSource, api: Api) => {
  return of(OUTPUT.BOOT(api.repo.latest()))
}


export const startEpic = (ev: EventSource, { repo }: Api) => {
  return select(ev, INPUT.START).pipe(
    filter(() => repo.validate(entity.isPomodoroTimerStartable)),
    map(() => repo.update(entity.onStart({ timestamp: Date.now() }))),
    map(OUTPUT.START),
  )
}

export const endEpic = (ev: EventSource, { repo }: Api) => {
  const skip$ = select(ev, INPUT.SKIP)
  const timeup$ = select(ev, OUTPUT.TIMEUP)

  return merge(skip$, timeup$).pipe(
    map(() => repo.update(entity.onEnd({ timestamp: Date.now() }))),
    map(OUTPUT.END),
  )
}

export const tickEpic = (ev: EventSource, { repo }: Api) => {
  const start$ = select(ev, OUTPUT.START)
  const resume$ = select(ev, OUTPUT.RESUME)

  const pause$ = select(ev, OUTPUT.PAUSE)
  const skip$ = select(ev, INPUT.SKIP)
  const timeup$ = select(ev, OUTPUT.TIMEUP)
  const reset$ = select(ev, OUTPUT.RESET)

  const stop$ = merge(pause$, skip$, timeup$, reset$)

  return merge(start$, resume$).pipe(
    switchMap(() => timer(100, 1000).pipe(takeUntil(stop$))),
    map(() => repo.update(entity.onTick({ timestamp: Date.now() }))),
    map(OUTPUT.TICK),
  )
}


export const pauseEpic = (ev: EventSource, { repo }: Api) => {
  return select(ev, INPUT.PAUSE).pipe(
    filter(() => repo.validate(entity.isPomodoroTimerPauseable)),
    map(() => repo.update(entity.onPause)),
    map(OUTPUT.PAUSE),
  )
}

export const resumeEpic = (ev: EventSource, { repo }: Api) => {
  return select(ev, INPUT.RESUME).pipe(
    filter(() => repo.validate(entity.isPomodoroTimerPausing)),
    map(() => repo.update(entity.onResume({ timestamp: Date.now() }))),
    map(OUTPUT.RESUME),
  )
}

export const timeupEpic = (ev: EventSource, { repo }: Api) => {
  return select(ev, OUTPUT.TICK).pipe(
    filter(() => repo.validate(entity.isPomodoroTiemrTimeup)),
    map(() => repo.update(entity.onTimeUp)),
    map(OUTPUT.TIMEUP),
  )
}

export const restEpic = (ev: EventSource, { repo }: Api) => {
  return select(ev, INPUT.RESET).pipe(
    map(() => repo.update(entity.onReset)),
    map(OUTPUT.RESET),
  )
}

/**
 * timeup時にnotificationを発行する
 * notification clickから次のintervalをstartさせたいが、
 * APIの都合上、browserにforcsしてしまうため、next startの発行はしないでいる。
 */
export const notificationEpic = (ev: EventSource, api: Api) => {
  const notification$ = select(ev, OUTPUT.TIMEUP).pipe(
    switchMap(() => select(ev, OUTPUT.END).pipe(take(1))),
    map(command => command.payload.currentInterval),
    filter(existy),
    map(entity.toNotificationMessage),
    map(body => api.sendNotification('PomodoroTimer', { body })),
    share(),
  )
  return merge(
    notification$.pipe(
      map(() => OUTPUT.NOTIFICATION_SEND(api.repo.latest())),
    ),
    notification$.pipe(
      switchMap(no => fromEvent(no, 'click').pipe(
        takeUntil(select(ev, [OUTPUT.START, OUTPUT.RESUME])),
        tap(() => no.close()),
        map(() => OUTPUT.NOTIFICATION_CLOSE(api.repo.latest())),
      )),
    ),
  )
}
