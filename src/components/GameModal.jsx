import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import CheckboxField from './CheckboxField.jsx'
import TicTacToe from '../games/TicTacToe.jsx'
import MemoryMatch from '../games/MemoryMatch.jsx'
import QuickTap from '../games/QuickTap.jsx'
import useFocusTrap from '../hooks/useFocusTrap.js'
import './GameModal.css'

const EXIT_MS = 200
const WON_MS = 1100

const GAMES = [
  { id: 'tictactoe', label: 'Tic-tac-toe' },
  { id: 'memory', label: 'Memory match' },
  { id: 'tap', label: 'Quick tap' },
]

export default function GameModal({ gamesOn, onGamesOnChange, onReveal, onDismiss }) {
  const dialogRef = useRef(null)
  const firstRef = useRef(null)
  const revealRef = useRef(onReveal)
  const dismissRef = useRef(onDismiss)
  const [screen, setScreen] = useState('pick')
  const [round, setRound] = useState(0)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    revealRef.current = onReveal
    dismissRef.current = onDismiss
  })

  function dismiss() {
    if (closing) return
    setClosing(true)
    window.setTimeout(() => dismissRef.current(), EXIT_MS)
  }

  useFocusTrap(dialogRef, !closing, dismiss, firstRef)

  useEffect(() => {
    firstRef.current?.focus({ preventScroll: true })
  }, [screen, round])

  useEffect(() => {
    if (screen !== 'won') return undefined
    const timer = window.setTimeout(() => revealRef.current(), WON_MS)
    return () => window.clearTimeout(timer)
  }, [screen])

  function openGame(id) {
    setRound((value) => value + 1)
    setScreen(id)
  }

  const title =
    screen === 'won'
      ? 'You won!'
      : screen === 'pick'
        ? 'Want to play a quick game?'
        : GAMES.find((game) => game.id === screen).label

  return (
    <div
      className={closing ? 'overlay game-overlay is-closing' : 'overlay game-overlay'}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) dismiss()
      }}
    >
      {screen === 'won' ? (
        <div className="confetti" aria-hidden="true">
          {Array.from({ length: 24 }, (_, index) => (
            <span
              key={index}
              className={`confetti-piece confetti-${['lime', 'white', 'black'][index % 3]}`}
              style={{
                '--dx': `${Math.round(Math.cos((index / 24) * Math.PI * 2) * (120 + (index % 5) * 28))}px`,
                '--dy': `${Math.round(Math.sin((index / 24) * Math.PI * 2) * (90 + (index % 4) * 24)) - 20}px`,
                '--rotate': `${(index * 80) % 360}deg`,
                '--delay': `${(index % 6) * 30}ms`,
                '--size': `${12 + (index % 4) * 3}px`,
              }}
            />
          ))}
        </div>
      ) : null}
      <div
        ref={dialogRef}
        className="modal game-modal on-light"
        role="dialog"
        aria-modal="true"
        aria-labelledby="game-title"
        tabIndex={-1}
      >
        <button
          ref={screen === 'won' ? firstRef : undefined}
          type="button"
          className="modal-close pressable"
          onClick={dismiss}
          aria-label="Close"
        >
          <X size={22} strokeWidth={3} aria-hidden="true" />
        </button>
        <h2 id="game-title" className="game-title">
          {title}
        </h2>
        {screen === 'pick' ? (
          <>
            <p className="game-sub">Win to reveal your QR with a bang. Or skip, no pressure.</p>
            <div className="game-actions">
              {GAMES.map((game, index) => (
                <button
                  key={game.id}
                  ref={index === 0 ? firstRef : undefined}
                  type="button"
                  className="btn btn-lime pressable"
                  onClick={() => openGame(game.id)}
                >
                  {game.label}
                </button>
              ))}
              <button type="button" className="btn btn-white pressable" onClick={() => revealRef.current()}>
                No thanks, just download
              </button>
            </div>
            <CheckboxField
              label="Don't ask again"
              checked={!gamesOn}
              onChange={(checked) => onGamesOnChange(!checked)}
            />
          </>
        ) : null}
        {screen === 'tictactoe' ? <TicTacToe key={round} onWin={() => setScreen('won')} /> : null}
        {screen === 'memory' ? <MemoryMatch key={round} onWin={() => setScreen('won')} /> : null}
        {screen === 'tap' ? <QuickTap key={round} onWin={() => setScreen('won')} /> : null}
        {screen === 'won' ? <p className="game-sub">Your code is ready.</p> : null}
        {screen !== 'pick' && screen !== 'won' ? (
          <div className="game-nav">
            <button ref={firstRef} type="button" className="btn btn-white pressable" onClick={() => setScreen('pick')}>
              Back
            </button>
            <button type="button" className="btn btn-white pressable" onClick={() => revealRef.current()}>
              Skip & download
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
