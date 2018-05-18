import { Storage } from '@/lib/storage'
import { defaultState } from './entity'

export const createPomodoroTimerRepository = () => {
  return new Storage(defaultState)
}

export type PomodoroTimerRepository = Storage<ReturnType<typeof defaultState>>
