import { fromEvent, merge, timer, of, from, asyncScheduler } from 'rxjs'
import { switchMap, filter, map, takeUntil, share, tap, take, observeOn, concatMap } from 'rxjs/operators'
import { scoped, EventSource, select } from 'command-bus'
import { mapValues, existy } from '@cotto/utils.ts'
import pad from '@/lib/pad'
import Storage from '@/lib/storage'

//
// ─── TYPES ──────────────────────────────────────────────────────────────────────
//
export enum INTERVAL_TYPE {
  WORK_INTERVAL = 'WORK_INTERVAL',
  SHORT_BREAK_INTERVAL = 'SHORT_BREAK_INTERVAL',
  LONG_BREAK_INTERVAL = 'LONG_BREAK_INTERVAL',
}

export interface PomorodoTimerTime {
  end: number
  left: number
}

export interface PomodoroTimerSession {
  isWorking: boolean
  isPausing: boolean
  currentInterval: INTERVAL_TYPE | null
  achieveCount: number
}

export interface PomodoroTimerConfig {
  WORK_INTERVAL: number
  SHORT_BREAK_INTERVAL: number,
  LONG_BREAK_INTERVAL: number,
  LONG_BREAK_AFTER: number,
}

export interface PomodoroTimerDomainState extends PomorodoTimerTime, PomodoroTimerSession {
  config: PomodoroTimerConfig
}

export type PomodoroTimerRepository = Storage<PomodoroTimerDomainState>

type S = PomodoroTimerDomainState
type Repo = PomodoroTimerRepository

export type Api = { Notification: typeof Notification }
//
// ─── HELPERS ──────────────────────────────────────────────────────────────────────
//
export const isPomodoroTimerStartable = (state: S) => {
  return !state.isWorking && !state.isPausing
}

export const isPomodoroTimerPauseable = (state: S) => {
  return state.isWorking && !state.isPausing
}

export const isPomodoroTimerPausing = (state: S) => {
  return Boolean(state.isPausing)
}

export const isPomodoroTiemrTimeup = (state: S) => {
  return state.isWorking && state.left <= 1000
}

export const calcNextInterval = (state: PomodoroTimerDomainState) => {
  const { currentInterval, achieveCount } = state

  if (currentInterval !== INTERVAL_TYPE.WORK_INTERVAL) {
    return INTERVAL_TYPE.WORK_INTERVAL
  } else if (achieveCount !== 0 && achieveCount % state.config.LONG_BREAK_AFTER === 0) {
    return INTERVAL_TYPE.LONG_BREAK_INTERVAL
  } else {
    return INTERVAL_TYPE.SHORT_BREAK_INTERVAL
  }
}

const padZero = (n: number) => pad(Math.max(0, n), '0', 2)

export const toDisplayTime = (time: number) => {
  const hour = Math.floor(time / 1000 / 60 / 60) % 60
  const min = Math.floor(time / 1000 / 60) % 60
  const sec = Math.floor(time / 1000) % 60
  return mapValues({ hour, min, sec }, padZero)
}

export const toNotificationMessage = (type: INTERVAL_TYPE) => {
  const text = type.toLowerCase().replace(/_|interval/g, ' ')
  if (text.includes('break')) {
    return `Time to take a ${text}`
  } else {
    return `Time to ${text}`
  }
}

//
// ─── REPOSITORY ────────────────────────────────────────────────────────────────────
//
export const createPomodoroTimerRepository = () => {
  return new Storage(initialPomodoroTimerState)
}

export const initialPomodoroTimerState = (): S => ({
  left: 0,
  end: 0,
  isWorking: false,
  isPausing: false,
  currentInterval: null,
  achieveCount: 0,
  config: {
    WORK_INTERVAL: 25 * 60 * 1000,
    SHORT_BREAK_INTERVAL: 5 * 60 * 1000,
    LONG_BREAK_INTERVAL: 15 * 60 * 1000,
    LONG_BREAK_AFTER: 4,
  },
})

//
// ─── COMMAND ────────────────────────────────────────────────────────────────────
//
const ACTION = scoped('POMODORO_TIMER/ACTION/')
const RESULT = scoped('POMODORO_TIMER/RESULT/')

export const ACTIONS = {
  START: ACTION('START'),
  PAUSE: ACTION('PAUSE'),
  RESUME: ACTION('RESUME'),
  SKIP: ACTION('SKIP'),
  RESET: ACTION('RESET'),
}

export const RESULTS = {
  BOOT: RESULT<S>('BOOT'),
  START: RESULT<S>('START'),
  END: RESULT<S>('END'),
  TICK: RESULT<S>('TICK'),
  TIMEUP: RESULT<S>('TIMEUP'),
  PAUSE: RESULT<S>('PAUSE'),
  RESUME: RESULT<S>('RESUME'),
  RESET: RESULT<S>('RESET'),
  NOTIFICATION_SEND: RESULT<S>('NOTIFICATION_SEND'),
  NOTIFICATION_CLOSE: RESULT<S>('NOTIFICATION_CLOSE'),
  CHANGE: RESULT<S>('CHANGE'),
}

//
// ─── SERVICE ────────────────────────────────────────────────────────────────────
//
const mapTimestamp = map(Date.now)

export const bootEpic = (_: EventSource, repo: Repo) => {
  return of(RESULTS.BOOT(repo.latest()))
}

