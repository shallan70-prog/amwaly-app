import React, { useState } from 'react'
import { api } from '../../api.js'
import { useCachedLoader } from '../../useCachedLoader.js'
import { FormShell, Field, NumberInput } from './ui.jsx'
import { money } from '../../format.js'

export default function ZakatForm({ onBack, onDone }) {
  const { data } = useCachedLoader('zakat', () => api.zakat())
  const current = data ? data.advancePaidEgp : 0

  const [amount, setAmount] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const amt = parseFloat(amount) || 0

  const submit = async () => {
    setErr('')
    if (!(amt > 0)) return setErr('اكتب المبلغ')
    setBusy(true)
    try {
      await api.addZakatAdvance({ amount })
      onDone()
    } catch (e) {
      setErr('فشل الحفظ: ' + e.message)
      setBusy(false)
    }
  }

  return (
    <FormShell title="دفع زكاة" onBack={onBack} onSubmit={submit} submitting={busy} error={err} submitLabel="إضافة للمدفوع">
      <div className="row"><span>مدفوع مقدّمًا حاليًا</span><span className="tnums">{money(current)} EGP</span></div>
      <Field label="المبلغ المدفوع دلوقتى"><NumberInput value={amount} onChange={setAmount} /></Field>
      {amt > 0 && (
        <div className="row">
          <span style={{ fontWeight: 500 }}>الإجمالى بعد الإضافة</span>
          <span className="tnums" style={{ fontWeight: 600, color: 'var(--success)' }}>{money(current + amt)} EGP</span>
        </div>
      )}
    </FormShell>
  )
}
