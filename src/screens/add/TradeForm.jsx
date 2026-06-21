import React, { useState } from 'react'
import { api } from '../../api.js'
import { FormShell, Field, Select, NumberInput, TextInput } from './ui.jsx'

export default function TradeForm({ opts, onBack, onDone }) {
  const [symbol, setSymbol] = useState('')
  const [quote, setQuote] = useState(opts.stables[0] || 'USDT')
  const [setup, setSetup] = useState('')
  const [entryPrice, setEntryPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [stopLoss, setStopLoss] = useState('')
  const [takeProfit, setTakeProfit] = useState('')
  const [fees, setFees] = useState('')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const submit = async () => {
    setErr('')
    if (!symbol) return setErr('اكتب العملة')
    if (!entryPrice || !quantity) return setErr('اكتب سعر الدخول والكمية')
    setBusy(true)
    try {
      await api.addTrade({ symbol, quote, setup, entryPrice, quantity, stopLoss, takeProfit, fees, notes })
      onDone()
    } catch (e) {
      setErr('فشل الحفظ: ' + e.message)
      setBusy(false)
    }
  }

  return (
    <FormShell title="صفقة تداول" onBack={onBack} onSubmit={submit} submitting={busy} error={err}>
      <Field label="العملة">
        <TextInput value={symbol} onChange={(v) => setSymbol(v.toUpperCase())} list="known-symbols-t" placeholder="BTC" />
        <datalist id="known-symbols-t">
          {opts.knownInvestmentSymbols.map((s) => <option key={s} value={s} />)}
        </datalist>
      </Field>
      <Field label="عملة التسعير"><Select value={quote} onChange={setQuote} options={opts.stables} placeholder={null} /></Field>
      <Field label="النمط"><Select value={setup} onChange={setSetup} options={opts.tradeSetups} /></Field>
      <Field label="سعر الدخول"><NumberInput value={entryPrice} onChange={setEntryPrice} /></Field>
      <Field label="الكمية"><NumberInput value={quantity} onChange={setQuantity} /></Field>
      <Field label="وقف الخسارة"><NumberInput value={stopLoss} onChange={setStopLoss} placeholder="اختيارى" /></Field>
      <Field label="الهدف"><NumberInput value={takeProfit} onChange={setTakeProfit} placeholder="اختيارى" /></Field>
      <Field label="الرسوم"><NumberInput value={fees} onChange={setFees} placeholder="اختيارى" /></Field>
      <Field label="ملاحظة"><TextInput value={notes} onChange={setNotes} placeholder="اختيارى" /></Field>
    </FormShell>
  )
}
