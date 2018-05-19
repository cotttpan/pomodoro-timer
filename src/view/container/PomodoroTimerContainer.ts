import * as React from 'react'
import { connect, Dispatch } from 'react-redux'
import { createReducer, caseOf } from 'typed-reducer'
import { INTENTS, POMODORO_TIMER, APP_SESSION } from '@/service'
import { toDisplayTime } from '@/domain/pomodoro-timer'

export interface PomodoroTimerState {
  title: string
  time: { min: string, sec: string }
  isTimerPauseable: boolean
  isTimerResumeable: boolean
}

interface PomodoroTimerAction {
  pause: React.EventHandler<any>
  resume: React.EventHandler<any>
  skip: React.EventHandler<any>
  reset: React.EventHandler<any>
}

//
// ─── STORE ────────────────────────────────────────────────────────────────────
//
export interface PomodoroTimerStoreState {
  pomodoroTimer: PomodoroTimerState
}

const init = (): PomodoroTimerState => ({
  title: '',
  time: { min: '25', sec: '00' },
  isTimerPauseable: false,
  isTimerResumeable: false,
})

export const pomodoroTimerReducer = createReducer(init)(
  caseOf(
    POMODORO_TIMER.OUTPUT.CHANGE,
    (state, action) => {
      const { isWorking, isPausing, left } = action.payload
      const isTimerPauseable = isWorking && !isPausing
      const isTimerResumeable = !isWorking && isPausing
      const time = toDisplayTime(left)
      return { ...state, isTimerResumeable, isTimerPauseable, time }
    },
  ),
  caseOf(
    APP_SESSION.OUTPUT.CHANGE,
    (state, action) => {
      const target = action.payload.currentTimerTarget
      const title = target ? target.content : init().title
      return { ...state, title }
    },
  ),
)

const selectPomodoroTimerState = (state: PomodoroTimerStoreState): PomodoroTimerState => {
  return state.pomodoroTimer
}

//
// ─── CONTAINER ──────────────────────────────────────────────────────────────────
//
interface PomodoroTimerContainerProps extends PomodoroTimerState {
  children: (state: PomodoroTimerState, actions: PomodoroTimerAction) => React.ReactNode
  dispatch: Dispatch<any>
}

export class PomodoroTimerContainer extends React.Component<PomodoroTimerContainerProps> {
  actions: PomodoroTimerAction = {
    pause: () => this.props.dispatch(INTENTS.POMODORO_TIMER_PAUSE()),
    resume: () => this.props.dispatch(INTENTS.POMODORO_TIMER_RESUME()),
    skip: () => this.props.dispatch(INTENTS.POMODORO_TIMER_SKIP()),
    reset: () => this.props.dispatch(INTENTS.POMODORO_TIMER_RESET()),
  }
  render() {
    return this.props.children(this.props, this.actions)
  }
}

export default connect(selectPomodoroTimerState)(PomodoroTimerContainer)
