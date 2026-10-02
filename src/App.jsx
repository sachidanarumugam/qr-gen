import { useEffect, useRef, useState } from 'react'
import Hero from './components/Hero.jsx'
import GenerateForm from './components/GenerateForm.jsx'
import Decor from './components/Decor.jsx'
import Marquee from './components/Marquee.jsx'
import Wordmark from './components/Wordmark.jsx'
import SettingsButton from './components/SettingsButton.jsx'
import SettingsDrawer from './components/SettingsDrawer.jsx'
import CreatingOverlay from './components/CreatingOverlay.jsx'
import ResultModal from './components/ResultModal.jsx'
import QRPreview from './components/QRPreview.jsx'
import { EMPTY_FIELDS, QR_TYPES, buildPayload } from './utils/payloads.js'
import { DEFAULT_SETTINGS } from './utils/settings.js'
import { applyPreset, findPresetId } from './utils/presets.js'
import { validateFields } from './utils/validators.js'
import { addRecent, loadRecent, removeRecent, saveRecent } from './utils/storage.js'
import './App.css'

const CREATING_MS = 1300
const TOO_LONG_MESSAGE =
  'This content is too long for a QR code. Try something shorter or a lower error correction level.'

export default function App() {
  const [type, setType] = useState('url')
  // One entry per type, so switching chips keeps what was typed in each.
  const [fieldsByType, setFieldsByType] = useState(EMPTY_FIELDS)
  // Single source of truth for size, colors, level and margin. PNG export reads the real size from here.
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  // null means the user has edited away from every preset, so the label reads "Custom".
  const [presetId, setPresetId] = useState(() => findPresetId(DEFAULT_SETTINGS))
  const [recent, setRecent] = useState(() => loadRecent())
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [phase, setPhase] = useState('idle')
  // Errors stay hidden until the first click on Generate with invalid input.
  const [attempted, setAttempted] = useState(false)
  const [shaking, setShaking] = useState(false)
  const [tooLong, setTooLong] = useState(false)

  const inputRef = useRef(null)
  const generateRef = useRef(null)
  const settingsButtonRef = useRef(null)
  // Set while the loader runs, by the hidden QR that tries to encode the payload.
  const encodeFailedRef = useRef(false)
  const pendingFocusRef = useRef(null)

  const fields = fieldsByType[type]
  const payload = buildPayload(type, fields)
  const typeLabel = QR_TYPES.find((item) => item.id === type).label
  const firstError = Object.values(validateFields(type, fields))[0] ?? ''
  const errorText = tooLong ? TOO_LONG_MESSAGE : attempted ? firstError : ''
  const overlayOpen = drawerOpen || phase !== 'idle'

  function updateField(name, value) {
    setFieldsByType((current) => ({
      ...current,
      [type]: { ...current[type], [name]: value },
    }))
    setTooLong(false)
  }

  function changeType(next) {
    setType(next)
    setAttempted(false)
    setTooLong(false)
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
    setAttempted(false)
    setTooLong(false)
    closeDrawer()
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

  function closeDrawer() {
    setDrawerOpen(false)
    pendingFocusRef.current = settingsButtonRef
  }

  function handleGenerate() {
    if (phase !== 'idle') return
    if (!payload) {
      setAttempted(true)
      setShaking(true)
      return
    }
    encodeFailedRef.current = false
    setAttempted(false)
    setPhase('creating')
  }

  function handleModalClose(reason) {
    setPhase('idle')
    if (reason === 'another') {
      setFieldsByType((current) => ({ ...current, [type]: EMPTY_FIELDS[type] }))
      pendingFocusRef.current = inputRef
    } else {
      pendingFocusRef.current = generateRef
    }
  }

  // After the loader, either show the result or report that the payload cannot be encoded.
  useEffect(() => {
    if (phase !== 'creating') return undefined
    const timer = window.setTimeout(() => {
      if (encodeFailedRef.current) {
        setTooLong(true)
        setShaking(true)
        pendingFocusRef.current = generateRef
        setPhase('idle')
        return
      }
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
      setPhase('result')
    }, CREATING_MS)
    return () => window.clearTimeout(timer)
  }, [phase, type, fields, settings])

  // Focus can only move once the inert page behind the overlay is interactive again.
  useEffect(() => {
    if (overlayOpen || !pendingFocusRef.current) return
    pendingFocusRef.current.current?.focus({ preventScroll: true })
    pendingFocusRef.current = null
  }, [overlayOpen])

  return (
    <div className="app">
      <div className="shell" inert={overlayOpen}>
        <Wordmark />
        <Decor />
        <main className="stage">
          <Hero />
          <GenerateForm
            type={type}
            fieldsByType={fieldsByType}
            onTypeChange={changeType}
            onChange={updateField}
            onSubmit={handleGenerate}
            errorText={errorText}
            shaking={shaking}
            onShakeEnd={() => setShaking(false)}
            busy={phase === 'creating'}
            inputRef={inputRef}
            generateRef={generateRef}
          />
        </main>
        <Marquee />
        <SettingsButton buttonRef={settingsButtonRef} expanded={drawerOpen} onClick={() => setDrawerOpen(true)} />
      </div>

      <SettingsDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        settings={settings}
        onSettingChange={updateSetting}
        presetId={presetId}
        onSelectPreset={selectPreset}
        recent={recent}
        onRestore={restoreEntry}
        onDelete={deleteEntry}
        onClear={clearRecent}
      />

      {phase === 'creating' && (
        <>
          <CreatingOverlay />
          {/* Never visible: it only reports whether the payload fits in a QR code. */}
          <div hidden>
            <QRPreview
              payload={payload}
              typeLabel={typeLabel}
              settings={settings}
              onFailure={(failed) => {
                encodeFailedRef.current = failed
              }}
            />
          </div>
        </>
      )}

      {phase === 'result' && (
        <ResultModal
          payload={payload}
          type={type}
          typeLabel={typeLabel}
          settings={settings}
          onClose={handleModalClose}
        />
      )}
    </div>
  )
}
