import React from 'react'
import { money } from '../format.js'
import { linkStyle } from './add/ui.jsx'

export default function CurrencyDetail({ code, label, decimals, total, locations, onBack }) {
  return (
    <>
      <div className="topbar">
        <h1>{label} {code}</h1>
        <button onClick={onBack} style={linkStyle}>رجوع</button>
      </div>
      <div className="content">
        <div className="hero">
          <div className="label">إجمالى الرصيد</div>
          <div className="value tnums">{money(total, decimals)} <span style={{ fontSize: 14 }}>{code}</span></div>
        </div>

        <div className="card">
          <div className="section-title">الخزن</div>
          {!locations && (
            <div className="row"><span className="muted">التفاصيل بتتحدّث، افتحها تانى بعد ثوانى</span></div>
          )}
          {locations && locations.length === 0 && (
            <div className="row"><span className="muted">مفيش رصيد فى العملة دى</span></div>
          )}
          {locations && locations.map((l) => (
            <div className="row" key={l.location}>
              <span>{l.location}</span>
              <span className="tnums">{money(l.amount, decimals)}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
