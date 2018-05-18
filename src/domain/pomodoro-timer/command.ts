import { factory } from 'command-bus'
import { PomodoroTimerDomainState as S } from './entity'

const input = factory('POMODORO_TIMER/INPUT/')
const output = factory('POMODORO_TIMER/INPUT/')

export const INPUT = {
  START: input('START'),
  PAUSE: input('PAUSE'),
  RESUME: input('RESUME'),
  SKIP: input('SKIP'),
  RESET: input('RESET'),

}

export const OUTPUT = {
  BOOT: output<S>('BOOT'),
  START: output<S>('START'),
  END: output<S>('END'),
  TICK: output<S>('TICK'),
  TIMEUP: output<S>('TIMEUP'),
  PAUSE: output<S>('PAUSE'),
  RESUME: output<S>('RESUME'),
  RESET: output<S>('RESET'),
  NOTIFICATION_SEND: output<S>('NOTIFICATION_SEND'),
  NOTIFICATION_CLOSE: output<S>('NOTIFICATION_CLOSE'),
  CHANGE: output<S>('CHANGE'),
}

export const POMODORO_TIMER = {
  INPUT,
  OUTPUT,
}
