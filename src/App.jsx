import { useState } from 'react'
import Header from './components/Header.jsx'
import Section from './components/Section.jsx'
import SegmentedControl from './components/SegmentedControl.jsx'
import ContentFields from './components/ContentFields.jsx'
import StyleControls from './components/StyleControls.jsx'
import PreviewCard from './components/PreviewCard.jsx'
import { EMPTY_FIELDS, QR_TYPES, buildPayload } from './utils/payloads.js'
import { DEFAULT_SETTINGS } from './utils/settings.js'
import './App.css'

const GUIDE_COLUMNS = Array.from({ length: 12 }, (_, i) => i)

const TYPE_OPTIONS = QR_TYPES.map((item) => ({ value: item.id, label: item.label }))

export default function App() {
  const [type, setType] = useState('url')
  // One entry per type, so switching tabs keeps what was typed in each.
  const [fieldsByType, setFieldsByType] = useState(EMPTY_FIELDS)
  // Single source of truth for size, colors, level and margin. The real size is kept here
  // even when the preview is scaled down with CSS, because PNG export needs it.
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)

  const fields = fieldsByType[type]
  const payload = buildPayload(type, fields)
  const typeLabel = QR_TYPES.find((item) => item.id === type).label

  function updateField(name, value) {
    setFieldsByType((current) => ({
      ...current,
      [type]: { ...current[type], [name]: value },
    }))
  }

  function updateSetting(name, value) {
    setSettings((current) => ({ ...current, [name]: value }))
  }

  return (
    <div className="page">
      <div className="grid-guides" aria-hidden="true">
        {GUIDE_COLUMNS.map((column) => (
          <span key={column} />
        ))}
      </div>
      <Header />
      {/* DOM order is the mobile order: the preview sits right after the content inputs. */}
      <main className="layout">
        <Section id="content" number="01" title="Content">
          <div className="stack">
            <SegmentedControl legend="QR code type" options={TYPE_OPTIONS} value={type} onChange={setType} />
            <ContentFields type={type} fields={fields} onChange={updateField} />
          </div>
        </Section>
        <PreviewCard payload={payload} typeLabel={typeLabel} settings={settings} />
        <Section id="style" number="02" title="Style">
          <StyleControls settings={settings} onChange={updateSetting} />
        </Section>
        <Section id="presets" number="03" title="Presets" />
        <Section id="recent" number="04" title="Recent" />
      </main>
    </div>
  )
}
