import * as React from 'react'
import { pure } from 'recompose'
import If from '@/view/utils/If'
import { Todo } from '@/domain/todo'
import TodoEditForm from './TodoEditForm'
import TodoCheckBox from './TodoCheckBox'

//
// ─── TODOLIST_ITEM ───────────────────────────────────────────────────────────────
//
export interface TodoListItemProps {
  todo: Todo
  shouldEditFormOpen: boolean
  isPomodoroTimerStartable: boolean
  isTodoCompletionToggleable: boolean
  isTodoDeleteable: boolean
  isTimerTarget: boolean
  onTodoCheckboxClick: React.EventHandler<React.FormEvent<any>>
  onTodoDeleteBtnClick: React.EventHandler<React.MouseEvent<any>>
  onEditBtnDblClick: React.EventHandler<React.MouseEvent<any>>
  onTimerStartBtnClick: React.EventHandler<React.MouseEvent<any>>
}


export const TodoListItem = (props: TodoListItemProps) => (
  <article
    className={'g-container todo-item-container'}
    data-scope='todolist-item'
    data-is-completed={props.todo.completed}
    data-is-timer-target={props.isTimerTarget}
  >
    <div className='g-area u-fill checkbox-area' data-scope='todolist-item'>
      <TodoCheckBox
        todoId={props.todo.id}
        onClick={props.onTodoCheckboxClick}
        checked={props.todo.completed}
        disabled={!props.isTodoCompletionToggleable}
      />
    </div>

    <If cond={props.shouldEditFormOpen}>
      {() => (
        <React.Fragment>
          <div className='g-area u-fill todo-content-area' data-scope='todolist-item'>
            <TodoEditForm todoId={props.todo.id} />
          </div>

          <div className='g-area u-fill nav-btn-area' data-scope='todolist-item'>
            <button
              className='nav-btn'
              type='button'
              data-todo-id={props.todo.id}
              onClick={props.onTodoDeleteBtnClick}
              disabled={!props.isTodoDeleteable}
              data-scope='todolist-item'
            >
              <i className='fas fa-trash-alt' />
            </button>
          </div>
        </React.Fragment>
      )}
    </If>
    <If cond={!props.shouldEditFormOpen}>
      {() => (
        <React.Fragment>
          <div
            className='g-area u-fill todo-content-area'
            data-scope='todolist-item'
            data-todo-id={props.todo.id}
            onDoubleClick={props.onEditBtnDblClick}
          >
            <span className='todo-id todo-content-area-item' data-scope='todolist-item'>
              {props.todo.id}
            </span>
            <h1 className='todo-content todo-content-area-item' data-scope='todolist-item'>
              {props.todo.content}
            </h1>
            <span className='todo-milestone todo-content-area-item' data-scope='todolist-item'>
              {props.todo.milestone}
            </span>
          </div>

          <div className='g-area u-fill nav-btn-area' data-scope='todolist-item'>
            <button
              className='start-btn nav-btn'
              data-todo-id={props.todo.id}
              onClick={props.onTimerStartBtnClick}
              disabled={!props.isPomodoroTimerStartable}
              data-scope='todolist-item'
              title='start timer'
            >
              <i className='fas fa-play' />
            </button>
          </div>
        </React.Fragment>
      )}
    </If>
  </article>
)

export default pure(TodoListItem)
