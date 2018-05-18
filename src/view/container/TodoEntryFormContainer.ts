import * as React from 'react'
import { Dispatch } from 'react-redux'
import { connectTodoEntryFormStore } from '@/store/todoEntryForm'
import { INTENTS } from '@/service'

export interface TodoEntryFormState {
  value: string
}

export interface TodoEntryFormAction {
  input: React.EventHandler<React.ChangeEvent<HTMLInputElement>>
  submit: React.EventHandler<React.FormEvent<HTMLFormElement>>
}

export interface TodoEntryFormProps extends TodoEntryFormState {
  children: (props: TodoEntryFormProps & { ref: React.RefObject<any> }, actions: TodoEntryFormAction) => React.ReactNode
  dispatch: Dispatch<any>
}

export class TodoEntryFormContainer extends React.PureComponent<TodoEntryFormProps> {
  inputRef = React.createRef<HTMLInputElement>()
  actions: TodoEntryFormAction = {
    input: (ev: React.ChangeEvent<HTMLInputElement>) => {
      const value = ev.currentTarget.value
      this.props.dispatch(INTENTS.INPUT_NEW_TODO_CONTENT(value))
    },
    submit: (ev: React.FormEvent<HTMLFormElement>) => {
      ev.preventDefault()
      const payload = { content: this.props.value }
      return this.props.dispatch(INTENTS.ADD_TODO(payload))
    },
  }
  componentDidMount() {
    if (this.inputRef.current != undefined) {
      this.inputRef.current.focus()
    }
  }
  render() {
    return this.props.children({ ...this.props, ref: this.inputRef }, this.actions)
  }
}

export default connectTodoEntryFormStore(TodoEntryFormContainer)
