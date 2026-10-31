const LS_URL = 'amwaly_api_url'
const LS_TOKEN = 'amwaly_api_token'

// Prefilled so the user only needs to paste the token.
const DEFAULT_URL =
  'https://script.google.com/macros/s/AKfycbzlEtSiZT-B6sLqDtOmxqCtuFcX3LY3rmuWR-FWGAH1WPMcl3rti0yepnNLSWDRZYoj0w/exec'

export function getConfig() {
  return {
    url: localStorage.getItem(LS_URL) || DEFAULT_URL,
    token: localStorage.getItem(LS_TOKEN) || ''
  }
}

export function setConfig(url, token) {
  localStorage.setItem(LS_URL, (url || '').trim())
  localStorage.setItem(LS_TOKEN, (token || '').trim())
}

export function isConfigured() {
  const c = getConfig()
  return !!(c.url && c.token)
}

// Every call is a POST so the token never appears in a URL. JSON goes as text/plain
// to avoid a CORS preflight on Apps Script.
async function call(action, payload = {}) {
  const { url, token } = getConfig()
  if (!url || !token) throw new Error('not_configured')
  const res = await fetch(url, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, token, ...payload })
  })
  const data = await res.json()
  if (!data.ok) {
    const err = new Error(data.error || 'request_failed')
    err.data = data
    throw err
  }
  return data
}

export const api = {
  summary: () => call('summary'),
  portfolio: () => call('portfolio'),
  zakat: () => call('zakat'),
  formOptions: () => call('formOptions'),
  report: (report, params = {}) => call('reports', { report, ...params }),
  openTrades: () => call('openTrades'),
  refresh: () => call('refresh'),

  addTransaction: (payload) => call('addTransaction', payload),
  addInvestmentTrade: (payload) => call('addInvestmentTrade', payload),
  addTrade: (payload) => call('addTrade', payload),
  closeTrade: (payload) => call('closeTrade', payload),
  addEntryPlan: (payload) => call('addEntryPlan', payload),
  addZakatAdvance: (payload) => call('addZakatAdvance', payload),
  addDebt: (payload) => call('addDebt', payload)
}
