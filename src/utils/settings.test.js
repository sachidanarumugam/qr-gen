import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SETTINGS,
  ERROR_LEVELS,
  MARGIN_LIMITS,
  SIZE_LIMITS,
  clampInt,
  describeLevel,
  normalizeHex,
  parseIntInRange,
} from './settings.js'

describe('defaults', () => {
  it('match the spec', () => {
    expect(DEFAULT_SETTINGS).toEqual({ size: 1024, level: 'Q', fgColor: '#000000', bgColor: '#ffffff', margin: 4 })
    expect(SIZE_LIMITS).toEqual({ min: 128, max: 1024 })
    expect(describeLevel(DEFAULT_SETTINGS.level)).toBe(
      'Quartile (Q): the code still scans if about 25% of it is damaged or covered.',
    )
  })
})

describe('parseIntInRange', () => {
  it('accepts whole numbers inside the limits', () => {
    expect(parseIntInRange('300', SIZE_LIMITS)).toBe(300)
    expect(parseIntInRange('128', SIZE_LIMITS)).toBe(128)
    expect(parseIntInRange('1024', SIZE_LIMITS)).toBe(1024)
    expect(parseIntInRange('0', MARGIN_LIMITS)).toBe(0)
  })

  it('rounds decimals', () => {
    expect(parseIntInRange('200.6', SIZE_LIMITS)).toBe(201)
  })

  it('returns null for values outside the limits', () => {
    expect(parseIntInRange('3', SIZE_LIMITS)).toBeNull()
    expect(parseIntInRange('127', SIZE_LIMITS)).toBeNull()
    expect(parseIntInRange('1025', SIZE_LIMITS)).toBeNull()
    expect(parseIntInRange('-1', MARGIN_LIMITS)).toBeNull()
  })

  it('returns null for empty or non-numeric text, never NaN', () => {
    expect(parseIntInRange('', SIZE_LIMITS)).toBeNull()
    expect(parseIntInRange('   ', SIZE_LIMITS)).toBeNull()
    expect(parseIntInRange('abc', SIZE_LIMITS)).toBeNull()
    expect(parseIntInRange('Infinity', SIZE_LIMITS)).toBeNull()
  })
})

describe('clampInt', () => {
  it('keeps values inside the limits', () => {
    expect(clampInt('512', SIZE_LIMITS, 256)).toBe(512)
    expect(clampInt(7, MARGIN_LIMITS, 4)).toBe(7)
  })

  it('clamps values outside the limits', () => {
    expect(clampInt('5', SIZE_LIMITS, 256)).toBe(128)
    expect(clampInt('5000', SIZE_LIMITS, 256)).toBe(1024)
    expect(clampInt('-3', MARGIN_LIMITS, 4)).toBe(0)
    expect(clampInt('99', MARGIN_LIMITS, 4)).toBe(10)
  })

  it('rounds decimals before clamping', () => {
    expect(clampInt('4.5', MARGIN_LIMITS, 4)).toBe(5)
  })

  it('returns the fallback for empty or non-numeric input, never NaN', () => {
    expect(clampInt('', SIZE_LIMITS, 256)).toBe(256)
    expect(clampInt('  ', SIZE_LIMITS, 256)).toBe(256)
    expect(clampInt('abc', SIZE_LIMITS, 256)).toBe(256)
    expect(clampInt(NaN, SIZE_LIMITS, 256)).toBe(256)
    expect(clampInt(undefined, SIZE_LIMITS, 256)).toBe(256)
  })
})

describe('normalizeHex', () => {
  it('accepts #RRGGBB and lowercases it', () => {
    expect(normalizeHex('#1A73E8')).toBe('#1a73e8')
    expect(normalizeHex('#000000')).toBe('#000000')
  })

  it('expands #RGB to #RRGGBB', () => {
    expect(normalizeHex('#fff')).toBe('#ffffff')
    expect(normalizeHex('#1aE')).toBe('#11aaee')
  })

  it('ignores surrounding spaces', () => {
    expect(normalizeHex('  #abc ')).toBe('#aabbcc')
  })

  it('returns null for anything else', () => {
    expect(normalizeHex('')).toBeNull()
    expect(normalizeHex('fff')).toBeNull()
    expect(normalizeHex('#ff')).toBeNull()
    expect(normalizeHex('#ffff')).toBeNull()
    expect(normalizeHex('#fffff')).toBeNull()
    expect(normalizeHex('#fffffff')).toBeNull()
    expect(normalizeHex('#ggg')).toBeNull()
    expect(normalizeHex('red')).toBeNull()
  })
})

describe('describeLevel', () => {
  it('describes every level with its recovery percentage', () => {
    const expected = { L: 7, M: 15, Q: 25, H: 30 }
    for (const { value } of ERROR_LEVELS) {
      expect(describeLevel(value)).toContain(`about ${expected[value]}%`)
    }
  })

  it('names the selected level', () => {
    expect(describeLevel('M')).toBe('Medium (M): the code still scans if about 15% of it is damaged or covered.')
  })
})