export const startEpic = (ev: EventSource, repo: Repo) => {
  const onStart = (timestamp: number) => (state: S): S => {
    const currentInterval = state.currentInterval === null
      ? calcNextInterval(state)
      : state.currentInterval
    const interval = state.config[currentInterval]
    const end = timestamp + interval
    const left = interval
    const isWorking = true
    const isPausing = false
    return { ...state, currentInterval, end, left, isWorking, isPausing }
  }
  return select(ev, ACTIONS.START).pipe(
    filter(() => repo.validate(isPomodoroTimerStartable)),
    mapTimestamp,
    map(now => repo.update(onStart(now))),
    map(RESULTS.START),
  )
}

export const endEpic = (ev: EventSource, repo: Repo) => {
  const onEnd = (timestamp: number) => (state: S): S => {
    const currentInterval = calcNextInterval(state)
    const interval = state.config[currentInterval]
    const end = timestamp + interval
    const left = interval
    const isWorking = false
    const isPausing = false
    return { ...state, currentInterval, end, left, isWorking, isPausing }
  }
  const skip$ = select(ev, ACTIONS.SKIP)
  const timeup$ = select(ev, RESULTS.TIMEUP)
  return merge(skip$, timeup$).pipe(
    mapTimestamp,
    map(now => repo.update(onEnd(now))),
    map(RESULTS.END),
  )
}

export const tickEpic = (ev: EventSource, repo: Repo) => {
  const onTick = (timestamp: number) => (state: S) => {
    const left = Math.max(0, state.end - timestamp)
    return { ...state, left }
  }

  const start$ = select(ev, RESULTS.START)
  const resume$ = select(ev, RESULTS.RESUME)
  const pause$ = select(ev, RESULTS.PAUSE)
  const skip$ = select(ev, ACTIONS.SKIP)
  const timeup$ = select(ev, RESULTS.TIMEUP)
  const reset$ = select(ev, RESULTS.RESET)
  const stop$ = merge(pause$, skip$, timeup$, reset$)

  return merge(start$, resume$).pipe(
    switchMap(() => timer(100, 1000).pipe(takeUntil(stop$))),
    mapTimestamp,
    map(onTick),
    map(patch => repo.update(patch)),
    map(RESULTS.TICK),
  )
}

export const pauseEpic = (ev: EventSource, repo: Repo) => {
  const onPause = (state: S) => {
    const isWorking = false
    const isPausing = true
    return { ...state, isWorking, isPausing }
  }

  return select(ev, ACTIONS.PAUSE).pipe(
    filter(() => repo.validate(isPomodoroTimerPauseable)),
    map(() => repo.update(onPause)),
    map(RESULTS.PAUSE),
  )
}

export const resumeEpic = (ev: EventSource, repo: Repo) => {
  const onResume = (timestamp: number) => (state: S): S => {
    const end = timestamp + state.left
    const left = Math.max(0, end - timestamp)
    return { ...state, end, left, isWorking: true, isPausing: false }
  }
  return select(ev, ACTIONS.RESUME).pipe(
    filter(() => repo.validate(isPomodoroTimerPausing)),
    mapTimestamp,
    map(now => repo.update(onResume(now))),
    map(RESULTS.RESUME),
  )
}

export const timeupEpic = (ev: EventSource, repo: Repo) => {
  const onTimeUp = (state: S): S => {
    const achieveCount = state.currentInterval === INTERVAL_TYPE.WORK_INTERVAL
      ? state.achieveCount + 1
      : state.achieveCount
    const isWorking = false
    const isPausing = false
    return { ...state, achieveCount, isWorking, isPausing }
  }

  return select(ev, RESULTS.TICK).pipe(
    filter(() => repo.validate(isPomodoroTiemrTimeup)),
    map(() => repo.update(onTimeUp)),
    map(RESULTS.TIMEUP),
  )
}

export const restEpic = (ev: EventSource, repo: Repo) => {
  const onReset = (state: S) => {
    const achieveCount = state.achieveCount
    return { ...initialPomodoroTimerState(), achieveCount }
  }
  return select(ev, ACTIONS.RESET).pipe(
    map(() => repo.update(onReset)),
    map(RESULTS.RESET),
  )
}

/**
 * timeup時にnotificationを発行する
 * notification clickから次のintervalをstartさせたいが、
 * APIの都合上、browserにforcsしてしまうため、next startの発行はしないでいる。
 */
export const notificationEpic = (ev: EventSource, repo: Repo, api = Notification) => {
  const notification$ = select(ev, RESULTS.TIMEUP).pipe(
    switchMap(() => select(ev, RESULTS.END).pipe(take(1))),
    map(command => command.payload.currentInterval),
    filter(existy),
    map(toNotificationMessage),
    map(body => new api('PomodoroTimer', { body })),
    share(),
  )
  const send$ = notification$.pipe(
    map(() => repo.latest()),
    map(RESULTS.NOTIFICATION_SEND),
  )
  const close$ = notification$.pipe(
    switchMap(no => fromEvent(no, 'click').pipe(
      takeUntil(select(ev, [RESULTS.START, RESULTS.RESUME])),
      tap(() => no.close()),
    )),
    map(() => repo.latest()),
    map(RESULTS.NOTIFICATION_CLOSE),
  )
  return merge(send$, close$).pipe(share())
}

export const bootPomodoroTimerService = (ev: EventSource, repo: Repo, api: Api) => {
  return merge(
    startEpic(ev, repo),
    endEpic(ev, repo),
    tickEpic(ev, repo),
    pauseEpic(ev, repo),
    resumeEpic(ev, repo),
    timeupEpic(ev, repo),
    restEpic(ev, repo),
    notificationEpic(ev, repo, api.Notification),
  ).pipe(
    concatMap(command => from([command, RESULTS.CHANGE(repo.latest())])),
    observeOn(asyncScheduler),
  )
}
