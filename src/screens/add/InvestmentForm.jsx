import React, { useState } from 'react'
import { api } from '../../api.js'
import { FormShell, Field, Select, NumberInput, TextInput, DateField, todayText, saveErrorText } from './ui.jsx'

export default function InvestmentForm({ opts, onBack, onDone, entry }) {
  const r = (entry && entry.raw) || {}
  const [type, setType] = useState(r.type || '')
  const [symbol, setSymbol] = useState(r.symbol || '')
  const [quote, setQuote] = useState(r.quote || opts.stables[0] || 'USDT')
  const [price, setPrice] = useState(r.price != null ? String(r.price) : '')
  const [quantity, setQuantity] = useState(r.quantity != null ? String(r.quantity) : '')
  const [fees, setFees] = useState(r.fees != null ? String(r.fees) : '')
  const [notes, setNotes] = useState(r.notes || '')
  const [date, setDate] = useState((entry && entry.date) || todayText())
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const submit = async () => {
    setErr('')
    if (!type) return setErr('اختر النوع')
    if (!symbol) return setErr('اكتب العملة')
    if (!price || !quantity) return setErr('اكتب السعر والكمية')
    if (!date) return setErr('اختر التاريخ')
    setBusy(true)
    try {
      const payload = { type, symbol, quote, price, quantity, fees, notes, date }
      await (entry ? api.updateEntry({ kind: 'investment', id: entry.id, ...payload }) : api.addInvestmentTrade(payload))
      onDone()
    } catch (e) {
      setErr(saveErrorText(e))
      setBusy(false)
    }
  }

  return (
    <FormShell title={entry ? 'تعديل صفقة استثمار' : 'صفقة استثمار'} onBack={onBack} onSubmit={submit} submitting={busy} error={err} submitLabel={entry ? 'حفظ التعديل' : undefined}>
      <Field label="النوع"><Select value={type} onChange={setType} options={opts.investmentTradeTypes} /></Field>
      <Field label="العملة">
        <TextInput value={symbol} onChange={(v) => setSymbol(v.toUpperCase())} list="known-symbols" placeholder="BTC" />
        <datalist id="known-symbols">
          {opts.knownInvestmentSymbols.map((s) => <option key={s} value={s} />)}
        </datalist>
      </Field>
      <Field label="عملة التسعير"><Select value={quote} onChange={setQuote} options={opts.stables} placeholder={null} /></Field>
      <Field label="السعر"><NumberInput value={price} onChange={setPrice} /></Field>
      <Field label="الكمية"><NumberInput value={quantity} onChange={setQuantity} /></Field>
      <Field label="الرسوم"><NumberInput value={fees} onChange={setFees} placeholder="اختيارى" /></Field>
      <DateField value={date} onChange={setDate} />
      <Field label="ملاحظة"><TextInput value={notes} onChange={setNotes} placeholder="اختيارى" /></Field>
    </FormShell>
  )
}
