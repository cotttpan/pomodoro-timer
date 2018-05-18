import { merge } from 'rxjs'
import { share } from 'rxjs/operators'
import { EventSource } from 'command-bus'
/* project */
import { createDatabase, createInfraApi } from '@/infra'
import { createPomodoroTimerRepository } from '@/model/pomodoro-timer'
import { createTodosRepository } from '@/model/todos'
import { RepositoryGroup } from './common'
import { bootPomodoroTimerAppService } from './pomodoro-timer'
import { bootToodsAppService } from './todos'
import { createAppSessionRepository, bootAppSessionService } from './app-session'

export const createRepository = (): RepositoryGroup => {
  return {
    pomodoroTimer: createPomodoroTimerRepository(),
    todos: createTodosRepository(),
    appSession: createAppSessionRepository(),
  }
}

export const bootServices = (ev: EventSource) => {
  /* infra */
  const infraApi = createInfraApi(createDatabase())
  const repo = createRepository()

  return merge(
    bootAppSessionService(ev, repo),
    bootPomodoroTimerAppService(ev, repo),
    bootToodsAppService(ev, repo, infraApi),
  ).pipe(share())
}

export * from './common'
export default bootServices
