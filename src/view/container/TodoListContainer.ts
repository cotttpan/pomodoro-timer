import * as React from 'react'
import { Dispatch } from 'react-redux'
import { Todo } from '@/model/todos'
import { INTENTS } from '@/service'
import getDatasetIn from '@/lib/getDatasetIn'
import { connectTodoListStore } from '@/store/todolist'

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

export default connectTodoListStore(TodoListContainer)
