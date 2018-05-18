import { connect } from 'react-redux'
import { createReducer, caseOf } from 'typed-reducer'
import { INTENTS, TODOS } from '@/service'
import { TodoEntryFormState } from '@/view/container/TodoEntryFormContainer'

export { TodoEntryFormState }

export const TODO_ENTRY_FORM_STORE_KEY = 'todoEntryForm'

export const connectTodoEntryFormStore = connect((state: any): TodoEntryFormState => {
  return state[TODO_ENTRY_FORM_STORE_KEY]
})

const init = (): TodoEntryFormState => ({ value: '' })

export const todoEntryFormReducer = createReducer(init)(
  caseOf(INTENTS.INPUT_NEW_TODO_CONTENT, (state, action) => {
    return { ...state, value: action.payload }
  }),
  caseOf(TODOS.ADD, state => {
    return { ...state, value: '' }
  }),
)
