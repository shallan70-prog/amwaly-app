import React, { useState } from 'react'
import { api } from '../../api.js'
import { getCached, invalidate } from '../../cache.js'
import { money } from '../../format.js'
import { FormShell, Field, Select, NumberInput, TextInput, saveErrorText } from './ui.jsx'

const TYPE_HINTS = {
  'Lent': 'سلّفت حد — الفلوس خرجت منك',
  'Received Back': 'حد رجّعلك فلوس',
  'Borrowed': 'استلفت من حد — الفلوس دخلت عليك',
  'Repaid': 'رجّعت لحد فلوس'
}
const WITH_DUE_DATE = ['Lent', 'Borrowed']

const sameName = (a, b) => (a || '').replace(/\s+/g, ' ').trim().toLowerCase() === (b || '').replace(/\s+/g, ' ').trim().toLowerCase()

export default function DebtForm({ opts, onBack, onDone }) {
  const [type, setType] = useState('')
  const [person, setPerson] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('')
  const [location, setLocation] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const types = opts.debtTypes || Object.keys(TYPE_HINTS)
  const people = opts.debtPeople || []
  const locations = (opts.subAccountsByAccountType && opts.subAccountsByAccountType.Saving) || []
  const withDue = WITH_DUE_DATE.indexOf(type) !== -1

  // Current balance with this person, from the already-loaded home summary (no request).
  const summary = getCached('summary')
  const known = summary && summary.data && summary.data.debts
    ? summary.data.debts.people.find((p) => sameName(p.name, person))
    : null

  const submit = async () => {
    setErr('')
    if (!type) return setErr('اختر النوع')
    if (!person.trim()) return setErr('اكتب اسم الشخص')
    if (!(Number(amount) > 0)) return setErr('اكتب المبلغ')
    if (!currency) return setErr('اختر العملة')
    if (!location) return setErr('اختر الخزنة')

    setBusy(true)
    try {
      await api.addDebt({
        type, person: person.trim(), amount, currency, location,
        dueDate: withDue ? dueDate : undefined,
        notes
      })
      invalidate(['formOptions'])
      onDone()
    } catch (e) {
      setErr(saveErrorText(e))
      setBusy(false)
    }
  }

  return (
    <FormShell title="إضافة دين" onBack={onBack} onSubmit={submit} submitting={busy} error={err}>
      <Field label="النوع">
        <select className="input" value={type} onChange={(e) => { setType(e.target.value); setDueDate('') }}>
          <option value="">اختر...</option>
          {types.map((t) => <option key={t} value={t}>{t} — {TYPE_HINTS[t] || t}</option>)}
        </select>
      </Field>

      {type && (
        <>
          <Field label="الشخص">
            <TextInput value={person} onChange={setPerson} placeholder="اكتب الاسم أو اختار من الاقتراحات" list="debt-people" />
            <datalist id="debt-people">
              {people.map((p) => <option key={p} value={p} />)}
            </datalist>
          </Field>

          {known && (
            <div className="muted" style={{ fontSize: 12, margin: '-4px 2px 10px' }}>
              {known.balances.map((b) => (
                <div key={b.currency}>
                  {b.amount > 0 ? `عليه ليك ${money(b.amount, 2)} ${b.currency}` : `انت عليك ليه ${money(-b.amount, 2)} ${b.currency}`}
                </div>
              ))}
            </div>
          )}

          <Field label="المبلغ"><NumberInput value={amount} onChange={setAmount} /></Field>

          <Field label="العملة">
            <Select value={currency} onChange={(v) => { setCurrency(v); setLocation('') }} options={opts.fiatCurrencies || []} />
          </Field>

          {currency && (
            <Field label="الخزنة">
              <Select value={location} onChange={setLocation} options={locations} />
            </Field>
          )}

          {withDue && (
            <Field label="ميعاد السداد (اختيارى)">
              <input className="input" type="date" dir="ltr" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </Field>
          )}

          <Field label="ملاحظة"><TextInput value={notes} onChange={setNotes} placeholder="اختيارى" /></Field>
        </>
      )}
    </FormShell>
  )
}
