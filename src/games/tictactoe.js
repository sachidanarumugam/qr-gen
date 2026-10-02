export const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

export function winner(board) {
  for (const [a, b, c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a]
  }
  return null
}

export function isDraw(board) {
  return winner(board) === null && board.every(Boolean)
}

// The first empty cell that would finish a line for `mark`, or null.
export function findWinningMove(board, mark) {
  for (let index = 0; index < board.length; index += 1) {
    if (board[index]) continue
    const next = board.slice()
    next[index] = mark
    if (winner(next) === mark) return index
  }
  return null
}

// Take a win, otherwise block the player, otherwise a random empty cell.
export function computerMove(board, random = Math.random) {
  const win = findWinningMove(board, 'O')
  if (win !== null) return win
  const block = findWinningMove(board, 'X')
  if (block !== null) return block
  const open = []
  for (let index = 0; index < board.length; index += 1) {
    if (!board[index]) open.push(index)
  }
  if (open.length === 0) return null
  const pick = Math.floor(random() * open.length)
  return open[Math.min(pick, open.length - 1)]
}

// Applies the player's mark, then the computer's reply. `outcome` is 'win', 'loss', 'draw' or null.
export function playTurn(board, index, random = Math.random) {
  if (board[index] || winner(board) || isDraw(board)) return { board, outcome: null }
  const next = board.slice()
  next[index] = 'X'
  if (winner(next) === 'X') return { board: next, outcome: 'win' }
  if (isDraw(next)) return { board: next, outcome: 'draw' }
  const reply = computerMove(next, random)
  if (reply === null) return { board: next, outcome: null }
  next[reply] = 'O'
  if (winner(next) === 'O') return { board: next, outcome: 'loss' }
  if (isDraw(next)) return { board: next, outcome: 'draw' }
  return { board: next, outcome: null }
}
