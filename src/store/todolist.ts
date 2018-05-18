import { connect } from 'react-redux'
import { createReducer, caseOf } from 'typed-reducer'
import { values, isFalsy } from '@cotto/utils.ts'
import { INTENTS, TODOS, APP_SESSION, POMODORO_TIMER } from '@/service'
import { TodoListState } from '@/view/container/TodoListContainer'

export const TODOLIST_STORE_KEY = 'todolist'

export { TodoListState }

export const getTodoListState = (state: any): TodoListState => {
  return state[TODOLIST_STORE_KEY]
}

export const connectTodoListStore = connect(getTodoListState)

const init = (): TodoListState => ({
  todos: [],
  isPomodoroTimerStartable: true,
  currentEditingTodoId: null,
  currentTimerTargetId: null,
})

export const todolistReducer = createReducer(init)(
  caseOf([INTENTS.INPUT_ENDIT_TODO_CONTENT, INTENTS.SHOW_TODO_EDIT_FORM], (state, action) => {
    const currentEditingTodoId = action.payload.id
    return { ...state, currentEditingTodoId }
  }),
  caseOf(INTENTS.CLOSE_TODO_EDIT_FORM, state => {
    const currentEditingTodoId = null
    return { ...state, currentEditingTodoId }
  }),
  caseOf(INTENTS.CLEAN_COMPLETED_TODOS, state => {
    const todos = state.todos.filter(todo => isFalsy(todo.completed))
    return { ...state, todos }
  }),
  caseOf(TODOS.BOOT, (state, action) => {
    const todos = values(action.payload).sort((a, b) => b.id - a.id)
    return { ...state, todos }
  }),
  caseOf(TODOS.ADD, (state, action) => {
    const todos = [action.payload, ...state.todos]
    return { ...state, todos }
  }),
  caseOf(TODOS.UPDATE, (state, action) => {
    const idx = state.todos.findIndex(todo => todo.id === action.payload.id)
    const todos = [...state.todos.slice(0, idx), action.payload, ...state.todos.slice(idx + 1)]
    const currentEditingTodoId = null
    return { ...state, todos, currentEditingTodoId }
  }),
  caseOf(TODOS.DELETE, (state, action) => {
    const todos = state.todos.filter(todo => todo.id !== action.payload.id)
    return { ...state, todos }
  }),
  caseOf(POMODORO_TIMER.CHANGE, (state, action) => {
    const { isWorking, isPausing } = action.payload
    const isPomodoroTimerStartable = !isWorking && !isPausing
    return { ...state, isPomodoroTimerStartable }
  }),
  caseOf(APP_SESSION.CHANGE, (state, action) => {
    const todo = action.payload.currentTimerTarget
    const currentTimerTargetId = todo ? todo.id : null
    return { ...state, currentTimerTargetId }
  }),
)
