import React from 'react'

export const linkStyle = {
  background: 'none', border: 'none', color: 'var(--info)',
  fontSize: 14, fontFamily: 'inherit', cursor: 'pointer'
}

export function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label className="field">{label}</label>
      {children}
    </div>
  )
}

export function Select({ value, onChange, options, placeholder }) {
  return (
    <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{placeholder || 'اختر...'}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

export function NumberInput({ value, onChange, placeholder }) {
  return (
    <input
      className="input" inputMode="decimal" dir="ltr" value={value}
      placeholder={placeholder || ''}
      onChange={(e) => onChange(e.target.value.replace(/[^\d.\-]/g, ''))}
    />
  )
}

export function TextInput({ value, onChange, placeholder, list }) {
  return (
    <input
      className="input" value={value} placeholder={placeholder || ''} list={list}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

export function FormShell({ title, onBack, onSubmit, submitting, error, submitLabel, children }) {
  return (
    <>
      <div className="topbar">
        <h1>{title}</h1>
        <button onClick={onBack} style={linkStyle}>رجوع</button>
      </div>
      <div className="content">
        <div className="card">{children}</div>
        {error && <div className="neg" style={{ margin: '4px 2px 10px' }}>{error}</div>}
        <button className="btn primary block" onClick={onSubmit} disabled={submitting}>
          {submitting ? 'بيحفظ...' : (submitLabel || 'حفظ فى الشيت')}
        </button>
      </div>
    </>
  )
}
