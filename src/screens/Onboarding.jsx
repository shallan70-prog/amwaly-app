import React, { useState } from 'react'
import { getConfig, setConfig, api } from '../api.js'

export default function Onboarding({ onDone }) {
  const cfg = getConfig()
  const [url, setUrl] = useState(cfg.url)
  const [token, setToken] = useState(cfg.token)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const connect = async () => {
    setErr('')
    if (!url.trim() || !token.trim()) { setErr('اكتب الرابط والمفتاح'); return }
    setBusy(true)
    setConfig(url, token)
    try {
      await api.summary()
      onDone()
    } catch (e) {
      setErr(e.message === 'unauthorized' ? 'المفتاح غير صحيح' : 'تعذّر الاتصال: ' + e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="app">
      <div className="content" style={{ paddingTop: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 40 }}>💰</div>
          <h1 style={{ margin: '8px 0 0' }}>أموالى</h1>
          <div className="muted">اربط التطبيق بالشيت</div>
        </div>

        <div className="card">
          <label className="field">رابط الـ Web App</label>
          <input className="input" value={url} onChange={(e) => setUrl(e.target.value)} dir="ltr" />
          <label className="field">المفتاح (API token)</label>
          <input className="input" value={token} onChange={(e) => setToken(e.target.value)} dir="ltr" placeholder="الصق المفتاح هنا" />
          {err && <div className="neg" style={{ marginBottom: 8 }}>{err}</div>}
          <button className="btn primary" onClick={connect} disabled={busy}>
            {busy ? 'بيتصل...' : 'اتصال'}
          </button>
        </div>
        <div className="muted" style={{ fontSize: 11, textAlign: 'center' }}>
          المفتاح من قائمة Mobile ← Setup / Show API Token فى الشيت
        </div>
      </div>
    </div>
  )
}
