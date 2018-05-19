import { combineReducers, createStore, applyMiddleware } from 'redux'
import { createEpicMiddleware, Epic } from 'redux-epic'
import { composeWithDevTools } from 'redux-devtools-extension'
import { identity } from '@cotto/utils.ts'
import { PomodoroTimerStoreState, pomodoroTimerReducer } from '@/view/container/PomodoroTimerContainer'

const withDevtools: Function = process.env.NODE_ENV === 'production'
  ? identity
  : composeWithDevTools

export type AppState = PomodoroTimerStoreState

export default (rootEpic: Epic<AppState>) => {
  return createStore(
    /* reducer */
    combineReducers<AppState>({
      pomodoroTimer: pomodoroTimerReducer,
    }),
    /* middleware */
    withDevtools(
      applyMiddleware(
        createEpicMiddleware(rootEpic),
      ),
    ),
  )
}
