import React, { useState } from 'react'
import { api } from '../api.js'
import { useCachedLoader } from '../useCachedLoader.js'
import { money } from '../format.js'
import { entryTitle, entryPlace } from '../entries.js'
import { linkStyle, saveErrorText } from './add/ui.jsx'
import TransactionForm from './add/TransactionForm.jsx'
import InvestmentForm from './add/InvestmentForm.jsx'
import DebtForm from './add/DebtForm.jsx'

function EditEntry({ entry, onBack, onDone }) {
  const { data, loading, error } = useCachedLoader('formOptions', () => api.formOptions())

  if (loading) return <div className="spinner" />
  if (error || !data) return <div className="content"><div className="card">تعذّر التحميل: {error}</div></div>

  const common = { opts: data, entry, onBack, onDone }
  if (entry.kind === 'transaction') return <TransactionForm {...common} />
  if (entry.kind === 'investment') return <InvestmentForm {...common} />
  return <DebtForm {...common} />
}

function Line({ label, value }) {
  if (value === '' || value === null || value === undefined) return null
  return <div className="row"><span className="muted">{label}</span><span className="tnums">{value}</span></div>
}

export default function EntryDetail({ entry, onBack, onChanged }) {
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  if (editing) {
    return <EditEntry entry={entry} onBack={() => setEditing(false)} onDone={() => onChanged('تم التعديل ✓')} />
  }

  const remove = async () => {
    setErr('')
    setBusy(true)
    try {
      await api.deleteEntry({ kind: entry.kind, id: entry.id })
      onChanged('تم الحذف ✓')
    } catch (e) {
      setErr(saveErrorText(e))
      setBusy(false)
      setConfirming(false)
    }
  }

  const raw = entry.raw || {}

  return (
    <>
      <div className="topbar">
        <h1>{entryTitle(entry)}</h1>
        <button onClick={onBack} style={linkStyle}>رجوع</button>
      </div>
      <div className="content">
        <div className="hero">
          <div className="label">المبلغ</div>
          <div className="value tnums">{money(entry.amount, 2)} <span style={{ fontSize: 14 }}>{entry.asset}</span></div>
        </div>

        <div className="card">
          <Line label="التاريخ" value={entry.date} />
          <Line label="الحساب" value={entryPlace(entry)} />
          <Line label="الكمية" value={raw.quantity} />
          <Line label="السعر" value={raw.price} />
          <Line label="الرسوم" value={raw.fees} />
          <Line label="المبلغ المستلم" value={raw.amountTo} />
          <Line label="العملة المستلمة" value={raw.toCurrency} />
          <Line label="المصدر" value={raw.cashFlowSource} />
          <Line label="ميعاد السداد" value={entry.dueDate} />
          <Line label="ملاحظة" value={entry.notes} />
          <Line label="الحالة" value={entry.status === 'OK' ? 'سليمة' : entry.status} />
        </div>

        {err && <div className="neg" style={{ margin: '4px 2px 10px' }}>{err}</div>}

        {entry.readOnly ? (
          <div className="muted" style={{ fontSize: 12, textAlign: 'center' }}>
            صفقات التداول بتتعدّل من شيت Trades، وبتتقفل من الإضافة ← إغلاق صفقة
          </div>
        ) : confirming ? (
          <>
            <div className="muted" style={{ fontSize: 13, textAlign: 'center', marginBottom: 8 }}>
              متأكد من حذف العملية دى؟ هتتمسح من الشيت.
            </div>
            <button className="btn danger" onClick={remove} disabled={busy}>{busy ? 'بيحذف...' : 'تأكيد الحذف'}</button>
            <button className="btn block" onClick={() => setConfirming(false)} disabled={busy}>إلغاء</button>
          </>
        ) : (
          <>
            <button className="btn primary" onClick={() => setEditing(true)}>تعديل</button>
            <button className="btn block" onClick={() => setConfirming(true)}>حذف</button>
          </>
        )}
      </div>
    </>
  )
}
