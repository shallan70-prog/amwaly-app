import React, { useState } from 'react'
import { api } from '../../api.js'
import { getCached, invalidate } from '../../cache.js'
import { money } from '../../format.js'
import { FormShell, Field, Select, NumberInput, TextInput, DateField, todayText, saveErrorText } from './ui.jsx'

const TYPE_HINTS = {
  'Lent': 'سلّفت حد — الفلوس خرجت منك',
  'Received Back': 'حد رجّعلك فلوس',
  'Borrowed': 'استلفت من حد — الفلوس دخلت عليك',
  'Repaid': 'رجّعت لحد فلوس'
}
const WITH_DUE_DATE = ['Lent', 'Borrowed']
// A debt from before the records started: only these types, and no money moves.
const OPENING_TYPES = ['Lent', 'Borrowed']
const OPENING_LABEL = 'رصيد قديم (قبل التسجيل)'
// A payment settles a debt of the other side: Repaid pays what I borrowed, Received Back collects what I lent.
const SETTLES = { 'Repaid': 'Borrowed', 'Received Back': 'Lent' }
const ZAKAT_IN = 'يدخل'
const ZAKAT_OUT = 'لا يدخل'
const ZAKAT_HINTS = {
  'Lent': { [ZAKAT_IN]: 'يدخل — هتدفع عليه زكاة', [ZAKAT_OUT]: 'لا يدخل — مش هتدفع عليه زكاة' },
  'Borrowed': { [ZAKAT_IN]: 'يدخل — هيتخصم من الزكاة', [ZAKAT_OUT]: 'لا يدخل — مش هيتخصم من الزكاة' }
}
const defaultZakat = (type) => (type === 'Lent' ? ZAKAT_IN : ZAKAT_OUT)

const sameName = (a, b) => (a || '').replace(/\s+/g, ' ').trim().toLowerCase() === (b || '').replace(/\s+/g, ' ').trim().toLowerCase()

