import { merge } from 'rxjs'
import { map, filter } from 'rxjs/operators'
import { TODO_FORM, TODO, INTENTS } from './shared'
import { EventSource, select } from 'command-bus'
import { TodoFormRepository, todoFormService } from '@/domain/todo-form'

export type RepositoryGroup = {
  todoForm: TodoFormRepository,
}

export const bootTodoFormService = (ev: EventSource, repo: RepositoryGroup) => {
  const action$ = merge(
    /* entry form */
    select(ev, INTENTS.INPUT_NEW_TODO_CONTENT).pipe(
      map(action => action.payload),
      map(content => TODO_FORM.INPUT.PATCH(s => ({ ...s, newEntryTodoContent: content }))),
    ),
    select(ev, TODO.OUTPUT.ADD).pipe(
      map(() => TODO_FORM.INPUT.PATCH(s => ({ ...s, newEntryTodoContent: undefined }))),
    ),
    /* edit form */
    select(ev, [INTENTS.INPUT_ENDIT_TODO_CONTENT, INTENTS.SHOW_TODO_EDIT_FORM]).pipe(
      map(action => action.payload),
      map(src => TODO_FORM.INPUT.PATCH(s => ({ ...s, editingTodoId: src.id, editingTodoContent: src.content }))),
    ),
    select(ev, [INTENTS.CLOSE_TODO_EDIT_FORM, TODO.OUTPUT.UPDATE]).pipe(
      map(action => action.payload),
      map(() => TODO_FORM.INPUT.PATCH(s => ({ ...s, editingTodoId: undefined, editingTodoContent: undefined }))),
    ),
    select(ev, [TODO.OUTPUT.DELETE]).pipe(
      map(action => action.payload),
      filter(todo => repo.todoForm.validate(s => s.editingTodoId === todo.id)),
      map(() => TODO_FORM.INPUT.PATCH(s => ({ ...s, editingTodoId: undefined, editingTodoContent: undefined }))),
    ),
  )

  return todoFormService(action$, { repo: repo.todoForm })
}
