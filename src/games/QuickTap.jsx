import { useEffect, useState } from 'react'
import { TAP_LIMIT_MS, TAP_MOVE_MS, TAP_MOVE_SLOW_MS, otherCell, scoreHit, tapWon } from './quicktap.js'

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function QuickTap({ onWin }) {
  const [lit, setLit] = useState(0)
  const [score, setScore] = useState(0)
  const [left, setLeft] = useState(TAP_LIMIT_MS)
  const [done, setDone] = useState(false)
  const [round, setRound] = useState(0)

  useEffect(() => {
    if (done) return undefined
    const moveMs = prefersReducedMotion() ? TAP_MOVE_SLOW_MS : TAP_MOVE_MS
    const started = performance.now()
    const move = window.setInterval(() => {
      setLit((current) => otherCell(current))
    }, moveMs)
    const clock = window.setInterval(() => {
      const remaining = TAP_LIMIT_MS - (performance.now() - started)
      if (remaining <= 0) {
        setLeft(0)
        setDone(true)
        return
      }
      setLeft(remaining)
    }, 100)
    return () => {
      window.clearInterval(move)
      window.clearInterval(clock)
    }
  }, [done, round])

  function tap(index) {
    if (done) return
    const next = scoreHit(score, index, lit)
    setScore(next)
    if (index === lit) setLit((current) => otherCell(current))
    if (tapWon(next)) {
      setDone(true)
      onWin()
    }
  }

  function retry() {
    setLit(0)
    setScore(0)
    setLeft(TAP_LIMIT_MS)
    setDone(false)
    setRound((value) => value + 1)
  }

  const seconds = Math.ceil(left / 1000)

  return (
    <div className="game-play">
      <p className="game-status" role="status">
        Score {score} of 8. Time {seconds}s.
      </p>
      <div className="board board-3" role="grid" aria-label="Quick tap">
        {Array.from({ length: 9 }, (_, index) => {
          const row = Math.floor(index / 3) + 1
          const column = (index % 3) + 1
          const active = index === lit && !done
          return (
            <button
              key={index}
              type="button"
              className={active ? 'tile tile-lit pressable' : 'tile pressable'}
              aria-label={active ? `Row ${row} column ${column}, lit` : `Row ${row} column ${column}`}
              onClick={() => tap(index)}
            />
          )
        })}
      </div>
      {done && score < 8 ? (
        <button type="button" className="btn btn-lime pressable" onClick={retry}>
          Try again
        </button>
      ) : null}
    </div>
  )
}
