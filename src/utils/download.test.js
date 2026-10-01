import { describe, expect, it } from 'vitest'
import { buildQrFilename } from './download.js'

describe('buildQrFilename', () => {
  const date = new Date(2026, 9, 1, 14, 5, 9)

  it('uses the type and a local YYYYMMDD-HHmmss stamp', () => {
    expect(buildQrFilename('url', date)).toBe('qr-url-20261001-140509.png')
  })

  it('pads single-digit months, days and times', () => {
    expect(buildQrFilename('wifi', new Date(2026, 0, 2, 3, 4, 5))).toBe('qr-wifi-20260102-030405.png')
  })

  it('keeps the type id, so the name stays safe as a filename', () => {
    expect(buildQrFilename('email', date)).toBe('qr-email-20261001-140509.png')
    expect(buildQrFilename('phone', date)).toBe('qr-phone-20261001-140509.png')
    expect(buildQrFilename('text', date)).toBe('qr-text-20261001-140509.png')
  })
})
