import React from 'react'
import { money } from '../../format.js'

const STATUS_TEXT = {
  'Invalid conversion': 'راجع المبلغ المستلم',
  'Same account transfer': 'الحساب المحوّل منه هو نفس الحساب المحوّل إليه',
  'Invalid from account': 'راجع الحساب المحوّل منه',
  'Invalid to account': 'راجع الحساب المحوّل إليه',
  'Invalid account': 'راجع الحساب والعملة',
  'Invalid transfer': 'راجع مبلغ التحويل',
  'Exceeds remaining': 'المبلغ أكبر من المتبقى على الشخص ده',
  'Missing amount': 'اكتب المبلغ',
  'Invalid amount': 'راجع المبلغ'
}

// Turns a refused save into a clear message; the operation was not written.
export function saveErrorText(e) {
  const d = e.data || {}
  const status = d.status || ''

  if (e.message === 'rejected') {
    if (status.startsWith('Insufficient')) {
      const quantity = status.endsWith('quantity')
      // No amount comes back when the row was checked at its own date, not against today.
      if (d.available == null) return quantity ? 'الكمية فى تاريخ العملية مكنتش كفاية' : 'الرصيد فى تاريخ العملية مكنش كفاية'
      return `${quantity ? 'الكمية اللى عندك مش كفاية' : 'الرصيد مش كفاية'} (المتاح ${money(d.available, 2)})`
    }
    return STATUS_TEXT[status] || 'العملية اترفضت: ' + status
  }
  if (e.message === 'future_date') return 'التاريخ لازم يكون النهارده أو قبله'
  if (e.message === 'invalid_date') return 'راجع التاريخ'
  if (e.message === 'breaks_other_row') return `مش ممكن: ده هيخلّى عملية تانية غلط (شيت ${d.sheet}، صف ${d.row}). عدّلها أو احذفها الأول`
  if (e.message === 'entry_not_found') return 'العملية دى مش موجودة فى الشيت. يمكن اتمسحت من هناك'
  if (e.message === 'insufficient_balance') return `الرصيد فى الخزنة دى مش كفاية (المتاح ${money(d.available, 2)})`
  if (e.message === 'exceeds_remaining') return `المبلغ أكبر من المتبقى (المتبقى ${money(d.remaining, 2)})`
  if (e.message === 'exceeds_quantity') return `الكمية أكبر من المتبقى (المتبقى ${money(d.remaining, 2)})`
  if (e.message === 'busy_try_again') return 'النظام مشغول، جرّب تانى بعد ثوانى'
  if (e.message === 'unauthorized') return 'المفتاح غير صحيح. حدّثه من المزيد ← تغيير الرابط / المفتاح'
  return 'فشل الحفظ: ' + e.message
}

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

// Today on this phone, in the yyyy-mm-dd form a date input uses.
export function todayText() {
  const d = new Date()
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-')
}

export function DateField({ value, onChange }) {
  const today = todayText()
  return (
    <Field label="تاريخ العملية">
      <input className="input" type="date" dir="ltr" value={value} max={today} onChange={(e) => onChange(e.target.value)} />
      {value && value < today && (
        <div style={{ fontSize: 12, color: 'var(--text-2)', margin: '-4px 2px 0' }}>الرصيد لازم يكون كافى فى التاريخ ده</div>
      )}
    </Field>
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
