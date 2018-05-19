import { render } from 'react-dom'
import { requestNotificationPermission } from '@/lib/notification'

//
// ─── BOOT APP ───────────────────────────────────────────────────────────────────────
//
(async function bootApp() {
  const [{ store }, { service }, { view }] = await Promise.all([
    import('@/store'),
    import('@/service'),
    import('@/view'),
  ])
  const tree = view(store(service))
  const root = document.querySelector('#root')
  render(tree, root)
  /* notification */
  requestNotificationPermission()
})()

//
// ─── HOT MODULE REPLACEMENT ─────────────────────────────────────────────────────
//
// @ts-ignore
if (module.hot) {
  // @ts-ignore
  module.hot.accept([/* dependencies */], status => {
    // dependenciesがupdateされたときのハンドラ
  })
  // @ts-ignore
  module.hot.dispose(data => {
    // 現在のmodule(index.ts)がupdateされる場合のハンドラ
  })
}

