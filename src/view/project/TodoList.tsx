import * as React from 'react'
import { INTENTS } from '@/service'
import TodoEntryForm from './TodoEntryForm'
import TodoListContainer from '@/view/container/TodoListContainer'
import TodoListItem from './TodoListItem'

interface Props {
  dispatch: Function
}


export default class TodoList extends React.Component<Props> {
  handleTodosCleanBtnClick = () => {
    return this.props.dispatch(INTENTS.CLEAN_COMPLETED_TODOS())
  }
  render() {
    return (
      <div className='f-container' data-scope='todolist'>
        <div className='entry-form-container' data-scope='todolist'>
          <TodoEntryForm />
        </div>
        <div className='todolist-container' data-scope='todolist'>
          <TodoListContainer>
            {(state, actions) => (
              <React.Fragment>
                {state.todos.map(todo => (
                  <TodoListItem
                    key={todo.id}
                    todo={todo}
                    shouldEditFormOpen={state.currentEditingTodoId === todo.id}
                    isTimerTarget={state.currentTimerTargetId === todo.id}
                    isPomodoroTimerStartable={state.isPomodoroTimerStartable}
                    isTodoCompletionToggleable={state.currentTimerTargetId !== todo.id}
                    isTodoDeleteable={state.currentTimerTargetId !== todo.id}
                    onEditBtnDblClick={actions.openTodoEditForm}
                    onTodoCheckboxClick={actions.toggleTodoCompletion}
                    onTodoDeleteBtnClick={actions.deleteTodo}
                    onTimerStartBtnClick={actions.startPomodoroTimer}
                  />
                ))}
              </React.Fragment>
            )}
          </TodoListContainer>
        </div>
        <div className='footer-container' data-scope='todolist'>
          <button
            className='clean-btn'
            data-scope='todolist'
            onClick={this.handleTodosCleanBtnClick}
          >
            CLEAN
          </button>
        </div>
      </div>
    )
  }
}
