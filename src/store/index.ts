import { combineReducers, createStore, applyMiddleware } from 'redux'
import { createEpicMiddleware, Epic } from 'redux-epic'
import { composeWithDevTools } from 'redux-devtools-extension'
import { identity } from '@cotto/utils.ts'
import {
  POMODORO_TIMER_STORE_KEY,
  PomodoroTimerState,
  pomodoroTimerReducer,
} from './pomodoro-timer'
import {
  TODOLIST_STORE_KEY,
  TodoListState,
  todolistReducer,
} from './todolist'
import {
  TODO_ENTRY_FORM_STORE_KEY,
  TodoEntryFormState,
  todoEntryFormReducer,
} from './todoEntryForm'
import {
  TODO_EDIT_FORMS_STORE_KEY,
  TodoEditFormState,
  todoEditFormReducer,
} from './todoEditoForm'

const withDevtools: Function = process.env.NODE_ENV === 'production'
  ? identity
  : composeWithDevTools

export type AppState = {
  [POMODORO_TIMER_STORE_KEY]: PomodoroTimerState
  [TODOLIST_STORE_KEY]: TodoListState,
  [TODO_ENTRY_FORM_STORE_KEY]: TodoEntryFormState,
  [TODO_EDIT_FORMS_STORE_KEY]: TodoEditFormState,
}

export default (rootEpic: Epic<AppState>) => {
  return createStore(
    /* reducer */
    combineReducers<AppState>({
      [POMODORO_TIMER_STORE_KEY]: pomodoroTimerReducer,
      [TODOLIST_STORE_KEY]: todolistReducer,
      [TODO_ENTRY_FORM_STORE_KEY]: todoEntryFormReducer,
      [TODO_EDIT_FORMS_STORE_KEY]: todoEditFormReducer,
    }),
    /* middleware */
    withDevtools(
      applyMiddleware(
        createEpicMiddleware(rootEpic),
      ),
    ),
  )
}
