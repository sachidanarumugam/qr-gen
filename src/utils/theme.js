export const THEME_KEY = 'qr-generator:theme:v1'

export const THEME_COLOR = {
  light: '#0000ff',
  dark: '#07072b',
}

// Only the exact value "dark" turns night mode on. Anything missing, unexpected, or unreadable stays light.
export function loadTheme(storage = globalThis.localStorage) {
  try {
    return storage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export function saveTheme(theme, storage = globalThis.localStorage) {
  try {
    storage.setItem(THEME_KEY, theme === 'dark' ? 'dark' : 'light')
    return true
  } catch {
    return false
  }
}

export function applyTheme(theme, doc = globalThis.document) {
  const root = doc?.documentElement
  if (!root) return
  const dark = theme === 'dark'
  if (dark) root.setAttribute('data-theme', 'dark')
  else root.removeAttribute('data-theme')
  const meta = doc.querySelector?.('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', dark ? THEME_COLOR.dark : THEME_COLOR.light)
}
