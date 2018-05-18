import { mapValues } from '@cotto/utils.ts'
import pad from '@/lib/pad'

const padZero = (n: number) => pad(Math.max(0, n), '0', 2)

export const toDisplayTime = (time: number) => {
  const hour = Math.floor(time / 1000 / 60 / 60) % 60
  const min = Math.floor(time / 1000 / 60) % 60
  const sec = Math.floor(time / 1000) % 60
  return mapValues({ hour, min, sec }, padZero)
}
