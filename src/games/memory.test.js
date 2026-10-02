import { describe, expect, it } from 'vitest'
import { createDeck, flipMemory, memoryWon, newMemory, releaseMismatch } from './memory.js'

function fresh() {
  return {
    deck: [
      'circle',
      'circle',
      'square',
      'square',
      'plus',
      'plus',
      'star',
      'star',
      'triangle',
      'triangle',
      'diamond',
      'diamond',
    ],
    up: [],
    matched: [],
    moves: 0,
    locked: false,
  }
}

describe('memory match', () => {
  it('builds six pairs', () => {
    const deck = createDeck(() => 0)
    expect(deck).toHaveLength(12)
    expect(new Set(deck).size).toBe(6)
  })

  it('keeps a matching pair face up and counts one move', () => {
    const next = flipMemory(flipMemory(fresh(), 0), 1)
    expect(next.matched).toEqual(['circle'])
    expect(next.up).toEqual([])
    expect(next.moves).toBe(1)
    expect(next.locked).toBe(false)
  })

  it('locks a mismatch, ignores clicks until it is released, then flips back', () => {
    const opened = flipMemory(flipMemory(fresh(), 0), 2)
    expect(opened.locked).toBe(true)
    expect(opened.matched).toEqual([])
    expect(opened.moves).toBe(1)
    expect(flipMemory(opened, 3)).toBe(opened)
    expect(releaseMismatch(opened)).toMatchObject({ up: [], locked: false })
  })

  it('ignores a second click on the same card and a card already matched', () => {
    const once = flipMemory(fresh(), 0)
    expect(flipMemory(once, 0)).toBe(once)
    const matched = flipMemory(once, 1)
    expect(flipMemory(matched, 0)).toBe(matched)
  })

  it('is won only when every pair is matched', () => {
    const done = { ...fresh(), matched: ['circle', 'square', 'plus', 'star', 'triangle', 'diamond'] }
    expect(memoryWon(done)).toBe(true)
    expect(memoryWon(newMemory(() => 0))).toBe(false)
  })
})
