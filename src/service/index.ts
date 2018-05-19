import { merge } from 'rxjs'
import { EventSource } from 'command-bus'
/* project */
import { createRepsitoryGroup } from './shared'
import { createDatabase, createInfraApi } from '@/infra'
import { bootAppSessionService } from './app-session'
import { bootPomodoroTimerAppService } from './pomodoro-timer'
// import { bootToodsAppService } from './todos'
// import { createAppSessionRepository, bootAppSessionService } from './app-session'
export * from './shared'

export const service = (ev: EventSource) => {
  /* root api */
  const infraApi = createInfraApi(createDatabase())
  const repo = createRepsitoryGroup()

  return merge(
    bootAppSessionService(ev, repo),
    bootPomodoroTimerAppService(ev, repo),
  )
}


export default service
