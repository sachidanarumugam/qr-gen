// A preset changes the look of the code, not its size. Size stays where the user set it.
export const PRESETS = [
  { id: 'classic', name: 'Classic', fgColor: '#000000', bgColor: '#ffffff', level: 'M', margin: 4 },
  { id: 'newsprint', name: 'Newsprint', fgColor: '#141414', bgColor: '#f4f1ea', level: 'M', margin: 4 },
  { id: 'blueprint', name: 'Blueprint', fgColor: '#0c2340', bgColor: '#e6eef8', level: 'Q', margin: 4 },
  { id: 'pine', name: 'Pine', fgColor: '#14281f', bgColor: '#f3f1e6', level: 'M', margin: 4 },
  { id: 'poster', name: 'Poster', fgColor: '#000000', bgColor: '#ffffff', level: 'H', margin: 6 },
  { id: 'inkwell', name: 'Inkwell', fgColor: '#1a1208', bgColor: '#f7f1e3', level: 'Q', margin: 4 },
]

// Short on purpose: the swatch is tiny, and a long value would turn into a dark blob.
export const PRESET_SWATCH_VALUE = 'PRESET'

export function findPresetId(settings) {
  const match = PRESETS.find(
    (preset) =>
      preset.fgColor === settings.fgColor.toLowerCase() &&
      preset.bgColor === settings.bgColor.toLowerCase() &&
      preset.level === settings.level &&
      preset.margin === settings.margin,
  )
  return match ? match.id : null
}

// Keeps the current size. Returns null when the id is unknown, so a bad click changes nothing.
export function applyPreset(settings, presetId) {
  const preset = PRESETS.find((item) => item.id === presetId)
  if (!preset) return null
  return {
    ...settings,
    fgColor: preset.fgColor,
    bgColor: preset.bgColor,
    level: preset.level,
    margin: preset.margin,
  }
}
