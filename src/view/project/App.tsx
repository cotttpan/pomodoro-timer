import * as React from 'react'
import { Provider, Store } from 'react-redux'
import PomodoroTimer from './PomodoroTimer'
import TodoList from './TodoList'

export const App = (store: Store<any>) => (
  <Provider store={store}>
    <React.Fragment>
      <main className='g-container' data-scope='app'>
        <section className='g-area-pomodoro-timer widget-board' data-scope='app'>
          <div className='widget-board-inner' data-scope='app'>
            <PomodoroTimer />
          </div>
        </section>
        <section className='g-area-todolist widget-board' data-scope='app'>
          <div className='widget-board-inner' data-scope='app'>
            <TodoList dispatch={store.dispatch} />
          </div>
        </section>
      </main>
    </React.Fragment>
  </Provider>
)
