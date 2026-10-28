import React from 'react'
import { money } from '../format.js'
import { linkStyle } from './add/ui.jsx'

function isOverdue(ymd) {
  if (!ymd) return false
  const today = new Date()
  const todayYmd = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-')
  return ymd < todayYmd
}

export default function DebtsDetail({ debts, onBack }) {
  const people = (debts && debts.people) || []

  return (
    <>
      <div className="topbar">
        <h1>الديون</h1>
        <button onClick={onBack} style={linkStyle}>رجوع</button>
      </div>
      <div className="content">
        <div className="metrics">
          <div className="metric">
            <div className="label">ليك عند الناس (جنيه)</div>
            <div className="value tnums pos">{money(debts ? debts.receivableEgp : 0)}</div>
          </div>
          <div className="metric">
            <div className="label">عليك للناس (جنيه)</div>
            <div className="value tnums neg">{money(debts ? debts.payableEgp : 0)}</div>
          </div>
        </div>

        <div className="card">
          <div className="section-title">الأشخاص</div>
          {people.length === 0 && (
            <div className="row"><span className="muted">مفيش ديون مفتوحة</span></div>
          )}
          {people.map((p) => (
            <div className="row" key={p.name} style={{ alignItems: 'flex-start' }}>
              <div>
                <div className="sym">{p.name}</div>
                {p.dueDate && (
                  <div className={isOverdue(p.dueDate) ? 'neg' : 'muted'} style={{ fontSize: 12 }}>
                    ميعاد السداد {p.dueDate}{isOverdue(p.dueDate) ? ' · فات ميعاده' : ''}
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'left' }}>
                {p.balances.map((b) => (
                  <div key={b.currency} className={'tnums ' + (b.amount > 0 ? 'pos' : 'neg')}>
                    {b.amount > 0 ? 'ليك ' : 'عليك '}{money(Math.abs(b.amount), b.currency === 'EGP' ? 0 : 2)} {b.currency}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
