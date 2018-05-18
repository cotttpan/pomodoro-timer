import * as React from 'react'
import { isFalsy, isTruthy } from '@cotto/utils.ts'
import If from '@/view/utils/If'

export interface Props {
  todoId: number
  onClick: React.EventHandler<React.MouseEvent<any>>
  checked?: boolean
  disabled?: boolean
}
export default function TodoCheckBox(props: Props) {
  return (
    <label className='u-block' title='todo checkbox' data-scope='todo-check-box' >
      <input
        type='checkbox'
        data-todo-id={props.todoId}
        checked={props.checked}
        onClick={props.onClick}
        disabled={props.disabled}
        hidden={true}
      />
      <If cond={isTruthy(props.checked)}>
        {() => (
          <i
            className='fas fa-check-circle checkbox-icon'
            data-scope='todo-check-box'
            data-is-checked={props.checked}
          />
        )}
      </If>
      <If cond={isFalsy(props.checked) && isTruthy(props.disabled)}>
        {() => (
          <i
            className='fas fa-dot-circle checkbox-icon'
            data-scope='todo-check-box'
            data-is-checked={props.checked}
          />
        )}
      </If>
      <If cond={isFalsy(props.checked) && isFalsy(props.disabled)}>
        {() => (
          <i
            className='far fa-circle checkbox-icon'
            data-scope='todo-check-box'
            data-is-checked={props.checked}
          />
        )}
      </If>
    </label>
  )
}
