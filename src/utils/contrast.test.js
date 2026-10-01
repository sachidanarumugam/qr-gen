import { describe, expect, it } from 'vitest'
import { PRESETS } from './presets.js'
import { contrastRatio, getScanWarnings, isForegroundLighter, relativeLuminance } from './contrast.js'

describe('relativeLuminance', () => {
  it('is 0 for black and 1 for white', () => {
    expect(relativeLuminance('#000000')).toBe(0)
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1, 5)
  })

  it('accepts #RGB and ignores case', () => {
    expect(relativeLuminance('#FFF')).toBeCloseTo(relativeLuminance('#ffffff'), 5)
  })

  it('rejects a color that is not hex', () => {
    expect(() => relativeLuminance('red')).toThrow('Invalid color')
  })
})

describe('contrastRatio', () => {
  it('is 21 for black on white and 1 for the same color', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5)
    expect(contrastRatio('#112233', '#112233')).toBeCloseTo(1, 5)
  })

  it('does not depend on which color is passed first', () => {
    expect(contrastRatio('#141414', '#f4f1ea')).toBeCloseTo(contrastRatio('#f4f1ea', '#141414'), 5)
  })
})

describe('isForegroundLighter', () => {
  it('is false for dark marks on a light background', () => {
    expect(isForegroundLighter('#000000', '#ffffff')).toBe(false)
  })

  it('is true when the colors are swapped', () => {
    expect(isForegroundLighter('#ffffff', '#000000')).toBe(true)
  })
})

describe('presets', () => {
  it('keeps every preset dark on light with contrast of at least 4 to 1', () => {
    for (const preset of PRESETS) {
      expect(contrastRatio(preset.fgColor, preset.bgColor)).toBeGreaterThanOrEqual(4)
      expect(isForegroundLighter(preset.fgColor, preset.bgColor)).toBe(false)
    }
  })
})

describe('getScanWarnings', () => {
  const fine = { fgColor: '#000000', bgColor: '#ffffff', size: 256, margin: 4, payloadLength: 20 }

  it('is quiet for a normal code', () => {
    expect(getScanWarnings(fine)).toEqual([])
  })

  it('warns below 4 to 1 and uses the strong wording below 2 to 1', () => {
    const mild = getScanWarnings({ ...fine, fgColor: '#6b93c9' })
    expect(mild.find((item) => item.id === 'contrast').strong).toBe(false)
    expect(mild.find((item) => item.id === 'contrast').text).toContain('hard to tell apart')

    const strong = getScanWarnings({ ...fine, fgColor: '#d8d8d8' })
    expect(strong.find((item) => item.id === 'contrast').strong).toBe(true)
    expect(strong.find((item) => item.id === 'contrast').text).toContain('too close')
    expect(strong.filter((item) => item.id === 'contrast')).toHaveLength(1)
  })

  it('warns when the foreground is lighter than the background', () => {
    const warnings = getScanWarnings({ ...fine, fgColor: '#ffffff', bgColor: '#000000' })
    expect(warnings.some((item) => item.id === 'inverted')).toBe(true)
  })

  it('warns for a small size or a short quiet zone', () => {
    expect(getScanWarnings({ ...fine, size: 159 }).some((item) => item.id === 'size')).toBe(true)
    expect(getScanWarnings({ ...fine, size: 160 }).some((item) => item.id === 'size')).toBe(false)
    expect(getScanWarnings({ ...fine, margin: 3 }).some((item) => item.id === 'margin')).toBe(true)
    expect(getScanWarnings({ ...fine, margin: 4 }).some((item) => item.id === 'margin')).toBe(false)
  })

  it('warns for a long payload only when the size is under 256', () => {
    expect(getScanWarnings({ ...fine, payloadLength: 201, size: 255 }).some((item) => item.id === 'length')).toBe(true)
    expect(getScanWarnings({ ...fine, payloadLength: 201, size: 256 }).some((item) => item.id === 'length')).toBe(false)
    expect(getScanWarnings({ ...fine, payloadLength: 200, size: 128 }).some((item) => item.id === 'length')).toBe(false)
  })
})
