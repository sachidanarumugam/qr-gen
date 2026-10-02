import { normalizeHex } from './settings.js'
import { WIFI_SECURITY } from './validators.js'

export const RECENT_KEY = 'qr-generator:recent:v1'
export const RECENT_LIMIT = 10

const LEVELS = ['L', 'M', 'Q', 'H']
const TYPES = ['url', 'text', 'email', 'phone', 'wifi']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function isString(value) {
  return typeof value === 'string'
}

function hasStrings(object, keys) {
  return object !== null && typeof object === 'object' && keys.every((key) => isString(object[key]))
}

function isFields(type, fields) {
  if (type === 'url') return hasStrings(fields, ['url'])
  if (type === 'text') return hasStrings(fields, ['text'])
  if (type === 'email') return hasStrings(fields, ['address', 'subject', 'body'])
  if (type === 'phone') return hasStrings(fields, ['phone'])
  if (type === 'wifi') {
    return (
      hasStrings(fields, ['ssid', 'security', 'password']) &&
      Object.values(WIFI_SECURITY).includes(fields.security) &&
      typeof fields.hidden === 'boolean'
    )
  }
  return false
}

function isSettings(settings) {
  if (settings === null || typeof settings !== 'object') return false
  return (
    Number.isInteger(settings.size) &&
    settings.size >= 128 &&
    settings.size <= 1024 &&
    LEVELS.includes(settings.level) &&
    Number.isInteger(settings.margin) &&
    settings.margin >= 0 &&
    settings.margin <= 10 &&
    isString(settings.fgColor) &&
    normalizeHex(settings.fgColor) !== null &&
    isString(settings.bgColor) &&
    normalizeHex(settings.bgColor) !== null
  )
}

export function isRecentEntry(entry) {
  return (
    entry !== null &&
    typeof entry === 'object' &&
    isString(entry.id) &&
    entry.id.length > 0 &&
    TYPES.includes(entry.type) &&
    isFields(entry.type, entry.fields) &&
    isSettings(entry.settings) &&
    isString(entry.createdAt) &&
    !Number.isNaN(Date.parse(entry.createdAt))
  )
}

// Drops bad entries instead of throwing, so one corrupt record does not wipe the list.
export function parseRecent(raw) {
  try {
    const data = JSON.parse(raw)
    if (!Array.isArray(data)) return []
    return data.filter(isRecentEntry).slice(0, RECENT_LIMIT)
  } catch {
    return []
  }
}

export function loadRecent(storage = globalThis.localStorage) {
  try {
    const raw = storage.getItem(RECENT_KEY)
    if (raw == null) return []
    return parseRecent(raw)
  } catch {
    return []
  }
}

export function saveRecent(entries, storage = globalThis.localStorage) {
  try {
    storage.setItem(RECENT_KEY, JSON.stringify(entries.slice(0, RECENT_LIMIT)))
    return true
  } catch {
    return false
  }
}

function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`
  if (value !== null && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stable(value[key])}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

export function sameQr(a, b) {
  return a.type === b.type && stable(a.fields) === stable(b.fields) && stable(a.settings) === stable(b.settings)
}

export function addRecent(entries, entry) {
  if (entries[0] && sameQr(entries[0], entry)) return entries
  return [entry, ...entries].slice(0, RECENT_LIMIT)
}

export function removeRecent(entries, id) {
  return entries.filter((entry) => entry.id !== id)
}

export function summarizeEntry(entry) {
  if (entry.type === 'url') return entry.fields.url.trim()
  if (entry.type === 'text') return entry.fields.text.replace(/\s+/g, ' ').trim()
  if (entry.type === 'email') return entry.fields.address.trim()
  if (entry.type === 'phone') return entry.fields.phone.trim()
  const access = entry.fields.security === WIFI_SECURITY.NONE ? 'no password' : 'password hidden'
  return `${entry.fields.ssid} · ${access}`
}

export function formatSavedAt(iso) {
  const date = new Date(iso)
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}, ${pad(date.getHours())}:${pad(date.getMinutes())}`
}
