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

async function callGet(action, params = {}) {
  const { url, token } = getConfig()
  if (!url || !token) throw new Error('not_configured')
  const qs = new URLSearchParams({ action, token, ...params })
  const res = await fetch(`${url}?${qs.toString()}`, { method: 'GET', redirect: 'follow' })
  const data = await res.json()
  if (!data.ok) throw new Error(data.error || 'request_failed')
  return data
}

// POST sends JSON as text/plain to avoid a CORS preflight on Apps Script.
async function callPost(action, payload = {}) {
  const { url, token } = getConfig()
  if (!url || !token) throw new Error('not_configured')
  const res = await fetch(url, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, token, ...payload })
  })
  const data = await res.json()
  if (!data.ok) throw new Error(data.error || 'request_failed')
  return data
}

export const api = {
  summary: () => callGet('summary'),
  portfolio: () => callGet('portfolio'),
  zakat: () => callGet('zakat'),
  formOptions: () => callGet('formOptions'),
  report: (report, params = {}) => callGet('reports', { report, ...params }),
  openTrades: () => callGet('openTrades'),
  refresh: () => callGet('refresh'),
  // Writes (server endpoints land in the next step):
  addTransaction: (payload) => callPost('addTransaction', payload),
  addInvestmentTrade: (payload) => callPost('addInvestmentTrade', payload),
  addTrade: (payload) => callPost('addTrade', payload),
  closeTrade: (payload) => callPost('closeTrade', payload),
  addEntryPlan: (payload) => callPost('addEntryPlan', payload)
}
