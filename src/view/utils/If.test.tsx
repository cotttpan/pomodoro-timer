import * as React from 'react'
import { renderIntoDocument } from 'react-dom/test-utils'
import If from './If'

test('If', () => {
  const doc = renderIntoDocument(
    <div>
      <If cond={true}>
        {() => <div id='a'>a</div>}
      </If>
      <If cond={false}>
        {() => <div id='b'>b</div>}
      </If>
    </div>,
  ) as Element

  expect(doc.querySelector('#a')).toBeTruthy()
  expect(doc.querySelector('#b')).toBeFalsy()
})
