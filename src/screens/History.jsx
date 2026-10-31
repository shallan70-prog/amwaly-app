import React, { useState } from 'react'
import { api } from '../api.js'
import { useCachedLoader } from '../useCachedLoader.js'
import { KIND_FILTERS, entryMatches } from '../entries.js'
import EntryRow from '../components/EntryRow.jsx'
import StaleBanner from '../components/StaleBanner.jsx'
import { linkStyle } from './add/ui.jsx'

const PAGE_SIZE = 30

export default function History({ onBack, onOpen }) {
  const { data, loading, error, staleError } = useCachedLoader('history', () => api.history())
  const [kind, setKind] = useState('all')
  const [query, setQuery] = useState('')
  const [shown, setShown] = useState(PAGE_SIZE)

  const kinds = KIND_FILTERS.find((f) => f.id === kind).kinds
  const items = ((data && data.items) || [])
    .filter((e) => (!kinds || kinds.includes(e.kind)) && entryMatches(e, query))
  const visible = items.slice(0, shown)

  return (
    <>
      <div className="topbar">
        <h1>السجل</h1>
        <button onClick={onBack} style={linkStyle}>رجوع</button>
      </div>
      <div className="content">
        {loading && <div className="spinner" />}
        {error && <div className="card">تعذّر التحميل: {error}</div>}
        <StaleBanner error={staleError} />
        {data && (
          <>
            <div className="chips">
              {KIND_FILTERS.map((f) => (
                <button
                  key={f.id}
                  className={kind === f.id ? 'on' : ''}
                  onClick={() => { setKind(f.id); setShown(PAGE_SIZE) }}
                >{f.label}</button>
              ))}
            </div>
            <input
              className="input"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShown(PAGE_SIZE) }}
              placeholder="بحث بالاسم أو الحساب أو الملاحظة أو المبلغ"
            />
            <div className="card">
              {visible.map((e) => <EntryRow key={e.kind + (e.id || e.row)} entry={e} onOpen={onOpen} />)}
              {visible.length === 0 && <div className="row"><span className="muted">مفيش عمليات</span></div>}
            </div>
            {items.length > shown && (
              <button className="btn" onClick={() => setShown(shown + PAGE_SIZE)}>عرض المزيد</button>
            )}
          </>
        )}
      </div>
    </>
  )
}
