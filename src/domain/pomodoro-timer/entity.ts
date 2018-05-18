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

type S = PomodoroTimerDomainState

//
// ─── VALIDATION ─────────────────────────────────────────────────────────────────
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

//
// ─── HELPER ─────────────────────────────────────────────────────────────────────
//
export const calcNextInterval = (state: S): INTERVAL_TYPE => {
  const { currentInterval, achieveCount } = state

  if (currentInterval !== INTERVAL_TYPE.WORK_INTERVAL) {
    return INTERVAL_TYPE.WORK_INTERVAL
  } else if (achieveCount !== 0 && achieveCount % state.config.LONG_BREAK_AFTER === 0) {
    return INTERVAL_TYPE.LONG_BREAK_INTERVAL
  } else {
    return INTERVAL_TYPE.SHORT_BREAK_INTERVAL
  }
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
// ─── PATCH ──────────────────────────────────────────────────────────────────────
//
export const defaultState = (state?: Partial<S>): S => ({
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
  ...state,
})

export const onStart = (src: { timestamp: number }) => (state: S): S => {
  const currentInterval = state.currentInterval === null
    ? calcNextInterval(state)
    : state.currentInterval
  const interval = state.config[currentInterval]
  const end = src.timestamp + interval
  const left = interval
  const isWorking = true
  const isPausing = false
  return { ...state, currentInterval, end, left, isWorking, isPausing }
}

export const onEnd = (src: { timestamp: number }) => (state: S): S => {
  const currentInterval = calcNextInterval(state)
  const interval = state.config[currentInterval]
  const end = src.timestamp + interval
  const left = interval
  const isWorking = false
  const isPausing = false
  return { ...state, currentInterval, end, left, isWorking, isPausing }
}

export const onTick = (src: { timestamp: number }) => (state: S): S => {
  const left = Math.max(0, state.end - src.timestamp)
  return { ...state, left }
}

export const onPause = (state: S): S => {
  const isWorking = false
  const isPausing = true
  return { ...state, isWorking, isPausing }
}

export const onResume = (src: { timestamp: number }) => (state: S): S => {
  const end = src.timestamp + state.left
  const left = Math.max(0, end - src.timestamp)
  return { ...state, end, left, isWorking: true, isPausing: false }
}

export const onTimeUp = (state: S): S => {
  const achieveCount = state.currentInterval === INTERVAL_TYPE.WORK_INTERVAL
    ? state.achieveCount + 1
    : state.achieveCount
  const isWorking = false
  const isPausing = false
  return { ...state, achieveCount, isWorking, isPausing }
}

export const onReset = (state: S): S => {
  const achieveCount = state.achieveCount
  return defaultState({ achieveCount })
}
