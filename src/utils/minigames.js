export const MINI_GAMES_KEY = 'qr-generator:minigames:v1'

// Missing or unreadable storage keeps the offer on, so a bad save never hides the games.
export function loadMiniGamesEnabled(storage = globalThis.localStorage) {
  try {
    const raw = storage.getItem(MINI_GAMES_KEY)
    if (raw === 'off') return false
    return true
  } catch {
    return true
  }
}

export function saveMiniGamesEnabled(enabled, storage = globalThis.localStorage) {
  try {
    storage.setItem(MINI_GAMES_KEY, enabled ? 'on' : 'off')
    return true
  } catch {
    return false
  }
}
