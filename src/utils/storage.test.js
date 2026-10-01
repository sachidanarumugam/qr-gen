import { describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS } from './settings.js'
import {
  RECENT_KEY,
  RECENT_LIMIT,
  addRecent,
  formatSavedAt,
  isRecentEntry,
  loadRecent,
  parseRecent,
  removeRecent,
  sameQr,
  saveRecent,
  summarizeEntry,
} from './storage.js'

function entry(overrides = {}) {
  return {
    id: 'id-1',
    type: 'url',
    fields: { url: 'https://example.com' },
    settings: { ...DEFAULT_SETTINGS },
    createdAt: '2026-10-01T14:05:00.000Z',
    ...overrides,
  }
}

function memory(initial = {}) {
  const data = new Map(Object.entries(initial))
  return {
    data,
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
  }
}

describe('isRecentEntry', () => {
  it('accepts a complete entry', () => {
    expect(isRecentEntry(entry())).toBe(true)
  })

  it('rejects a missing field, a bad level, and an unparseable date', () => {
    expect(isRecentEntry(entry({ fields: { url: 1 } }))).toBe(false)
    expect(isRecentEntry(entry({ settings: { ...DEFAULT_SETTINGS, level: 'X' } }))).toBe(false)
    expect(isRecentEntry(entry({ createdAt: 'yesterday' }))).toBe(false)
    expect(isRecentEntry(entry({ id: '' }))).toBe(false)
    expect(isRecentEntry(null)).toBe(false)
  })

  it('accepts each QR type when its fields have the right shape', () => {
    expect(isRecentEntry(entry({ type: 'text', fields: { text: 'hi' } }))).toBe(true)
    expect(isRecentEntry(entry({ type: 'email', fields: { address: 'a@b.co', subject: '', body: '' } }))).toBe(true)
    expect(isRecentEntry(entry({ type: 'phone', fields: { phone: '+15551234567' } }))).toBe(true)
    expect(
      isRecentEntry(entry({ type: 'wifi', fields: { ssid: 'Home', security: 'WPA', password: 'secret12', hidden: false } })),
    ).toBe(true)
    expect(isRecentEntry(entry({ type: 'wifi', fields: { ssid: 'Home', security: 'WPA2', password: 'x', hidden: false } }))).toBe(false)
  })
})

describe('parseRecent', () => {
  it('returns an empty list for broken JSON and for a non-array', () => {
    expect(parseRecent('{')).toEqual([])
    expect(parseRecent('{"ok":true}')).toEqual([])
    expect(parseRecent('null')).toEqual([])
  })

  it('keeps valid entries and drops corrupt ones', () => {
    const raw = JSON.stringify([entry(), { id: 'bad' }, entry({ id: 'id-2' })])
    expect(parseRecent(raw).map((item) => item.id)).toEqual(['id-1', 'id-2'])
  })

  it('keeps at most 10 entries', () => {
    const raw = JSON.stringify(Array.from({ length: 12 }, (_, index) => entry({ id: `id-${index}` })))
    expect(parseRecent(raw)).toHaveLength(RECENT_LIMIT)
  })
})

describe('loadRecent and saveRecent', () => {
  it('reads and writes the versioned key', () => {
    const store = memory()
    expect(saveRecent([entry()], store)).toBe(true)
    expect(store.data.has(RECENT_KEY)).toBe(true)
    expect(loadRecent(store)).toEqual([entry()])
  })

  it('returns an empty list when the store throws or is empty', () => {
    expect(loadRecent({ getItem: () => { throw new Error('blocked') } })).toEqual([])
    expect(loadRecent(memory())).toEqual([])
  })

  it('returns false on a quota error and leaves the app running', () => {
    const store = { setItem: () => { throw new Error('quota') } }
    expect(saveRecent([entry()], store)).toBe(false)
  })

  it('drops corrupt data on read instead of throwing', () => {
    expect(loadRecent(memory({ [RECENT_KEY]: 'not json' }))).toEqual([])
  })
})

describe('addRecent', () => {
  it('puts the new entry first and caps the list at 10', () => {
    const existing = Array.from({ length: 10 }, (_, index) => entry({ id: `id-${index}`, fields: { url: `https://e${index}.com` } }))
    const next = addRecent(existing, entry({ id: 'new', fields: { url: 'https://new.com' } }))
    expect(next).toHaveLength(10)
    expect(next[0].id).toBe('new')
    expect(next.some((item) => item.id === 'id-9')).toBe(false)
  })

  it('skips a save that matches the newest entry, including different key order', () => {
    const current = entry({ fields: { url: 'https://example.com' } })
    const again = entry({ id: 'other', createdAt: '2026-10-02T00:00:00.000Z', fields: { url: 'https://example.com' } })
    expect(sameQr(current, again)).toBe(true)
    const result = addRecent([current], again)
    expect(result).toHaveLength(1)
    expect(result[0]).toBe(current)
  })

  it('does not skip an older duplicate', () => {
    const older = entry({ id: 'old', fields: { url: 'https://old.com' } })
    const newer = entry({ id: 'new', fields: { url: 'https://new.com' } })
    const repeat = entry({ id: 'repeat', fields: { url: 'https://old.com' } })
    expect(addRecent([newer, older], repeat).map((item) => item.id)).toEqual(['repeat', 'new', 'old'])
  })
})

describe('removeRecent', () => {
  it('removes one entry by id', () => {
    expect(removeRecent([entry({ id: 'a' }), entry({ id: 'b' })], 'a').map((item) => item.id)).toEqual(['b'])
  })
})

describe('summarizeEntry', () => {
  it('shows the useful text for each type', () => {
    expect(summarizeEntry(entry())).toBe('https://example.com')
    expect(summarizeEntry(entry({ type: 'text', fields: { text: '  hello   there \n' } }))).toBe('hello there')
    expect(summarizeEntry(entry({ type: 'email', fields: { address: ' me@example.com ', subject: 'Hi', body: '' } }))).toBe('me@example.com')
    expect(summarizeEntry(entry({ type: 'phone', fields: { phone: ' +1 555 ' } }))).toBe('+1 555')
  })

  it('hides a Wi-Fi password and says when there is none', () => {
    const wifi = entry({ type: 'wifi', fields: { ssid: 'Home', security: 'WPA', password: 'secret12', hidden: true } })
    expect(summarizeEntry(wifi)).toBe('Home · password hidden')
    expect(summarizeEntry(wifi)).not.toContain('secret12')
    expect(summarizeEntry({ ...wifi, fields: { ...wifi.fields, security: 'nopass' } })).toBe('Home · no password')
  })
})

describe('formatSavedAt', () => {
  it('formats the local date and time', () => {
    const date = new Date(2026, 9, 1, 14, 5, 9)
    expect(formatSavedAt(date.toISOString())).toBe('1 Oct 2026, 14:05')
  })
})
