import React, { useState, useEffect, useRef } from 'react'
import { api } from '../api.js'
import { useCachedLoader } from '../useCachedLoader.js'
import { invalidate } from '../cache.js'
import { money, usd } from '../format.js'
import CurrencyDetail from './CurrencyDetail.jsx'

const FIAT_ROWS = [
  { code: 'EGP', label: 'جنيه', decimals: 0 },
  { code: 'USD', label: 'دولار', decimals: 2 },
  { code: 'SAR', label: 'ريال', decimals: 2 },
  { code: 'AED', label: 'درهم', decimals: 2 }
]

const DETAIL_KEY = 'amwalyCurrencyDetail'

function detailFromHistory() {
  const s = window.history.state
  return (s && s[DETAIL_KEY]) || null
}

export default function Home({ showToast }) {
  const { data, loading, error, mutate } = useCachedLoader('summary', () => api.summary())
  const [detail, setDetail] = useState(detailFromHistory)
  const detailRef = useRef(detail)
  detailRef.current = detail

  // Each detail page gets its own history entry, so the phone's back button closes it
  // (popstate) instead of leaving the app.
  useEffect(() => {
    const onPop = () => setDetail(detailFromHistory())
    window.addEventListener('popstate', onPop)
    return () => {
      window.removeEventListener('popstate', onPop)
      // Leaving Home (another tab or the Add screen) with a detail page open: drop its entry.
      if (detailRef.current) window.history.back()
    }
  }, [])

  const openDetail = (code) => {
    window.history.pushState({ [DETAIL_KEY]: code }, '')
    setDetail(code)
  }
  const closeDetail = () => window.history.back()

  const refresh = async () => {
    showToast('بيحدّث الأسعار...')
    try {
      const s = await api.refresh()
      mutate(s)
      invalidate(['portfolio', 'zakat'])
      showToast('تم التحديث')
    } catch (e) {
      showToast('فشل التحديث')
    }
  }

  if (detail && data) {
    const row = FIAT_ROWS.find((f) => f.code === detail) || { code: detail, label: '', decimals: 2 }
    const byLocation = data.liquidity.fiatByLocation
    return (
      <CurrencyDetail
        code={row.code}
        label={row.label}
        decimals={row.decimals}
        total={data.liquidity.fiat[row.code]}
        locations={byLocation ? byLocation[row.code] || [] : null}
        onBack={closeDetail}
      />
    )
  }

  return (
    <>
      <div className="topbar">
        <h1>أموالى</h1>
        <button
          onClick={refresh}
          style={{ background: 'none', border: 'none', color: 'var(--info)', fontSize: 14, fontFamily: 'inherit', cursor: 'pointer' }}
        >↻ تحديث</button>
      </div>
      <div className="content">
        {loading && <div className="spinner" />}
        {error && <div className="card">تعذّر التحميل: {error}</div>}
        {data && (
          <>
            <div className="hero">
              <div className="label">صافى الثروة</div>
              <div className="value tnums">{money(data.netWorthEgp)} <span style={{ fontSize: 14 }}>EGP</span></div>
            </div>

            <div className="metrics">
              <div className="metric">
                <div className="label">السيولة (جنيه)</div>
                <div className="value tnums">{money(data.liquidity.fiat.EGP)}</div>
              </div>
              <div className="metric">
                <div className="label">الثروة بالدولار</div>
                <div className="value tnums">{data.egpPerUsd > 0 ? usd(data.netWorthEgp / data.egpPerUsd, 0) : '—'}</div>
              </div>
              <div className="metric">
                <div className="label">العملات المستقرّة</div>
                <div className="value tnums">{money(data.liquidity.totalStableUsd, 2)}</div>
              </div>
              <div className="metric">
                <div className="label">الكريبتو USD</div>
                <div className="value tnums">{money(data.crypto.totalPortfolioUsd != null ? data.crypto.totalPortfolioUsd : data.crypto.marketValueUsd, 2)}</div>
              </div>
            </div>

            <div className="card">
              <div className="section-title">الزكاة</div>
              <div className="row">
                <span>باقى الزكاة المستحقة</span>
                <span className="tnums" style={{ color: 'var(--warning)', fontWeight: 600 }}>{money(data.zakatRemainingEgp != null ? data.zakatRemainingEgp : data.zakatDueEgp)} EGP</span>
              </div>
            </div>

            <div className="card">
              <div className="section-title">الأرصدة الورقية</div>
              {FIAT_ROWS.map((f) => (
                <div
                  className="row tap"
                  key={f.code}
                  role="button"
                  tabIndex={0}
                  onClick={() => openDetail(f.code)}
                  onKeyDown={(e) => { if (e.key === 'Enter') openDetail(f.code) }}
                >
                  <span>{f.label} {f.code}</span>
                  <span className="end">
                    <span className="tnums">{money(data.liquidity.fiat[f.code], f.decimals)}</span>
                    <span className="chev">‹</span>
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}
