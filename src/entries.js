const TRANSACTION_LABELS = { Income: 'دخل', Expenses: 'مصروف', Transfer: 'تحويل', Adjustment: 'تسوية' }

export const KIND_FILTERS = [
  { id: 'all', label: 'الكل', kinds: null },
  { id: 'transaction', label: 'معاملات', kinds: ['transaction'] },
  { id: 'deals', label: 'صفقات', kinds: ['investment', 'trade'] },
  { id: 'debt', label: 'ديون', kinds: ['debt'] }
]

function debtTitle(e) {
  if (e.label === 'Lent') return `سلّفت ${e.person}`
  if (e.label === 'Received Back') return `اترجعلى من ${e.person}`
  if (e.label === 'Borrowed') return `استلفت من ${e.person}`
  if (e.label === 'Repaid') return `رجّعت لـ ${e.person}`
  return e.person
}

export function entryTitle(e) {
  if (e.kind === 'transaction') return TRANSACTION_LABELS[e.label] || e.label
  if (e.kind === 'investment') return `${e.label === 'sell' ? 'بيع' : 'شراء'} ${e.symbol}`
  if (e.kind === 'debt') return debtTitle(e)
  return `صفقة تداول ${e.symbol}`
}

export function entryPlace(e) {
  if (e.from && e.to) return `من ${e.from} إلى ${e.to}`
  return e.from || ''
}

// pos: money came in, neg: money went out, flat: moved or neutral.
export function entryDirection(e) {
  if (e.kind === 'transaction') return e.label === 'Income' ? 'pos' : e.label === 'Expenses' ? 'neg' : 'flat'
  if (e.kind === 'debt') return e.label === 'Received Back' || e.label === 'Borrowed' ? 'pos' : 'neg'
  return 'flat'
}

export function entryMatches(e, query) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return [entryTitle(e), e.from, e.to, e.notes, e.asset, e.date, String(e.amount)]
    .some((text) => (text || '').toLowerCase().includes(q))
}
