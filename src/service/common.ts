import { PomodoroTimerRepository, RESULTS as POMODORO_TIMER } from '@/model/pomodoro-timer'
import { TodosRepository, RESULTS as TODOS } from '@/model/todos'
import { AppSessionRepository, RESULTS as APP_SESSION } from './app-session'
import { INTENTS } from './intents'

//
// ─── COMMANDS ───────────────────────────────────────────────────────────────────
//
export {
  INTENTS,
  POMODORO_TIMER,
  TODOS,
  APP_SESSION,
}

//
// ─── IREPOSITORY ─────────────────────────────────────────────────────────────────
//
export interface RepositoryGroup {
  pomodoroTimer: PomodoroTimerRepository
  todos: TodosRepository
  appSession: AppSessionRepository
}
