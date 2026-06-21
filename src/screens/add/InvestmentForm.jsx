import React, { useState } from 'react'
import { api } from '../../api.js'
import { FormShell, Field, Select, NumberInput, TextInput } from './ui.jsx'

export default function InvestmentForm({ opts, onBack, onDone }) {
  const [type, setType] = useState('')
  const [symbol, setSymbol] = useState('')
  const [quote, setQuote] = useState(opts.stables[0] || 'USDT')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [fees, setFees] = useState('')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const submit = async () => {
    setErr('')
    if (!type) return setErr('اختر النوع')
    if (!symbol) return setErr('اكتب العملة')
    if (!price || !quantity) return setErr('اكتب السعر والكمية')
    setBusy(true)
    try {
      await api.addInvestmentTrade({ type, symbol, quote, price, quantity, fees, notes })
      onDone()
    } catch (e) {
      setErr('فشل الحفظ: ' + e.message)
      setBusy(false)
    }
  }

  return (
    <FormShell title="صفقة استثمار" onBack={onBack} onSubmit={submit} submitting={busy} error={err}>
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
      <Field label="ملاحظة"><TextInput value={notes} onChange={setNotes} placeholder="اختيارى" /></Field>
    </FormShell>
  )
}
