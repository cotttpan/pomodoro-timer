import * as React from 'react'
import TodoEntryFormContainer from '@/view/container/TodoEntryFormContainer'

export default () => (
  <TodoEntryFormContainer>
    {(state, actions) => (
      <form onSubmit={actions.submit}>
        <label htmlFor='todo-entry-form' hidden={true}>todo content</label>
        <input
          id='todo-entry-form'
          className='input'
          data-scope='todo-entry-form'
          type='text'
          value={state.value}
          placeholder='Enter task name...'
          onChange={actions.input}
          ref={state.ref}
        />
      </form>
    )}
  </TodoEntryFormContainer>
)
