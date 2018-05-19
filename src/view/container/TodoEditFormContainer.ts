import * as React from 'react'
import { Dispatch, connect } from 'react-redux'
import { createReducer, caseOf } from 'typed-reducer'
import { INTENTS, TODO_FORM } from '@/service'

export interface TodoEditFormState {
  todoId?: number
  value: string
}

export interface TodoEditoFormAction {
  input: React.EventHandler<React.ChangeEvent<HTMLInputElement>>
  submit: React.EventHandler<React.FormEvent<HTMLFormElement>>
  close: React.EventHandler<React.FormEvent<HTMLInputElement>>
}

export interface TodoEntryFormProps extends TodoEditFormState {
  todoId: number
  children: (
    props: TodoEntryFormProps & { ref: React.RefObject<any> },
    actions: TodoEditoFormAction,
  ) => React.ReactNode
  dispatch: Dispatch<any>
}

//
// ─── STORE ──────────────────────────────────────────────────────────────────────
//
export interface TodoEditFormStoreState {
  todoEditForm: TodoEditFormState
}

const selectTodoEditFormState = (state: TodoEditFormStoreState) => {
  return state.todoEditForm
}

const init = (): TodoEditFormState => ({
  value: '',
})

export const todoEditFormReducer = createReducer(init)(
  caseOf(
    TODO_FORM.OUTPUT.CHANGE,
    (state, action) => {
      const { editingTodoId, editingTodoContent } = action.payload
      return { ...state, todoId: editingTodoId, value: editingTodoContent || '' }
    },
  ),
)

//
// ─── CONTAINER ──────────────────────────────────────────────────────────────────
//
export class TodoEntryFormContainer extends React.PureComponent<TodoEntryFormProps> {
  inputRef = React.createRef<HTMLInputElement>()

  actions: TodoEditoFormAction = {
    input: (ev: React.ChangeEvent<HTMLInputElement>) => {
      const value = ev.currentTarget.value
      const payload = { id: this.props.todoId, content: value }
      this.props.dispatch(INTENTS.INPUT_ENDIT_TODO_CONTENT(payload))
    },
    submit: (ev: React.FormEvent<HTMLFormElement>) => {
      ev.preventDefault()
      const payload = { id: this.props.todoId, content: this.props.value }
      return this.props.dispatch(INTENTS.UPDATE_TODO_CONTENT(payload))
    },
    close: (_ev: React.FormEvent<HTMLInputElement>) => {
      const emit = () => this.props.dispatch(INTENTS.CLOSE_TODO_EDIT_FORM())
      setTimeout(emit, 50)
    },
  }
  componentDidMount() {
    if (this.inputRef.current) {
      this.inputRef.current.focus()
    }
  }
  render() {
    const props = { ...this.props, ref: this.inputRef }
    return this.props.children(props, this.actions)
  }
}

export default connect(selectTodoEditFormState)(TodoEntryFormContainer)
