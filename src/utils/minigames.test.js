import { describe, expect, it } from 'vitest'
import { MINI_GAMES_KEY, loadMiniGamesEnabled, saveMiniGamesEnabled } from './minigames.js'

function memory(initial) {
  const data = new Map(initial ? Object.entries(initial) : [])
  return {
    data,
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
  }
}

describe('mini-games preference', () => {
  it('stays on when nothing is saved or the saved value is unusable', () => {
    expect(loadMiniGamesEnabled(memory())).toBe(true)
    expect(loadMiniGamesEnabled(memory({ [MINI_GAMES_KEY]: 'on' }))).toBe(true)
    expect(loadMiniGamesEnabled(memory({ [MINI_GAMES_KEY]: 'maybe' }))).toBe(true)
    expect(loadMiniGamesEnabled(memory({ [MINI_GAMES_KEY]: '{]' }))).toBe(true)
  })

  it('turns off only for the off value, and survives a storage failure', () => {
    const store = memory()
    expect(saveMiniGamesEnabled(false, store)).toBe(true)
    expect(store.data.get(MINI_GAMES_KEY)).toBe('off')
    expect(loadMiniGamesEnabled(store)).toBe(false)

    expect(saveMiniGamesEnabled(true, store)).toBe(true)
    expect(loadMiniGamesEnabled(store)).toBe(true)

    const broken = {
      getItem() {
        throw new Error('blocked')
      },
      setItem() {
        throw new Error('blocked')
      },
    }
    expect(loadMiniGamesEnabled(broken)).toBe(true)
    expect(saveMiniGamesEnabled(false, broken)).toBe(false)
  })
})
