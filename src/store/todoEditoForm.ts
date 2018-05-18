import { connect } from 'react-redux'
import { createReducer, caseOf } from 'typed-reducer'
import { INTENTS, TODOS } from '@/service'
import { TodoEditFormState } from '@/view/container/TodoEditFormContainer'

export { TodoEditFormState }

export const TODO_EDIT_FORMS_STORE_KEY = 'todoEditForm'

export const connectTodoEditFormStore = connect((state: any): TodoEditFormState => {
  return state[TODO_EDIT_FORMS_STORE_KEY]
})

const init = (): TodoEditFormState => ({ value: '' })

export const todoEditFormReducer = createReducer(init)(
  caseOf([INTENTS.INPUT_ENDIT_TODO_CONTENT, INTENTS.SHOW_TODO_EDIT_FORM], (state, action) => {
    const { id, content } = action.payload
    return { ...state, todoId: id, value: content }
  }),
  caseOf([INTENTS.CLOSE_TODO_EDIT_FORM, TODOS.UPDATE], state => {
    return { ...state, todoId: undefined, value: '' }
  }),
  caseOf(TODOS.DELETE, (state, action) => {
    const { id } = action.payload
    return id === state.todoId ? { ...state, todoId: undefined, value: '' } : state
  }),
)
