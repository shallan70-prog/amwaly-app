import React from 'react'

function reasonText(w) {
  if (w.reason === 'unknown') return 'مش فى قائمة الأسعار، فمالهاش سعر. لازم تتضاف للقائمة'
  if (w.reason === 'stale') return `ماجالهاش سعر فى آخر تحديث، ومحسوبة بآخر سعر من ${w.lastPriceDate}`
  return 'مالهاش سعر لسه من مصدر الأسعار'
}

// Coins whose value cannot be trusted right now, as the server reports them.
export default function PriceWarnings({ warnings }) {
  if (!warnings || !warnings.length) return null

  return (
    <div className="banner" role="status">
      <div style={{ fontWeight: 600, marginBottom: 4 }}>تحذير أسعار</div>
      {warnings.map((w) => (
        <div key={w.symbol}><span dir="ltr">{w.symbol}</span>: {reasonText(w)}</div>
      ))}
    </div>
  )
}
