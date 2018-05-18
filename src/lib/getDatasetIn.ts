import * as React from 'react'

export default function getDatasetIn(ev: React.SyntheticEvent<any> | Event, key: string) {
  return (ev.currentTarget as HTMLElement).dataset[key]
}
