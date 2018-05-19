import { combineReducers, createStore, applyMiddleware } from 'redux'
import { createEpicMiddleware, Epic } from 'redux-epic'
import { composeWithDevTools } from 'redux-devtools-extension'
import { identity } from '@cotto/utils.ts'
import { PomodoroTimerStoreState, pomodoroTimerReducer } from '@/view/container/PomodoroTimerContainer'
import { TodoListStoreState, todoListReducer } from '@/view/container/TodoListContainer'
import { TodoEditFormStoreState, todoEditFormReducer } from '@/view/container/TodoEditFormContainer'
import { TodoEntryFormStoreState, todoEntryFormReducer } from '@/view/container/TodoEntryFormContainer'

const withDevtools: Function = process.env.NODE_ENV === 'production'
  ? identity
  : composeWithDevTools

export type AppState =
  & PomodoroTimerStoreState
  & TodoEditFormStoreState
  & TodoEntryFormStoreState
  & TodoListStoreState


export const store = (rootEpic: Epic<AppState>) => {
  return createStore(
    /* reducer */
    combineReducers<AppState>({
      pomodoroTimer: pomodoroTimerReducer,
      todoEditForm: todoEditFormReducer,
      todoEntryForm: todoEntryFormReducer,
      todoList: todoListReducer,
    }),
    /* middleware */
    withDevtools(
      applyMiddleware(
        createEpicMiddleware(rootEpic),
      ),
    ),
  )
}
