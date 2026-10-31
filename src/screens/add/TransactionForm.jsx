import React, { useState } from 'react'
import { api } from '../../api.js'
import { money } from '../../format.js'
import { FormShell, Field, Select, NumberInput, TextInput, DateField, todayText, saveErrorText } from './ui.jsx'

export default function TransactionForm({ opts, onBack, onDone, entry }) {
  const r = (entry && entry.raw) || {}
  const [type, setType] = useState(r.type || '')
  const [account, setAccount] = useState(r.account || '')
  const [subAccount, setSubAccount] = useState(r.subAccount || '')
  const [transferTo, setTransferTo] = useState(r.transferTo || '')
  const [toSubAccount, setToSubAccount] = useState(r.toSubAccount || '')
  const [fiat, setFiat] = useState((opts.fiatCurrencies || []).includes(r.currency) ? r.currency : '')
  const [toCurrency, setToCurrency] = useState(r.toCurrency || '')
  const [amount, setAmount] = useState(r.amount != null ? String(r.amount) : '')
  const [amountTo, setAmountTo] = useState(r.amountTo != null ? String(r.amountTo) : '')
  const [cashFlow, setCashFlow] = useState(r.cashFlowSource || '')
  const [notes, setNotes] = useState(r.notes || '')
  const [date, setDate] = useState((entry && entry.date) || todayText())
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const isTransfer = type === 'Transfer'
  const subsFor = (acc) => opts.subAccountsByAccountType[acc] || []
  const assetOf = (acc, sub) => (acc === 'Saving' ? fiat : sub)

  const showFiat = account === 'Saving' || (isTransfer && transferTo === 'Saving')
  const betweenSavings = isTransfer && account === 'Saving' && transferTo === 'Saving'
  const assetFrom = assetOf(account, subAccount)
  const assetTo = (betweenSavings && toCurrency) || assetOf(transferTo, toSubAccount)
  const showAmountTo = isTransfer && account && transferTo && subAccount && toSubAccount && assetFrom !== assetTo
  const showCashFlow = !isTransfer && !!account

  // Shown as the larger side, the way a rate is usually read: 1 USD = 56 EGP.
  const rate = showAmountTo && Number(amount) > 0 && Number(amountTo) > 0 ? Number(amountTo) / Number(amount) : 0
  const rateText = rate >= 1
    ? `1 ${assetFrom} = ${money(rate, 2)} ${assetTo}`
    : rate > 0 ? `1 ${assetTo} = ${money(1 / rate, 2)} ${assetFrom}` : ''

  // Cash Flow Source options depend on the type: Income → income sources, Expenses →
  // expense sources, Adjustment → both. Falls back to the legacy flat list on older APIs.
  const cfIncome = opts.incomeSources || opts.cashFlowSources || []
  const cfExpense = opts.expenseSources || opts.cashFlowSources || []
  const cashFlowOptions =
    type === 'Income' ? cfIncome
      : type === 'Expenses' ? cfExpense
        : [...new Set([...cfIncome, ...cfExpense])]

  const currency = showFiat ? fiat : subAccount

  const submit = async () => {
    setErr('')
    if (!type) return setErr('اختر النوع')
    if (!account || !subAccount) return setErr('اختر الحساب والحساب الفرعى')
    if (isTransfer && (!transferTo || !toSubAccount)) return setErr('اختر وجهة التحويل')
    if (showFiat && !fiat) return setErr('اختر العملة')
    if (!amount) return setErr('اكتب المبلغ')
    if (showAmountTo && !amountTo) return setErr('اكتب المبلغ المستلم')
    if (!date) return setErr('اختر التاريخ')

    setBusy(true)
    try {
      const payload = {
        type, account, subAccount,
        transferTo: isTransfer ? transferTo : undefined,
        toSubAccount: isTransfer ? toSubAccount : undefined,
        toCurrency: betweenSavings ? toCurrency : undefined,
        amount, currency,
        amountTo: showAmountTo ? amountTo : undefined,
        cashFlowSource: showCashFlow ? cashFlow : undefined,
        notes, date
      }
      await (entry ? api.updateEntry({ kind: 'transaction', id: entry.id, ...payload }) : api.addTransaction(payload))
      onDone()
    } catch (e) {
      setErr(saveErrorText(e))
      setBusy(false)
    }
  }

  return (
    <FormShell title={entry ? 'تعديل معاملة' : 'إضافة معاملة'} onBack={onBack} onSubmit={submit} submitting={busy} error={err} submitLabel={entry ? 'حفظ التعديل' : undefined}>
      <Field label="النوع">
        <Select value={type} onChange={(v) => { setType(v); setTransferTo(''); setToSubAccount(''); setToCurrency(''); setCashFlow('') }} options={opts.transactionTypes} />
      </Field>

      {type && (
        <Field label="الحساب">
          <Select value={account} onChange={(v) => { setAccount(v); setSubAccount('') }} options={opts.accountTypes} />
        </Field>
      )}

      {account && (
        <Field label="الحساب الفرعى">
          <Select value={subAccount} onChange={setSubAccount} options={subsFor(account)} />
        </Field>
      )}

      {isTransfer && subAccount && (
        <Field label="التحويل لـ">
          <Select value={transferTo} onChange={(v) => { setTransferTo(v); setToSubAccount(''); setToCurrency('') }} options={opts.accountTypes} />
        </Field>
      )}

      {isTransfer && transferTo && (
        <Field label="الحساب الفرعى (الوجهة)">
          <Select value={toSubAccount} onChange={setToSubAccount} options={subsFor(transferTo)} />
        </Field>
      )}

      {showFiat && (
        <Field label="العملة">
          <Select value={fiat} onChange={setFiat} options={opts.fiatCurrencies} />
        </Field>
      )}

      {betweenSavings && fiat && (
        <Field label="العملة المستلمة">
          <Select value={toCurrency} onChange={setToCurrency} options={opts.fiatCurrencies} placeholder="نفس العملة" />
        </Field>
      )}

      {(subAccount || isTransfer) && (
        <Field label="المبلغ"><NumberInput value={amount} onChange={setAmount} /></Field>
      )}

      {showAmountTo && (
        <Field label="المبلغ المستلم">
          <NumberInput value={amountTo} onChange={setAmountTo} />
          {rateText && <div dir="ltr" style={{ fontSize: 12, color: 'var(--text-2)', margin: '-4px 2px 0', textAlign: 'right' }}>{rateText}</div>}
        </Field>
      )}

      {showCashFlow && (
        <Field label="مصدر التدفّق">
          <Select value={cashFlow} onChange={setCashFlow} options={cashFlowOptions} />
        </Field>
      )}

      {subAccount && <DateField value={date} onChange={setDate} />}

      {subAccount && (
        <Field label="ملاحظة"><TextInput value={notes} onChange={setNotes} placeholder="اختيارى" /></Field>
      )}
    </FormShell>
  )
}
