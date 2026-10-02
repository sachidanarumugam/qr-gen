import { useEffect, useState } from 'react'
import { flipMemory, memoryWon, newMemory, releaseMismatch } from './memory.js'

const FLIP_BACK_MS = 700

function Shape({ name }) {
  if (name === 'circle') {
    return (
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <circle cx="40" cy="40" r="26" fill="none" stroke="currentColor" strokeWidth="8" />
      </svg>
    )
  }
  if (name === 'square') {
    return (
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <rect x="16" y="16" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="8" />
      </svg>
    )
  }
  if (name === 'plus') {
    return (
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <path d="M32 10h16v22h22v16H48v22H32V48H10V32h22z" fill="currentColor" />
      </svg>
    )
  }
  if (name === 'star') {
    return (
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <path d="M40 8l9 22h22l-18 14 7 22-20-14-20 14 7-22L8 30h22z" fill="currentColor" />
      </svg>
    )
  }
  if (name === 'triangle') {
    return (
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <path d="M40 12l30 52H10z" fill="none" stroke="currentColor" strokeWidth="8" strokeLinejoin="miter" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 80 80" aria-hidden="true">
      <path d="M40 8l24 32-24 32L16 40z" fill="none" stroke="currentColor" strokeWidth="8" strokeLinejoin="miter" />
    </svg>
  )
}

export default function MemoryMatch({ onWin }) {
  const [state, setState] = useState(() => newMemory())

  useEffect(() => {
    if (!state.locked) return undefined
    const timer = window.setTimeout(() => setState((current) => releaseMismatch(current)), FLIP_BACK_MS)
    return () => window.clearTimeout(timer)
  }, [state.locked])

  useEffect(() => {
    if (memoryWon(state)) onWin()
  }, [state, onWin])

  function flip(index) {
    setState((current) => flipMemory(current, index))
  }

  return (
    <div className="game-play">
      <p className="game-status" role="status">
        Moves: {state.moves}
      </p>
      <div className="board board-4" role="grid" aria-label="Memory match">
        {state.deck.map((shape, index) => {
          const shown = state.up.includes(index) || state.matched.includes(shape)
          return (
            <button
              key={index}
              type="button"
              className={shown ? 'tile tile-up pressable' : 'tile tile-down pressable'}
              aria-label={shown ? `Card ${index + 1}, ${shape}` : `Card ${index + 1}, face down`}
              disabled={shown}
              onClick={() => flip(index)}
            >
              {shown ? <Shape name={shape} /> : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
