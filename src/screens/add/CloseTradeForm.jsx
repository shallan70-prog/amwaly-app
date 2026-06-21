import React, { useState } from 'react'
import { api } from '../../api.js'
import { useLoader } from '../../useLoader.js'
import { Field, NumberInput, linkStyle } from './ui.jsx'
import { money, price as fmtPrice } from '../../format.js'

export default function CloseTradeForm({ onBack, onDone }) {
  const { data, loading, error } = useLoader(() => api.openTrades())
  const [id, setId] = useState('')
  const [qty, setQty] = useState('')
  const [exitPrice, setExitPrice] = useState('')
  const [fees, setFees] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const Header = (
    <div className="topbar">
      <h1>إغلاق صفقة</h1>
      <button onClick={onBack} style={linkStyle}>رجوع</button>
    </div>
  )

  if (loading) return <>{Header}<div className="content"><div className="spinner" /></div></>
  if (error) return <>{Header}<div className="content"><div className="card">تعذّر التحميل: {error}</div></div></>

  const trades = (data && data.trades) || []

  if (trades.length === 0) {
    return <>{Header}<div className="content"><div className="card">لا توجد صفقات مفتوحة دلوقتى.</div></div></>
  }

  const trade = trades.find((t) => t.id === id)
  const q = parseFloat(qty) || 0
  const p = parseFloat(exitPrice) || 0
  const newClosed = trade ? trade.closedQuantity + q : 0
  const newAvg = trade && newClosed > 0 ? (trade.closedQuantity * trade.avgExit + q * p) / newClosed : 0
  const remainingAfter = trade ? trade.remaining - q : 0

  const submit = async () => {
    setErr('')
    if (!trade) return setErr('اختر صفقة')
    if (q <= 0 || p <= 0) return setErr('اكتب الكمية وسعر الإغلاق')
    if (q > trade.remaining + 1e-9) return setErr('الكمية أكبر من المتبقّى')
    setBusy(true)
    try {
      await api.closeTrade({ tradeId: id, closedQuantity: qty, exitPrice, fees })
      onDone()
    } catch (e) {
      setErr('فشل الإغلاق: ' + e.message)
      setBusy(false)
    }
  }

  return (
    <>
      {Header}
      <div className="content">
        <div className="card">
          <Field label="الصفقة">
            <select className="input" value={id} onChange={(e) => setId(e.target.value)}>
              <option value="">اختر صفقة...</option>
              {trades.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.symbol} · متبقّى {money(t.remaining, 2)} · دخول {fmtPrice(t.entryPrice)}
                </option>
              ))}
            </select>
          </Field>

          {trade && (
            <>
              <Field label="الكمية اللى بتقفلها"><NumberInput value={qty} onChange={setQty} placeholder={'حتى ' + money(trade.remaining, 2)} /></Field>
              <Field label="سعر الإغلاق"><NumberInput value={exitPrice} onChange={setExitPrice} /></Field>
              <Field label="الرسوم"><NumberInput value={fees} onChange={setFees} placeholder="اختيارى" /></Field>
            </>
          )}
        </div>

        {trade && q > 0 && p > 0 && (
          <div className="card" style={{ background: 'var(--surface-2)' }}>
            <div className="section-title">المعاينة</div>
            <div className="row"><span>متوسط الخروج الجديد</span><span className="tnums">{fmtPrice(newAvg)}</span></div>
            <div className="row"><span>إجمالى المغلق</span><span className="tnums">{money(newClosed, 2)}</span></div>
            <div className="row"><span>المتبقّى بعد الإغلاق</span><span className="tnums">{money(Math.max(0, remainingAfter), 2)}</span></div>
          </div>
        )}

        {err && <div className="neg" style={{ margin: '4px 2px 10px' }}>{err}</div>}
        <button className="btn primary block" onClick={submit} disabled={busy || !trade}>
          {busy ? 'بيقفل...' : 'إغلاق الجزء'}
        </button>
      </div>
    </>
  )
}
