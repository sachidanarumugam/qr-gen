import { describe, expect, it } from 'vitest'
import { THEME_COLOR, THEME_KEY, applyTheme, loadTheme, saveTheme } from './theme.js'

function memory(initial) {
  const data = new Map(initial ? Object.entries(initial) : [])
  return {
    data,
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
  }
}

describe('theme setting', () => {
  it('defaults to light when nothing is saved', () => {
    expect(loadTheme(memory())).toBe('light')
  })

  it('persists the choice and restores it', () => {
    const store = memory()
    expect(saveTheme('dark', store)).toBe(true)
    expect(store.data.get(THEME_KEY)).toBe('dark')
    expect(loadTheme(store)).toBe('dark')

    expect(saveTheme('light', store)).toBe(true)
    expect(store.data.get(THEME_KEY)).toBe('light')
    expect(loadTheme(store)).toBe('light')
  })

  it('falls back to light when storage is corrupted or unreadable', () => {
    expect(loadTheme(memory({ [THEME_KEY]: 'maybe' }))).toBe('light')
    expect(loadTheme(memory({ [THEME_KEY]: '{]' }))).toBe('light')
    expect(loadTheme(memory({ [THEME_KEY]: '' }))).toBe('light')
    expect(loadTheme(memory({ [THEME_KEY]: 'DARK' }))).toBe('light')
    expect(loadTheme(memory({ [THEME_KEY]: 'true' }))).toBe('light')

    const broken = {
      getItem() {
        throw new Error('blocked')
      },
      setItem() {
        throw new Error('blocked')
      },
    }
    expect(loadTheme(broken)).toBe('light')
    expect(saveTheme('dark', broken)).toBe(false)
  })

  it('applies dark on the document and restores light by clearing it', () => {
    const meta = { content: THEME_COLOR.light, setAttribute(name, value) { this[name === 'content' ? 'content' : name] = value } }
    const attrs = new Map()
    const doc = {
      documentElement: {
        setAttribute: (name, value) => attrs.set(name, value),
        removeAttribute: (name) => attrs.delete(name),
      },
      querySelector: () => meta,
    }

    applyTheme('dark', doc)
    expect(attrs.get('data-theme')).toBe('dark')
    expect(meta.content).toBe(THEME_COLOR.dark)

    applyTheme('light', doc)
    expect(attrs.has('data-theme')).toBe(false)
    expect(meta.content).toBe(THEME_COLOR.light)

    applyTheme('nope', doc)
    expect(attrs.has('data-theme')).toBe(false)
  })
})
