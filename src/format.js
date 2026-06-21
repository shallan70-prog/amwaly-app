const money0 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })
const money2 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })
const pct1 = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 })

export function money(n, decimals = 0) {
  const v = Number(n) || 0
  return decimals === 0 ? money0.format(v) : money2.format(v)
}

export function pct(ratio) {
  return pct1.format(Number(ratio) || 0)
}

// USD amount with a leading dollar sign.
export function usd(n, decimals = 2) {
  return '$' + money(n, decimals)
}

// Smart price formatting: small crypto prices need more decimals.
export function price(n) {
  const v = Number(n) || 0
  const abs = Math.abs(v)
  const decimals = abs >= 100 ? 2 : abs >= 1 ? 3 : abs >= 0.01 ? 4 : 6
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: decimals }).format(v)
}

export function plClass(n) {
  const v = Number(n) || 0
  return v > 0 ? 'pos' : v < 0 ? 'neg' : 'flat'
}

export function signed(n, decimals = 0) {
  const v = Number(n) || 0
  const s = money(Math.abs(v), decimals)
  return v > 0 ? '+' + s : v < 0 ? '−' + s : s
}
