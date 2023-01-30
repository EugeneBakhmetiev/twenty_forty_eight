import { ArrowKeyParams } from './types'

export const arrowKeyParams: ArrowKeyParams = {
  ArrowUp: {
    input: '↑',
    params: [true, 0]
  },
  ArrowLeft: {
    input: '←',
    params: [false, 0],
  },
  ArrowRight: {
    input: '→',
    params: [false, 3],
  },
  ArrowDown: {
    input: '↓',
    params: [true, 3],
  },
}
