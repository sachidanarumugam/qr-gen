import { useState } from 'react'
import { playTurn } from './tictactoe.js'

const EMPTY = Array(9).fill(null)

function label(cell, index) {
  const row = Math.floor(index / 3) + 1
  const column = (index % 3) + 1
  const mark = cell === 'X' || cell === 'O' ? cell : 'empty'
  return `Row ${row} column ${column}, ${mark}`
}

export default function TicTacToe({ onWin }) {
  const [board, setBoard] = useState(EMPTY)
  const [outcome, setOutcome] = useState(null)

  function play(index) {
    if (outcome) return
    const result = playTurn(board, index)
    if (result.outcome === null && result.board === board) return
    setBoard(result.board)
    setOutcome(result.outcome)
    if (result.outcome === 'win') onWin()
  }

  function retry() {
    setBoard(EMPTY)
    setOutcome(null)
  }

  const message = outcome === 'loss' ? 'Computer wins.' : outcome === 'draw' ? 'Draw.' : 'You are X.'

  return (
    <div className="game-play">
      <p className="game-status" role="status">
        {message}
      </p>
      <div className="board board-3" role="grid" aria-label="Tic-tac-toe">
        {board.map((cell, index) => (
          <button
            key={index}
            type="button"
            className="tile pressable"
            role="gridcell"
            aria-label={label(cell, index)}
            disabled={Boolean(cell) || Boolean(outcome)}
            onClick={() => play(index)}
          >
            {cell}
          </button>
        ))}
      </div>
      {outcome === 'loss' || outcome === 'draw' ? (
        <button type="button" className="btn btn-lime pressable" onClick={retry}>
          Try again
        </button>
      ) : null}
    </div>
  )
}
