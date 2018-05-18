import { connect } from 'react-redux'
import { createReducer, caseOf } from 'typed-reducer'
import { values } from '@cotto/utils.ts'
import { POMODORO_TIMER, APP_SESSION } from '@/service'
import { toDisplayTime } from '@/model/pomodoro-timer'
import { PomodoroTimerState } from '@/view/container/PomodoroTimerContainer'

export { PomodoroTimerState }

export const POMODORO_TIMER_STORE_KEY = 'pomodoroTimer'

export const getPomodoroTiemrState = (state: any): PomodoroTimerState => {
  return state[POMODORO_TIMER_STORE_KEY]
}

export const connectPomodoroTimerStore = connect(getPomodoroTiemrState)

const init = (): PomodoroTimerState => ({
  title: '',
  time: { min: '25', sec: '00' },
  isTimerPauseable: false,
  isTimerResumeable: false,
})

export const pomodoroTimerReducer = createReducer(init)(
  caseOf(APP_SESSION.CHANGE, (state, action) => {
    const todo = action.payload.currentTimerTarget
    const title = todo ? todo.content : init().title
    return { ...state, title }
  }),
  caseOf(values(POMODORO_TIMER), (state, action) => {
    const { isWorking, isPausing, left } = action.payload
    const isTimerPauseable = isWorking && !isPausing
    const isTimerResumeable = !isWorking && isPausing
    const time = toDisplayTime(left)
    return { ...state, time, isTimerPauseable, isTimerResumeable }
  }),
)

