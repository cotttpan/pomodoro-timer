import { factory } from 'command-bus'
import { APP_SESSION, createAppSessionRepository } from '@/domain/app-session'
import { POMODORO_TIMER, createPomodoroTimerRepository } from '@/domain/pomodoro-timer'
import { TODO, createTodoReposiory } from '@/domain/todo'
import { TODOLIST, createTodoListRepository } from '@/domain/todolist'
import { TODO_FORM, createTodoFormRepository } from '@/domain/todo-form'

//
// ─── API ────────────────────────────────────────────────────────────────────────
//

export const createRepsitoryGroup = () => ({
  appSession: createAppSessionRepository(),
  pomodoroTimer: createPomodoroTimerRepository(),
  todo: createTodoReposiory(),
  todolist: createTodoListRepository(),
  todoForm: createTodoFormRepository(),
})

export type RepositoryGroup = ReturnType<typeof createRepsitoryGroup>

//
// ─── COMMANDS ───────────────────────────────────────────────────────────────────
//
const intent = factory('INTENT/')

export const INTENTS = {
  /* pomodoro timer */
  POMODORO_TIMER_START: intent<{ todoId: string | number }>('POMODORO_TIMER_START'),
  POMODORO_TIMER_PAUSE: intent('POMODORO_TIMER_PAUSE'),
  POMODORO_TIMER_RESUME: intent('POMODORO_TIMER_RESUME'),
  POMODORO_TIMER_SKIP: intent('POMODORO_TIMER_SKIP'),
  POMODORO_TIMER_RESET: intent('RESET'),
  /* todo form  */
  INPUT_NEW_TODO_CONTENT: intent<string>('INPUT_NEW_TODO_CONTENT'),
  INPUT_ENDIT_TODO_CONTENT: intent<{ id: number, content: string }>('INPUT_ENDIT_TODO_CONTENT'),
  SHOW_TODO_EDIT_FORM: intent<{ id: number, content: string }>('SHOW_TODO_EDIT_FORM'),
  CLOSE_TODO_EDIT_FORM: intent('CLOSE_TODO_EDIT_FORM'),
  /* todo crud */
  ADD_NEW_TODO: intent<{ content: string }>('ADD_TODO'),
  DELETE_TODO: intent<{ id: number }>('DELETE_TODO'),
  UPDATE_TODO_CONTENT: intent<{ id: number, content: string }>('UPDATE_TODO'),
  TOGGLE_TODO_COMPLETION: intent<{ id: number }>('COMPLETE_TODO'),
  CLEAN_COMPLETED_TODOS: intent('CLEAN_COMPLETED_TODOS'),
}

export {
  APP_SESSION,
  POMODORO_TIMER,
  TODO,
  TODOLIST,
  TODO_FORM,
}
