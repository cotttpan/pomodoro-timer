import * as React from 'react'
import TodoEditFormContainer from '@/view/container/TodoEditFormContainer'

//
// ─── TODO EDIT FORM ───────────────────────────────────────────────────────────────
//
export interface TodoEditFormProps {
  todoId: number
}

export default (props: TodoEditFormProps) => (
  <TodoEditFormContainer>
    {(state, actions) => (
      <form data-todo-id={props.todoId} onSubmit={actions.submit} >
        <input
          type='text'
          className='input'
          data-todo-id={props.todoId}
          data-scope='todo-edit-form'
          value={state.value}
          onChange={actions.input}
          onBlur={actions.close}
          ref={state.ref}
        />
      </form>
    )}
  </TodoEditFormContainer>
)