export default function DebtForm({ opts, onBack, onDone, entry }) {
  const r = (entry && entry.raw) || {}
  const [type, setType] = useState(r.type || '')
  const [person, setPerson] = useState(r.person || '')
  const [amount, setAmount] = useState(r.amount != null ? String(r.amount) : '')
  const [currency, setCurrency] = useState(r.currency || '')
  const [location, setLocation] = useState(r.location || '')
  const [dueDate, setDueDate] = useState(r.dueDate || '')
  const [notes, setNotes] = useState(r.notes || '')
  const [zakat, setZakat] = useState(r.zakat || '')
  const [debtId, setDebtId] = useState(r.debtId || '')
  const [date, setDate] = useState((entry && entry.date) || todayText())
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const types = opts.debtTypes || Object.keys(TYPE_HINTS)
  const people = opts.debtPeople || []
  const locations = (opts.subAccountsByAccountType && opts.subAccountsByAccountType.Saving) || []
  const withDue = WITH_DUE_DATE.indexOf(type) !== -1
  const opening = opts.debtOpeningLocation
  const locationOptions = opening && OPENING_TYPES.indexOf(type) !== -1 ? [...locations, opening] : locations
  const isNewDebt = OPENING_TYPES.indexOf(type) !== -1
  const zakatValue = zakat || defaultZakat(type)

  // A payment picks the debt it settles. Older servers send no list: then the name is typed as before.
  const picksDebt = Boolean(SETTLES[type]) && Array.isArray(opts.openDebts)
  const choices = picksDebt ? opts.openDebts.filter((d) => d.type === SETTLES[type]) : []
  // An edited payment's own debt can be fully paid by it, so keep it in the list.
  if (picksDebt && entry && r.debtId && !choices.some((d) => d.id === r.debtId)) {
    choices.push({ id: r.debtId, person: r.person, currency: r.currency, remaining: null, label: r.forDebt || r.person })
  }
  const chosen = choices.find((d) => d.id === debtId) || null

  // Current balance with this person, from the already-loaded home summary (no request).
  const summary = getCached('summary')
  const known = summary && summary.data && summary.data.debts
    ? summary.data.debts.people.find((p) => sameName(p.name, person))
    : null

  const pickDebt = (id) => {
    const d = choices.find((c) => c.id === id)
    setDebtId(id)
    setPerson(d ? d.person : '')
    if (!d || d.currency !== currency) setLocation('')
    setCurrency(d ? d.currency : '')
  }

  const submit = async () => {
    setErr('')
    if (!type) return setErr('اختر النوع')
    if (picksDebt && !chosen) return setErr('اختر الدين')
    if (!person.trim()) return setErr('اكتب اسم الشخص')
    if (!(Number(amount) > 0)) return setErr('اكتب المبلغ')
    if (chosen && chosen.remaining != null && Number(amount) > chosen.remaining) {
      return setErr(`المبلغ أكبر من الباقى فى الدين ده (الباقى ${money(chosen.remaining, 2)} ${chosen.currency})`)
    }
    if (!currency) return setErr('اختر العملة')
    if (!location) return setErr('اختر الخزنة')
    if (!date) return setErr('اختر التاريخ')

    setBusy(true)
    try {
      const payload = {
        type, person: person.trim(), amount, currency, location,
        dueDate: withDue ? dueDate : undefined,
        zakat: isNewDebt ? zakatValue : undefined,
        debtId: picksDebt ? debtId : undefined,
        notes, date
      }
      await (entry ? api.updateEntry({ kind: 'debt', id: entry.id, ...payload }) : api.addDebt(payload))
      invalidate(['formOptions'])
      onDone()
    } catch (e) {
      setErr(saveErrorText(e))
      setBusy(false)
    }
  }

  return (
    <FormShell title={entry ? 'تعديل دين' : 'إضافة دين'} onBack={onBack} onSubmit={submit} submitting={busy} error={err} submitLabel={entry ? 'حفظ التعديل' : undefined}>
      <Field label="النوع">
        <select className="input" value={type} onChange={(e) => {
          const next = e.target.value
          setType(next)
          setDueDate('')
          setZakat('')
          if (SETTLES[next] !== SETTLES[type]) {
            setDebtId('')
            if (SETTLES[next] && Array.isArray(opts.openDebts)) { setPerson(''); setCurrency(''); setLocation('') }
          }
          if (location === opening && OPENING_TYPES.indexOf(next) === -1) setLocation('')
        }}>
          <option value="">اختر...</option>
          {types.map((t) => <option key={t} value={t}>{t} — {TYPE_HINTS[t] || t}</option>)}
        </select>
      </Field>

      {type && (
        <>
          {picksDebt ? (
            <Field label="الدين">
              <select className="input" value={debtId} onChange={(e) => pickDebt(e.target.value)}>
                <option value="">{choices.length ? 'اختر...' : 'مفيش ديون مفتوحة من النوع ده'}</option>
                {choices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.remaining == null ? d.label : `${d.person} — فاضل ${money(d.remaining, 2)} ${d.currency}`}
                  </option>
                ))}
              </select>
            </Field>
          ) : (
            <Field label="الشخص">
              <TextInput value={person} onChange={setPerson} placeholder="اكتب الاسم أو اختار من الاقتراحات" list="debt-people" />
              <datalist id="debt-people">
                {people.map((p) => <option key={p} value={p} />)}
              </datalist>
            </Field>
          )}

          {!picksDebt && known && (
            <div className="muted" style={{ fontSize: 12, margin: '-4px 2px 10px' }}>
              {known.balances.map((b) => (
                <div key={b.currency}>
                  {b.amount > 0 ? `عليه ليك ${money(b.amount, 2)} ${b.currency}` : `انت عليك ليه ${money(-b.amount, 2)} ${b.currency}`}
                </div>
              ))}
            </div>
          )}

          <Field label="المبلغ"><NumberInput value={amount} onChange={setAmount} /></Field>

          {!picksDebt && (
            <Field label="العملة">
              <Select value={currency} onChange={(v) => { setCurrency(v); setLocation('') }} options={opts.fiatCurrencies || []} />
            </Field>
          )}

          {currency && (
            <Field label="الخزنة">
              <select className="input" value={location} onChange={(e) => setLocation(e.target.value)}>
                <option value="">اختر...</option>
                {locationOptions.map((l) => <option key={l} value={l}>{l === opening ? OPENING_LABEL : l}</option>)}
              </select>
            </Field>
          )}

          {opening && location === opening && (
            <div className="muted" style={{ fontSize: 12, margin: '-4px 2px 10px' }}>
              دين من قبل ما تبدأ التسجيل: بيتسجل على الشخص بس، ومفيش أى رصيد عندك هيتحرك
            </div>
          )}

          {isNewDebt && (
            <Field label="الزكاة">
              <select className="input" value={zakatValue} onChange={(e) => setZakat(e.target.value)}>
                {[ZAKAT_IN, ZAKAT_OUT].map((z) => <option key={z} value={z}>{ZAKAT_HINTS[type][z]}</option>)}
              </select>
            </Field>
          )}

          <DateField value={date} onChange={setDate} />

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
