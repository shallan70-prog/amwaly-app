import React, { useState } from 'react'
import { api } from '../../api.js'
import { useCachedLoader } from '../../useCachedLoader.js'
import { FormShell, Field, Select, NumberInput, TextInput, DateField, todayText, saveErrorText } from './ui.jsx'
import { money } from '../../format.js'

const ZAKAT_SOURCE = 'Zakat'

// A zakat payment is an expense row with the Zakat source, so it leaves the balance and
// shows in the history like any other operation.
export default function ZakatForm({ opts, onBack, onDone }) {
  const { data } = useCachedLoader('zakat', () => api.zakat())

  const [location, setLocation] = useState('')
  const [currency, setCurrency] = useState('EGP')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(todayText())
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const locations = (opts.subAccountsByAccountType && opts.subAccountsByAccountType.Saving) || []

  const submit = async () => {
    setErr('')
    if (!location) return setErr('اختر الخزنة')
    if (!(parseFloat(amount) > 0)) return setErr('اكتب المبلغ')
    if (!date) return setErr('اختر التاريخ')
    setBusy(true)
    try {
      await api.addTransaction({
        type: 'Expenses', account: 'Saving', subAccount: location,
        amount, currency, cashFlowSource: ZAKAT_SOURCE, notes, date
      })
      onDone()
    } catch (e) {
      setErr(saveErrorText(e))
      setBusy(false)
    }
  }

  return (
    <FormShell title="دفع زكاة" onBack={onBack} onSubmit={submit} submitting={busy} error={err} submitLabel="تسجيل الدفعة">
      {data && (
        <>
          <div className="row"><span>المدفوع فى الحول الحالى</span><span className="tnums">{money(data.advancePaidEgp)} EGP</span></div>
          {data.oldRemainingEgp > 0 && (
            <div className="row"><span>متبقى من حول قديم</span><span className="tnums">{money(data.oldRemainingEgp)} EGP</span></div>
          )}
          <div className="row"><span>الباقى</span><span className="tnums">{money(data.remainingEgp)} EGP</span></div>
        </>
      )}
      <Field label="الخزنة"><Select value={location} onChange={setLocation} options={locations} /></Field>
      <Field label="العملة"><Select value={currency} onChange={setCurrency} options={opts.fiatCurrencies || []} placeholder={null} /></Field>
      <Field label="المبلغ"><NumberInput value={amount} onChange={setAmount} /></Field>
      <DateField value={date} onChange={setDate} />
      <Field label="ملاحظة"><TextInput value={notes} onChange={setNotes} placeholder="اختيارى" /></Field>
    </FormShell>
  )
}
