import { merge } from 'rxjs'
import { map, filter, switchMap, take } from 'rxjs/operators'
import { EventSource, select, Command } from 'command-bus'
import { existy } from '@cotto/utils.ts'
import { AppSessionRepository } from '@/domain/app-session'
import { TodoExternalApi, TodoRepository, todoService } from '@/domain/todo'
import { INTENTS, POMODORO_TIMER, TODO } from './shared'

type RepositoryGroup = {
  todo: TodoRepository,
  appSession: AppSessionRepository,
}

export const bootTodoService = (ev: EventSource, repo: RepositoryGroup, api: TodoExternalApi) => {
  const domainApi = {
    repo: repo.todo,
    ...api,
  }

  const actions$ = merge<Command>(
    select(ev, INTENTS.ADD_NEW_TODO).pipe(
      map(action => TODO.INPUT.ADD(action.payload)),
    ),
    select(ev, INTENTS.UPDATE_TODO_CONTENT).pipe(
      map(action => TODO.INPUT.UPDATE(action.payload)),
    ),
    select(ev, INTENTS.DELETE_TODO).pipe(
      map(action => TODO.INPUT.DELETE(action.payload)),
    ),
    select(ev, INTENTS.TOGGLE_TODO_COMPLETION).pipe(
      map(action => TODO.INPUT.TOGGLE_COMPLETION(action.payload)),
    ),
    select(ev, POMODORO_TIMER.OUTPUT.TIMEUP).pipe(
      switchMap(() => select(ev, POMODORO_TIMER.OUTPUT.END).pipe(
        take(1),
        map(() => repo.appSession.get('currentTimerTarget')),
        filter(existy),
        map(todo => TODO.INPUT.INCREMENT_MILESTONE({ id: todo.id })),
      )),
    ),
  )

  return todoService(actions$, domainApi)
}

