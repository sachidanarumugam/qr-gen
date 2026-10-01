import { describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS } from './settings.js'
import { PRESETS, applyPreset, findPresetId } from './presets.js'

describe('PRESETS', () => {
  it('has at least six presets with unique ids and names', () => {
    expect(PRESETS.length).toBeGreaterThanOrEqual(6)
    expect(new Set(PRESETS.map((preset) => preset.id)).size).toBe(PRESETS.length)
    expect(new Set(PRESETS.map((preset) => preset.name)).size).toBe(PRESETS.length)
  })

  it('only uses a valid level, a margin of 0 to 10, and lowercase hex colors', () => {
    for (const preset of PRESETS) {
      expect(['L', 'M', 'Q', 'H']).toContain(preset.level)
      expect(preset.margin).toBeGreaterThanOrEqual(0)
      expect(preset.margin).toBeLessThanOrEqual(10)
      expect(preset.fgColor).toMatch(/^#[0-9a-f]{6}$/)
      expect(preset.bgColor).toMatch(/^#[0-9a-f]{6}$/)
    }
  })
})

describe('findPresetId', () => {
  it('matches the default settings to Classic', () => {
    expect(findPresetId(DEFAULT_SETTINGS)).toBe('classic')
  })

  it('returns null once any preset field differs', () => {
    expect(findPresetId({ ...DEFAULT_SETTINGS, margin: 3 })).toBeNull()
    expect(findPresetId({ ...DEFAULT_SETTINGS, fgColor: '#123456' })).toBeNull()
  })

  it('ignores size, because presets do not set it', () => {
    expect(findPresetId({ ...DEFAULT_SETTINGS, size: 1024 })).toBe('classic')
  })

  it('matches a preset regardless of hex letter case', () => {
    expect(findPresetId({ ...DEFAULT_SETTINGS, fgColor: '#141414', bgColor: '#F4F1EA' })).toBe('newsprint')
  })
})

describe('applyPreset', () => {
  it('copies the preset colors, level and margin, and keeps the size', () => {
    const next = applyPreset({ ...DEFAULT_SETTINGS, size: 512 }, 'poster')
    expect(next).toEqual({ size: 512, fgColor: '#000000', bgColor: '#ffffff', level: 'H', margin: 6 })
  })

  it('returns null for an unknown id', () => {
    expect(applyPreset(DEFAULT_SETTINGS, 'nope')).toBeNull()
  })
})
