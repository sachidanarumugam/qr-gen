import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { QRCodeSVG } from 'qrcode.react'
import { DEFAULT_SETTINGS } from './settings.js'
import {
  MIN_MODULE_PX,
  buildQrExport,
  buildQrSvg,
  exportGeometry,
  exportLabel,
  logoModules,
  modelFromMarkup,
  moduleRole,
  paintQrCanvas,
} from './qrExport.js'

function readExport(value, settings) {
  const markup = renderToStaticMarkup(
    createElement(QRCodeSVG, {
      value,
      level: settings.level,
      marginSize: settings.margin,
      size: 1,
      bgColor: '#ffffff',
      fgColor: '#000000',
      boostLevel: false,
    }),
  )
  return buildQrExport(modelFromMarkup(markup, settings.margin), settings)
}

const SHORT_URL = 'https://example.com'
const LONG_URL = `https://example.com/${'a'.repeat(120)}`
const WIFI = 'WIFI:T:WPA;S:Home;P:password123;;'
const PAYLOADS = [SHORT_URL, LONG_URL, WIFI]
const SIZES = [128, 256, 512, 1024]

function recordPaint(exported, fgColor, bgColor) {
  const rects = []
  let smoothing = true
  let alpha = 0
  const canvas = {
    width: 0,
    height: 0,
    getContext() {
      return {
        setTransform() {},
        get imageSmoothingEnabled() {
          return smoothing
        },
        set imageSmoothingEnabled(value) {
          smoothing = value
        },
        get globalAlpha() {
          return alpha
        },
        set globalAlpha(value) {
          alpha = value
        },
        fillStyle: '',
        fillRect(x, y, w, h) {
          rects.push({ x, y, w, h, fill: this.fillStyle })
        },
      }
    },
  }
  paintQrCanvas(canvas, exported.model, exported.geometry, fgColor, bgColor)
  return { canvas, rects, smoothing, alpha }
}

describe('exportGeometry', () => {
  it('uses a whole module size and a canvas that is an exact multiple', () => {
    const geometry = exportGeometry(1024, 33)
    expect(geometry.moduleSize).toBe(31)
    expect(geometry.exportSize).toBe(31 * 33)
    expect(geometry.exportSize % geometry.moduleCount).toBe(0)
    expect(geometry.raised).toBe(false)
  })

  it('raises the canvas when modules would be under 4 px', () => {
    const geometry = exportGeometry(128, 41)
    expect(Math.floor(128 / 41)).toBe(3)
    expect(geometry.moduleSize).toBe(MIN_MODULE_PX)
    expect(geometry.exportSize).toBe(MIN_MODULE_PX * 41)
    expect(geometry.raised).toBe(true)
    expect(exportLabel(geometry)).toBe('Exports at 164 x 164 px so each module is at least 4 px.')
  })
})

