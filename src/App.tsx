import { useCallback, useEffect, useState } from 'react'
import './App.css'
import { arrowKeyParams } from './const'
import { ArrowKeyInputs, CellObject, GameField, GameState } from './types'

function App() {
  const [lastInput, setLastInput] = useState<string>('')
  const [gameState, setGameState] = useState<GameState>(GameState.inProgress)

  const getInitialGameField = (): GameField => {
    const initialGameField = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]

    const colIndex = Math.round(Math.random() * 3)
    const rowIndex = Math.round(Math.random() * 3)

    initialGameField[rowIndex][colIndex] = 2

    return {
      gameField: initialGameField,
      prevGameField: null,
      lastAdded: [rowIndex, colIndex],
      maxNumber: 0,
    }
  }

  const [gameField, setGameField] = useState<GameField>(
    getInitialGameField()
  )

  const getRandomAvailablePosition = (_gameFieldState?: number[][]): GameField['lastAdded'] => {
    const gameFieldState = _gameFieldState ?? gameField.gameField

    const availableSpaces = gameFieldState.reduce<number[][]>((result, row, rowIndex) => {
      for (let colIndex = 0; colIndex < 4; colIndex++) {
        if (!row[colIndex]) {
          result.push([rowIndex, colIndex])
        }
      }

      return result
    }, [])

    if (!availableSpaces.length) return null

    const cellIndex = Math.round(Math.random() * (availableSpaces.length - 1))
    return availableSpaces[cellIndex]
  }

  const getCell = (tempGameField: number[][], isColumn: boolean, primIndex: number, secIndex: number): CellObject => {
    if (isColumn) {
      return {
        value: tempGameField[secIndex][primIndex],
        colIndex: primIndex,
        rowIndex: secIndex,
      }
    }

    return {
      value: tempGameField[primIndex][secIndex],
      colIndex: secIndex,
      rowIndex: primIndex,
    }
  }

  // main game logic function
  // general idea is that when a button is pressed, we iterate every row (for left / right) or column (for up / down)
  // starting from the same side as the pressed button (ie user pressed right, this means everything will move towards right 'wall',
  // so we iterate every row from the right side, meaning from last index to 0)
  // if the first cell contains a 0, we will move first non-zero number in the same row / column to that position, and then check the rest of the row
  // if a cell we're checking is not a 0, we check for matching number instead of non-zero value, and if we find it, we double the value in the current cell
  // and reset the found cell, then check the rest of the row starting from the next cell (to avoid situation where 0 4 2 2 transforms into 0 0 0 8)
  // after every mutation keep previous state, find a random space to add the next element and keep it too to display a golden border
  const calculateNewGameField = useCallback((isColumn: boolean, start: number) => {
    const params = start === 0 ? {
      end: 4,
      modifier: 1,
    } : {
      end: -1,
      modifier: -1,
    }
    let maxNumber = gameField.maxNumber

    let tempGameField = gameField.gameField.map((row) => [...row])
    let currentCell: CellObject | null = null
    for (let primIndex = 0; primIndex < 4; primIndex++) {
      currentCell = null // reset between rows / columns
      for (let secIndex = start; secIndex !== params.end; secIndex = secIndex + params.modifier) {
        const nextCell = getCell(tempGameField, isColumn, primIndex, secIndex)
        if (!currentCell) {
          currentCell = nextCell
        } else {
          if (currentCell.value === 0) {
            if (nextCell.value !== 0) {
              tempGameField[currentCell.rowIndex][currentCell.colIndex] = nextCell.value
              currentCell.value = nextCell.value

              tempGameField[nextCell.rowIndex][nextCell.colIndex] = 0
            }
          } else {
            if (nextCell.value === currentCell.value) {
              const newValue = nextCell.value * 2
              if (newValue > maxNumber) {
                maxNumber = newValue
              }

              tempGameField[currentCell.rowIndex][currentCell.colIndex] = newValue
              tempGameField[nextCell.rowIndex][nextCell.colIndex] = 0

              const newCurrentCellRowIndex: number = isColumn ? currentCell.rowIndex + params.modifier : currentCell.rowIndex
              const newCurrentCellColIndex: number = isColumn ? currentCell.colIndex : currentCell.colIndex + params.modifier

              currentCell = {
                value: tempGameField[newCurrentCellRowIndex][newCurrentCellColIndex],
                colIndex: newCurrentCellColIndex,
                rowIndex: newCurrentCellRowIndex,
              }
            } else if (nextCell.value !== 0) {
              currentCell = {
                value: nextCell.value,
                colIndex: isColumn ? currentCell.colIndex : currentCell.colIndex + params.modifier,
                rowIndex: isColumn ? currentCell.rowIndex + params.modifier : currentCell.rowIndex,
              }

              tempGameField[nextCell.rowIndex][nextCell.colIndex] = 0
              tempGameField[currentCell.rowIndex][currentCell.colIndex] = nextCell.value
            }
          }
        }
      }
    }

    const newElementPosition = getRandomAvailablePosition(tempGameField)
    if (!newElementPosition) {
      setGameState(GameState.gameOver)
      return
    }

    const [rowIndex, colIndex] = newElementPosition
    tempGameField[rowIndex][colIndex] = 2
    setGameField({
      gameField: tempGameField,
      prevGameField: gameField.gameField,
      lastAdded: newElementPosition,
      maxNumber,
    })

    if (maxNumber === 2048) {
      setGameState(GameState.gameWon)
    }
  }, [gameField])

  // had to wrap this and calculateNewGameField with 'useCallback' for useEffect with keyboard listener to work properly
  const handleButtonClick = useCallback((key: ArrowKeyInputs) => {
    const params = arrowKeyParams[key]
    setLastInput(params.input)
    calculateNewGameField(...params.params)
  }, [calculateNewGameField])

  useEffect(() => {
    const keyboardListener = (event: KeyboardEvent) => {
      if (event.key in arrowKeyParams) {
        event.preventDefault()
        handleButtonClick(event.key as ArrowKeyInputs)
      }
    }

    document.addEventListener('keydown', keyboardListener);

    return () => {
      document.removeEventListener('keydown', keyboardListener)
    }
  }, [handleButtonClick])

  const handleUndo = () => {
    if (!gameField.prevGameField) return

    setLastInput('⟲')
    setGameField({
      gameField: gameField.prevGameField,
      prevGameField: null,
      lastAdded: null,
      maxNumber: gameField.maxNumber,
    })
  }

  const handleReset = () => {
    setGameField(getInitialGameField())
    setGameState(GameState.inProgress)
  }

  const gameRunning = gameState === GameState.inProgress

  return (
    <div className="container">
      <h2>Twenty-Forty-Eight! {lastInput}</h2>
      {!gameRunning && (
        <div className="gameEndMessage">
          <h2>
            {gameState === GameState.gameOver
              ? `Game over :( Max number reached: ${gameField.maxNumber}`
              : 'You won! Congrats'}!
          </h2>
          <h4>Play again?</h4>
          <button type="button" onClick={handleReset}>Yes!</button>
        </div>
      )}
      <div className={`mainSection ${gameRunning ? '' : 'gameSectionBlurred'}`}>
        <div className="gameWindow">
          {gameField.gameField.map((row, rowIndex) => (
            row.map((number, colIndex) => (
              <div
                key={`${rowIndex}_${colIndex}`}
                className={`number n${number} ${gameField.lastAdded?.[0] === rowIndex && gameField.lastAdded[1] === colIndex ? 'recentAdded' : ''}`}
              >
                {number || null}
              </div>
            ))
          ))}
        </div>
        <div className="controlPanel">
          <div className="outerButtonRow">
            <button
              type="button"
              className="controlButton"
              onClick={() => handleButtonClick(ArrowKeyInputs.ArrowUp)}
            >
              ↑
            </button>
          </div>
          <div className="innerButtonRow">
            <button
              type="button"
              className="controlButton"
              onClick={() => handleButtonClick(ArrowKeyInputs.ArrowLeft)}
            >
              ←
            </button>
            {!!gameField.prevGameField && (
              <button
                type="button"
                className="controlButton"
                onClick={handleUndo}
              >
                ⟲
              </button>
            )}
            <button
              type="button"
              className="controlButton"
              onClick={() => handleButtonClick(ArrowKeyInputs.ArrowRight)}
            >
              →
            </button>
          </div>
          <div className="outerButtonRow">
            <button
              type="button"
              className="controlButton"
              onClick={() => handleButtonClick(ArrowKeyInputs.ArrowDown)}
            >
              ↓
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
