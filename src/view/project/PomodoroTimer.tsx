import * as React from 'react'
import PomodoroTimerContainer from '@/view/container/PomodoroTimerContainer'


export const PomodoroTimer = () => (
  <PomodoroTimerContainer>
    {(state, actions) => (
      <div className='g-container' data-scope='pomodoro-timer'>
        <header className='header' data-scope='pomodoro-timer'>
          <h1 className='timer-title' data-scope='pomodoro-timer'>
            {state.title}
          </h1>
        </header>
        <div className='body' data-scope='pomodoro-timer'>
          <span className='time' data-scope='pomodoro-timer'>{state.time.min}</span>
          <span className='time' data-scope='pomodoro-timer'>:</span>
          <span className='time' data-scope='pomodoro-timer'>{state.time.sec}</span>
        </div>
        <footer className='footer' data-scope='pomodoro-timer'>
          <div className='btn-group' data-scope='pomodoro-timer'>
            <button
              className='btn'
              data-scope='pomodoro-timer'
              onClick={actions.pause}
              disabled={!state.isTimerPauseable}
            >
              PAUSE
            </button>
            <button
              className='btn'
              data-scope='pomodoro-timer'
              onClick={actions.resume}
              disabled={!state.isTimerResumeable}
            >
              RESUME
            </button>
            <button
              className='btn'
              data-scope='pomodoro-timer'
              onClick={actions.skip}
            >
              SKIP
            </button>
            <button
              className='btn'
              data-scope='pomodoro-timer'
              onClick={actions.reset}
            >
              RESET
            </button>
          </div>
        </footer>
      </div>
    )}
  </PomodoroTimerContainer>
)

export default PomodoroTimer
