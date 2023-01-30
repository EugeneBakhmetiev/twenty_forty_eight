export enum GameState {
  inProgress,
  gameOver,
  gameWon,
}

export interface GameField {
  gameField: number[][]
  prevGameField: number[][] | null
  lastAdded: number[] | null
  maxNumber: number
}

export enum ArrowKeyInputs {
  ArrowUp = 'ArrowUp',
  ArrowLeft = 'ArrowLeft',
  ArrowRight = 'ArrowRight',
  ArrowDown = 'ArrowDown',
}

export type ArrowKeyParams = {
  [key in ArrowKeyInputs]: {
    input: string;
    params: [boolean, number]
  }
}

export interface CellObject {
  value: number
  colIndex: number
  rowIndex: number
}
