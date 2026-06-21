import React, { useState } from 'react'
import { api } from '../../api.js'
import { FormShell, Field, Select, NumberInput, TextInput } from './ui.jsx'

export default function EntryPlanForm({ opts, onBack, onDone }) {
  const [symbol, setSymbol] = useState('')
  const [capital, setCapital] = useState('')
  const [classification, setClassification] = useState('')
  const [sector, setSector] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const submit = async () => {
    setErr('')
    if (!symbol) return setErr('اكتب العملة')
    setBusy(true)
    try {
      await api.addEntryPlan({ symbol, capital, classification, sector })
      onDone()
    } catch (e) {
      setErr('فشل الحفظ: ' + e.message)
      setBusy(false)
    }
  }

  return (
    <FormShell title="خطة دخول" onBack={onBack} onSubmit={submit} submitting={busy} error={err}>
      <Field label="العملة"><TextInput value={symbol} onChange={(v) => setSymbol(v.toUpperCase())} placeholder="BTC" /></Field>
      <Field label="رأس المال"><NumberInput value={capital} onChange={setCapital} placeholder="اختيارى" /></Field>
      <Field label="التصنيف"><Select value={classification} onChange={setClassification} options={opts.classifications} /></Field>
      <Field label="القطاع"><Select value={sector} onChange={setSector} options={opts.sectors} /></Field>
    </FormShell>
  )
}
