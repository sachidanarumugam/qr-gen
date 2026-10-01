import { Trash2 } from 'lucide-react'
import { QR_TYPES } from '../utils/payloads.js'
import { formatSavedAt, summarizeEntry } from '../utils/storage.js'
import './RecentList.css'

export default function RecentList({ entries, onRestore, onDelete, onClear }) {
  return (
    <div className="stack">
      <p className="recent-note">Saved only in this browser.</p>
      {entries.length === 0 ? (
        <p>Nothing saved yet. A valid QR code is saved here shortly after you stop editing.</p>
      ) : (
        <>
          <ul className="recent-list">
            {entries.map((entry) => {
              const typeLabel = QR_TYPES.find((item) => item.id === entry.type)?.label ?? entry.type
              const summary = summarizeEntry(entry)
              return (
                <li className="recent-row" key={entry.id}>
                  <button type="button" className="recent-open" onClick={() => onRestore(entry)}>
                    <span className="recent-type">{typeLabel}</span>
                    <span className="recent-summary">{summary}</span>
                    <span className="recent-time mono">{formatSavedAt(entry.createdAt)}</span>
                  </button>
                  <button
                    type="button"
                    className="recent-delete"
                    aria-label={`Delete saved ${typeLabel} QR code`}
                    onClick={() => onDelete(entry.id)}
                  >
                    <Trash2 size={20} strokeWidth={1.5} aria-hidden="true" />
                  </button>
                </li>
              )
            })}
          </ul>
          <button type="button" className="button" onClick={onClear}>
            Clear all
          </button>
        </>
      )}
    </div>
  )
}