describe('exported canvas', () => {
  it('is an exact multiple of the module count for several payloads and sizes', () => {
    for (const value of PAYLOADS) {
      for (const size of SIZES) {
        const exported = readExport(value, { ...DEFAULT_SETTINGS, size })
        const { moduleCount, moduleSize, exportSize, raised } = exported.geometry
        const floorSize = Math.max(1, Math.floor(size / moduleCount))
        expect(exportSize % moduleCount).toBe(0)
        expect(Number.isInteger(moduleSize)).toBe(true)
        expect(moduleSize).toBeGreaterThanOrEqual(MIN_MODULE_PX)
        if (floorSize < MIN_MODULE_PX) {
          expect(moduleSize).toBe(MIN_MODULE_PX)
          expect(raised).toBe(true)
          expect(exported.label).toContain('at least 4 px')
        } else {
          expect(moduleSize).toBe(floorSize)
          expect(raised).toBe(false)
          expect(exported.label).toBe(`Exports at ${exportSize} x ${exportSize} px`)
        }

        const { canvas, rects, smoothing, alpha } = recordPaint(exported, '#000000', '#ffffff')
        expect(canvas.width).toBe(exportSize)
        expect(canvas.height).toBe(exportSize)
        expect(canvas.width % moduleCount).toBe(0)
        expect(smoothing).toBe(false)
        expect(alpha).toBe(1)
        expect(rects[0]).toEqual({ x: 0, y: 0, w: exportSize, h: exportSize, fill: '#ffffff' })
        for (const rect of rects.slice(1)) {
          expect(Number.isInteger(rect.x)).toBe(true)
          expect(Number.isInteger(rect.y)).toBe(true)
          expect(Number.isInteger(rect.w)).toBe(true)
          expect(Number.isInteger(rect.h)).toBe(true)
          expect(rect.x % moduleSize).toBe(0)
          expect(rect.y % moduleSize).toBe(0)
          expect(rect.w % moduleSize).toBe(0)
          expect(rect.h).toBe(moduleSize)
          expect(rect.fill).toBe('#000000')
          expect(rect.x).toBeGreaterThanOrEqual(DEFAULT_SETTINGS.margin * moduleSize)
          expect(rect.y).toBeGreaterThanOrEqual(DEFAULT_SETTINGS.margin * moduleSize)
          expect(rect.x + rect.w).toBeLessThanOrEqual(exportSize - DEFAULT_SETTINGS.margin * moduleSize)
          expect(rect.y + rect.h).toBeLessThanOrEqual(exportSize - DEFAULT_SETTINGS.margin * moduleSize)
        }
      }
    }
  })

  it('keeps a quiet zone of the requested margin, including the default of 4', () => {
    for (const value of PAYLOADS) {
      const exported = readExport(value, DEFAULT_SETTINGS)
      const { model } = exported
      expect(model.margin).toBe(4)
      expect(model.moduleCount).toBeGreaterThan(model.margin * 2)
      expect((model.moduleCount - model.margin * 2 - 17) % 4).toBe(0)
      expect(model.runs.length).toBeGreaterThan(0)
      for (const run of model.runs) {
        expect(run.x).toBeGreaterThanOrEqual(model.margin)
        expect(run.y).toBeGreaterThanOrEqual(model.margin)
        expect(run.x + run.w).toBeLessThanOrEqual(model.moduleCount - model.margin)
        expect(run.y + 1).toBeLessThanOrEqual(model.moduleCount - model.margin)
      }
    }
  })

  it('paints the default colors as opaque black on white', () => {
    const exported = readExport(SHORT_URL, DEFAULT_SETTINGS)
    const { rects } = recordPaint(exported, DEFAULT_SETTINGS.fgColor, DEFAULT_SETTINGS.bgColor)
    expect(DEFAULT_SETTINGS.fgColor).toBe('#000000')
    expect(DEFAULT_SETTINGS.bgColor).toBe('#ffffff')
    expect(rects[0].fill).toBe('#ffffff')
    expect(rects.slice(1).every((rect) => rect.fill === '#000000')).toBe(true)
  })
})

describe('module roles and logo box', () => {
  it('keeps the corner eyes and timing lines, and parks the logo in the center', () => {
    expect(moduleRole(4, 4, 33, 4)).toBe('finder')
    expect(moduleRole(11, 10, 33, 4)).toBe('timing')
    expect(moduleRole(16, 16, 33, 4)).toBe('data')
    const box = logoModules(33, 4)
    expect(box.origin).toBeGreaterThan(4 + 7)
    expect(box.origin + box.span).toBeLessThan(33 - 4 - 7)
  })
})

describe('buildQrSvg', () => {
  it('matches the canvas pixel size and stays square by default', () => {
    const exported = readExport(SHORT_URL, DEFAULT_SETTINGS)
    const markup = buildQrSvg(exported.model, DEFAULT_SETTINGS)
    expect(markup).toContain(`width="${exported.geometry.exportSize}"`)
    expect(markup).toContain(`viewBox="0 0 ${exported.model.moduleCount} ${exported.model.moduleCount}"`)
    expect(exported.geometry.exportSize % exported.model.moduleCount).toBe(0)
    expect(markup).not.toContain('<circle')
    expect(markup).not.toContain('<image')
  })

  it('draws data modules as dots and the corner eyes as squares', () => {
    const settings = { ...DEFAULT_SETTINGS, pattern: 'dots' }
    const exported = readExport(SHORT_URL, settings)
    const markup = buildQrSvg(exported.model, settings)
    expect(markup).toContain('<circle')
    expect(markup).toContain(`<rect x="${settings.margin}" y="${settings.margin}" width="1" height="1"`)
  })

  it('includes the gradient and the logo', () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      gradient: true,
      gradientEnd: '#0000ff',
      logo: 'data:image/png;base64,aaaa',
    }
    const exported = readExport(SHORT_URL, settings)
    const markup = buildQrSvg(exported.model, settings)
    expect(markup).toContain('linearGradient')
    expect(markup).toContain('stop-color="#000000"')
    expect(markup).toContain('stop-color="#0000ff"')
    expect(markup).toContain('<image')
    expect(markup).toContain('data:image/png;base64,aaaa')
  })
})
