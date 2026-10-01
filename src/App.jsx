import { useState } from 'react'
import Header from './components/Header.jsx'
import Section from './components/Section.jsx'
import TypeSelector from './components/TypeSelector.jsx'
import ContentFields from './components/ContentFields.jsx'
import PreviewCard from './components/PreviewCard.jsx'
import { EMPTY_FIELDS, QR_TYPES, buildPayload } from './utils/payloads.js'
import './App.css'

const GUIDE_COLUMNS = Array.from({ length: 12 }, (_, i) => i)

const DEFAULT_SETTINGS = {
  size: 256,
  level: 'M',
  fgColor: '#000000',
  bgColor: '#ffffff',
  margin: 4,
}

export default function App() {
  const [type, setType] = useState('url')
  // One entry per type, so switching tabs keeps what was typed in each.
  const [fieldsByType, setFieldsByType] = useState(EMPTY_FIELDS)

  const fields = fieldsByType[type]
  const payload = buildPayload(type, fields)
  const typeLabel = QR_TYPES.find((item) => item.id === type).label

  function updateField(name, value) {
    setFieldsByType((current) => ({
      ...current,
      [type]: { ...current[type], [name]: value },
    }))
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
            <TypeSelector value={type} onChange={setType} />
            <ContentFields type={type} fields={fields} onChange={updateField} />
          </div>
        </Section>
        <PreviewCard payload={payload} typeLabel={typeLabel} settings={DEFAULT_SETTINGS} />
        <Section id="style" number="02" title="Style" />
        <Section id="presets" number="03" title="Presets" />
        <Section id="recent" number="04" title="Recent" />
      </main>
    </div>
  )
}
