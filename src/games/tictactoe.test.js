import { describe, expect, it } from 'vitest'
import { computerMove, isDraw, playTurn, winner } from './tictactoe.js'

const empty = Array(9).fill(null)

describe('winner and draw', () => {
  it('finds a row, a column and a diagonal', () => {
    const row = empty.slice()
    row[3] = 'X'
    row[4] = 'X'
    row[5] = 'X'
    expect(winner(row)).toBe('X')

    const column = empty.slice()
    column[1] = 'O'
    column[4] = 'O'
    column[7] = 'O'
    expect(winner(column)).toBe('O')

    const diagonal = empty.slice()
    diagonal[0] = 'X'
    diagonal[4] = 'X'
    diagonal[8] = 'X'
    expect(winner(diagonal)).toBe('X')
  })

  it('treats a full board with no line as a draw', () => {
    const board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X']
    expect(winner(board)).toBe(null)
    expect(isDraw(board)).toBe(true)
    expect(isDraw(empty)).toBe(false)
  })
})

describe('computerMove', () => {
  it('takes a winning cell instead of a random one', () => {
    const board = ['O', 'O', null, 'X', 'X', null, null, null, null]
    expect(computerMove(board, () => 0)).toBe(2)
  })

  it('blocks the player when it cannot win immediately', () => {
    const board = ['X', 'X', null, null, 'O', null, null, null, null]
    expect(computerMove(board, () => 0)).toBe(2)
  })

  it('picks a random empty cell when nothing is forced', () => {
    const board = empty.slice()
    board[0] = 'X'
    expect(computerMove(board, () => 0)).toBe(1)
    expect(computerMove(board, () => 0.99)).toBe(8)
  })
})

describe('playTurn', () => {
  it('wins, loses and draws, and ignores an occupied cell', () => {
    const almost = ['X', 'X', null, 'O', null, null, 'O', null, null]
    expect(playTurn(almost, 2).outcome).toBe('win')

    const threat = ['O', 'O', null, null, null, null, null, null, null]
    expect(playTurn(threat, 8).outcome).toBe('loss')

    const last = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', null]
    expect(playTurn(last, 8).outcome).toBe('draw')

    const taken = empty.slice()
    taken[0] = 'X'
    expect(playTurn(taken, 0).board).toBe(taken)
  })
})
