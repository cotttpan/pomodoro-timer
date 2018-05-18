import * as React from 'react'
import { Dispatch } from 'react-redux'
import { INTENTS } from '@/service'
import { connectPomodoroTimerStore } from '@/store/pomodoro-timer'

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

export default connectPomodoroTimerStore(PomodoroTimerContainer)
