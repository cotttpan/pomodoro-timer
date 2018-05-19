import { merge } from 'rxjs'
import { map } from 'rxjs/operators'
import { EventSource, select } from 'command-bus'
import { values } from '@cotto/utils.ts'
import { TODO, TODOLIST } from './shared'
import { TodoListRepository, todoListService } from '@/domain/todolist'
type RepositoryGroup = {
  todolist: TodoListRepository,
}

export const bootTodoListService = (ev: EventSource, repo: RepositoryGroup) => {
  const action$ = merge(
    select(ev, TODO.OUTPUT.BOOT).pipe(
      map(action => values(action.payload)),
      map(TODOLIST.INPUT.BOOT),
    ),
    select(ev, TODO.OUTPUT.ADD).pipe(
      map(action => TODOLIST.INPUT.ADD(action.payload)),
    ),
    select(ev, TODO.OUTPUT.DELETE).pipe(
      map(action => TODOLIST.INPUT.DELETE(action.payload)),
    ),
  )
  return todoListService(action$, { repo: repo.todolist })
}
