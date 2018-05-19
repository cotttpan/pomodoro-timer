import { combineReducers, createStore, applyMiddleware } from 'redux'
import { createEpicMiddleware, Epic } from 'redux-epic'
import { composeWithDevTools } from 'redux-devtools-extension'
import { identity } from '@cotto/utils.ts'
import { PomodoroTimerStoreState, pomodoroTimerReducer } from '@/view/container/PomodoroTimerContainer'
import { TodoEditFormStoreState, todoEditFormReducer } from '@/view/container/TodoEditFormContainer'

const withDevtools: Function = process.env.NODE_ENV === 'production'
  ? identity
  : composeWithDevTools

export type AppState =
  & PomodoroTimerStoreState
  & TodoEditFormStoreState

export default (rootEpic: Epic<AppState>) => {
  return createStore(
    /* reducer */
    combineReducers<AppState>({
      pomodoroTimer: pomodoroTimerReducer,
      todoEditForm: todoEditFormReducer,
    }),
    /* middleware */
    withDevtools(
      applyMiddleware(
        createEpicMiddleware(rootEpic),
      ),
    ),
  )
}
