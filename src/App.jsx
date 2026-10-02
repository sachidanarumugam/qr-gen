import { useEffect, useState } from 'react'
import Header from './components/Header.jsx'
import Section from './components/Section.jsx'
import SegmentedControl from './components/SegmentedControl.jsx'
import ContentFields from './components/ContentFields.jsx'
import StyleControls from './components/StyleControls.jsx'
import PresetPicker from './components/PresetPicker.jsx'
import RecentList from './components/RecentList.jsx'
import PreviewCard from './components/PreviewCard.jsx'
import { EMPTY_FIELDS, QR_TYPES, buildPayload } from './utils/payloads.js'
import { DEFAULT_SETTINGS } from './utils/settings.js'
import { applyPreset, findPresetId } from './utils/presets.js'
import { validateFields } from './utils/validators.js'
import {
  RECENT_SAVE_DELAY_MS,
  addRecent,
  loadRecent,
  removeRecent,
  saveRecent,
} from './utils/storage.js'
import './App.css'

const TYPE_OPTIONS = QR_TYPES.map((item) => ({ value: item.id, label: item.label }))

export default function App() {
  const [type, setType] = useState('url')
  // One entry per type, so switching tabs keeps what was typed in each.
  const [fieldsByType, setFieldsByType] = useState(EMPTY_FIELDS)
  // Single source of truth for size, colors, level and margin. The real size is kept here
  // even when the preview is scaled down with CSS, because PNG export needs it.
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  // null means the user has edited away from every preset, so the label reads "Custom".
  const [presetId, setPresetId] = useState(() => findPresetId(DEFAULT_SETTINGS))
  // Errors stay hidden until the user types in a field or leaves it.
  const [touchedByType, setTouchedByType] = useState({})
  const [recent, setRecent] = useState(() => loadRecent())
  const [encodeFailed, setEncodeFailed] = useState(false)

  const fields = fieldsByType[type]
  const payload = buildPayload(type, fields)
  const typeLabel = QR_TYPES.find((item) => item.id === type).label
  const touched = touchedByType[type] ?? {}
  const errors = Object.fromEntries(
    Object.entries(validateFields(type, fields)).filter(([name]) => touched[name]),
  )

  function touchField(name) {
    setTouchedByType((current) => ({
      ...current,
      [type]: { ...current[type], [name]: true },
    }))
  }

  function updateField(name, value) {
    setFieldsByType((current) => ({
      ...current,
      [type]: { ...current[type], [name]: value },
    }))
    touchField(name)
  }

  function updateSetting(name, value) {
    setSettings((current) => ({ ...current, [name]: value }))
    // Size is not part of a preset, so moving the slider keeps the preset name.
    if (name !== 'size') setPresetId(null)
  }

  function selectPreset(id) {
    setSettings((current) => applyPreset(current, id) ?? current)
    setPresetId(id)
  }

  function restoreEntry(entry) {
    setType(entry.type)
    setFieldsByType((current) => ({ ...current, [entry.type]: entry.fields }))
    setSettings(entry.settings)
    setPresetId(findPresetId(entry.settings))
  }

  function deleteEntry(id) {
    setRecent((current) => {
      const next = removeRecent(current, id)
      return saveRecent(next) ? next : current
    })
  }

  function clearRecent() {
    setRecent((current) => (saveRecent([]) ? [] : current))
  }

  useEffect(() => {
    if (!payload || encodeFailed) return undefined
    const timer = window.setTimeout(() => {
      const entry = {
        id: crypto.randomUUID(),
        type,
        fields,
        settings,
        createdAt: new Date().toISOString(),
      }
      setRecent((current) => {
        const next = addRecent(current, entry)
        if (next === current) return current
        return saveRecent(next) ? next : current
      })
    }, RECENT_SAVE_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [payload, encodeFailed, type, fields, settings])

  return (
    <div className="page">
      <Header />
      {/* DOM order is the mobile order: the preview sits right after the content inputs. */}
      <main className="layout">
        <Section id="content" number="01" title="Content">
          <div className="stack">
            <SegmentedControl legend="QR code type" options={TYPE_OPTIONS} value={type} onChange={setType} />
            <ContentFields type={type} fields={fields} errors={errors} onChange={updateField} onBlur={touchField} />
          </div>
        </Section>
        <PreviewCard
          payload={payload}
          type={type}
          typeLabel={typeLabel}
          settings={settings}
          onEncodeFailure={setEncodeFailed}
        />
        <Section id="style" number="02" title="Style">
          <StyleControls settings={settings} onChange={updateSetting} />
        </Section>
        <Section id="presets" number="03" title="Presets">
          <PresetPicker activeId={presetId} onSelect={selectPreset} />
        </Section>
        <Section id="recent" number="04" title="Recent">
          <RecentList entries={recent} onRestore={restoreEntry} onDelete={deleteEntry} onClear={clearRecent} />
        </Section>
      </main>
    </div>
  )
}
