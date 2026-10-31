import React from 'react'
import { money } from '../format.js'
import { entryTitle, entryPlace, entryDirection } from '../entries.js'

export default function EntryRow({ entry, onOpen }) {
  const place = entryPlace(entry)
  const bad = entry.status && entry.status !== 'OK'

  return (
    <div
      className="row tap"
      role="button"
      tabIndex={0}
      onClick={() => onOpen(entry)}
      onKeyDown={(e) => { if (e.key === 'Enter') onOpen(entry) }}
    >
      <div>
        <div className="sym">{entryTitle(entry)}</div>
        <div className="muted" style={{ fontSize: 12 }}>
          <bdi>{entry.date}</bdi>{place ? ' · ' : ''}{place}{bad ? ' · مرفوضة' : ''}
        </div>
      </div>
      <span className="end">
        <span className={'tnums ' + entryDirection(entry)}>{money(entry.amount, 2)} {entry.asset}</span>
        <span className="chev">‹</span>
      </span>
    </div>
  )
}
