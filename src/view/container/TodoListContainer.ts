import * as React from 'react'
import { Dispatch, connect } from 'react-redux'
import { createReducer, caseOf } from 'typed-reducer'
import { values } from '@cotto/utils.ts'
import { Todo } from '@/domain/todo'
import { INTENTS, TODO, POMODORO_TIMER, APP_SESSION, TODO_FORM } from '@/service'
import getDatasetIn from '@/lib/getDatasetIn'

export interface TodoListState {
  todos: Todo[]
  isPomodoroTimerStartable: boolean
  currentEditingTodoId: number | null
  currentTimerTargetId: number | null
}

export interface TodolistActions {
  startPomodoroTimer: React.EventHandler<React.MouseEvent<any>>
  toggleTodoCompletion: React.EventHandler<React.MouseEvent<any>>
  deleteTodo: React.EventHandler<React.MouseEvent<any>>
  openTodoEditForm: React.EventHandler<React.MouseEvent<any>>
}

//
// ─── STORE ──────────────────────────────────────────────────────────────────────
//
export interface TodoListStoreState {
  todoList: TodoListState
}

const selectState = (state: TodoListStoreState) => state.todoList

const init = (): TodoListState => ({
  todos: [],
  isPomodoroTimerStartable: true,
  currentEditingTodoId: null,
  currentTimerTargetId: null,
})


export const todoListReducer = createReducer(init)(
  // caseOf(
  //   TODOLIST.OUTPUT.CHANGE,
  //   (state, action) => {
  //     const todos = action.payload.list
  //     return { ...state, todos }
  //   },
  // ),
  caseOf(POMODORO_TIMER.OUTPUT.CHANGE, (state, action) => {
    const { isWorking, isPausing } = action.payload
    const isPomodoroTimerStartable = !isWorking && !isPausing
    return { ...state, isPomodoroTimerStartable }
  }),
  caseOf(
    APP_SESSION.OUTPUT.CHANGE,
    (state, action) => {
      const { currentTimerTarget } = action.payload
      const currentTimerTargetId = currentTimerTarget ? currentTimerTarget.id : null
      return { ...state, currentTimerTargetId }
    },
  ),
  caseOf(
    TODO_FORM.OUTPUT.CHANGE,
    (state, action) => {
      const { editingTodoId } = action.payload
      const currentEditingTodoId = editingTodoId || null
      return { ...state, currentEditingTodoId }
    },
  ),
  caseOf(
    TODO.OUTPUT.BOOT,
    (state, action) => {
      const todos = values(action.payload).sort((a, b) => b.id - a.id)
      return { ...state, todos }
    },
  ),
  caseOf(
    TODO.OUTPUT.ADD,
    (state, action) => {
      const todos = [action.payload, ...state.todos]
      return { ...state, todos }
    },
  ),
  caseOf(
    TODO.OUTPUT.UPDATE,
    (state, action) => {
      const idx = state.todos.findIndex(todo => todo.id === action.payload.id)
      const todos = [...state.todos.slice(0, idx), action.payload, ...state.todos.slice(idx + 1)]
      const currentEditingTodoId = null
      return { ...state, todos, currentEditingTodoId }
    }),
  caseOf(
    TODO.OUTPUT.DELETE,
    (state, action) => {
      const todos = state.todos.filter(todo => todo.id !== action.payload.id)
      return { ...state, todos }
    },
  ),
  caseOf(INTENTS.CLEAN_COMPLETED_TODOS, state => {
    const todos = state.todos.filter(todo => !todo.completed)
    return { ...state, todos }
  }),

)


//
// ─── CONTEINER ──────────────────────────────────────────────────────────────────
//
export interface TodoListProps extends TodoListState {
  children: (props: TodoListProps, actions: TodolistActions) => React.ReactNode
  dispatch: Dispatch<any>
}

export function getTodoId(ev: React.SyntheticEvent<any>) {
  const todoId = Number(getDatasetIn(ev, 'todoId'))
  if (isNaN(todoId)) {
    throw new Error('todoId is not a number.')
  }
  return todoId
}

export class TodoListContainer extends React.Component<TodoListProps> {
  actions = {
    startPomodoroTimer: (ev: React.MouseEvent<any>) => {
      const todoId = getTodoId(ev)
      const action = INTENTS.POMODORO_TIMER_START({ todoId })
      return this.props.dispatch(action)
    },
    toggleTodoCompletion: (ev: React.MouseEvent<any>) => {
      const id = getTodoId(ev)
      const action = INTENTS.TOGGLE_TODO_COMPLETION({ id })
      return this.props.dispatch(action)
    },
    deleteTodo: (ev: React.MouseEvent<any>) => {
      const id = getTodoId(ev)
      const action = INTENTS.DELETE_TODO({ id })
      return this.props.dispatch(action)
    },
    openTodoEditForm: (ev: React.MouseEvent<any>) => {
      const id = getTodoId(ev)
      const todo = this.props.todos.find(t => t.id === id)
      if (todo != undefined) {
        const action = INTENTS.SHOW_TODO_EDIT_FORM({ id: todo.id, content: todo.content })
        return this.props.dispatch(action)
      } else {
        return undefined
      }
    },
  }
  render() {
    return this.props.children(this.props, this.actions)
  }
}

export default connect(selectState)(TodoListContainer)
