import React, { useState, useEffect } from 'react'
import { api } from '../api.js'
import { useCachedLoader } from '../useCachedLoader.js'
import StaleBanner from '../components/StaleBanner.jsx'
import { invalidate } from '../cache.js'
import { money, usd, agoText } from '../format.js'
import CurrencyDetail from './CurrencyDetail.jsx'
import DebtsDetail from './DebtsDetail.jsx'
import History from './History.jsx'
import EntryDetail from './EntryDetail.jsx'
import EntryRow from '../components/EntryRow.jsx'

const FIAT_ROWS = [
  { code: 'EGP', label: 'جنيه', decimals: 0 },
  { code: 'USD', label: 'دولار', decimals: 2 },
  { code: 'SAR', label: 'ريال', decimals: 2 },
  { code: 'AED', label: 'درهم', decimals: 2 }
]

const DETAIL_KEY = 'amwalyCurrencyDetail'
const DEBTS_DETAIL = 'DEBTS'
const HISTORY_DETAIL = 'HISTORY'
const ENTRY_DETAIL = 'ENTRY'
const STALE_PRICES_MS = 60 * 60 * 1000

function detailFromHistory() {
  const s = window.history.state
  return (s && s[DETAIL_KEY]) || null
}

function detailDepth() {
  const s = window.history.state
  return (s && s.amwalyDepth) || 0
}

export default function Home({ showToast }) {
  const { data, loading, error, staleError, mutate, reload } = useCachedLoader('summary', () => api.summary())
  const [refreshError, setRefreshError] = useState('')
  const [detail, setDetail] = useState(detailFromHistory)
  const [entry, setEntry] = useState(null)

  // Each detail page gets its own history entry, so the phone's back button closes it
  // (popstate) instead of leaving the app.
  useEffect(() => {
    const onPop = () => setDetail(detailFromHistory())
    window.addEventListener('popstate', onPop)
    return () => {
      window.removeEventListener('popstate', onPop)
      // Leaving Home (another tab or the Add screen) with detail pages open: drop their entries.
      const depth = detailDepth()
      if (depth) window.history.go(-depth)
    }
  }, [])

  const openDetail = (code) => {
    window.history.pushState({ [DETAIL_KEY]: code, amwalyDepth: detailDepth() + 1 }, '')
    setDetail(code)
  }
  const closeDetail = () => window.history.back()
  const openEntry = (item) => { setEntry(item); openDetail(ENTRY_DETAIL) }
  const entryChanged = (message) => {
    invalidate(['portfolio', 'zakat', 'history'])
    reload()
    showToast(message)
    closeDetail()
  }

  const refresh = async () => {
    showToast('بيحدّث الأسعار...')
    try {
      const s = await api.refresh()
      mutate(s)
      setRefreshError('')
      invalidate(['portfolio', 'zakat'])
      showToast('تم التحديث')
    } catch (e) {
      setRefreshError(e.message || 'error')
      showToast('فشل التحديث')
    }
  }

  if (detail === ENTRY_DETAIL && entry) {
    return <EntryDetail key={entry.id} entry={entry} onBack={closeDetail} onChanged={entryChanged} />
  }

  if (detail === HISTORY_DETAIL || detail === ENTRY_DETAIL) {
    return <History onBack={closeDetail} onOpen={openEntry} />
  }

  if (detail === DEBTS_DETAIL && data) {
    return <DebtsDetail debts={data.debts} onBack={closeDetail} />
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
        <StaleBanner error={refreshError || staleError} />
        {data && (
          <>
            <div className="hero">
              <div className="label">صافى الثروة</div>
              <div className="value tnums">{money(data.netWorthEgp)} <span style={{ fontSize: 14 }}>EGP</span></div>
              {data.pricesUpdatedAt > 0 && (
                <div className={'updated' + (Date.now() - data.pricesUpdatedAt > STALE_PRICES_MS ? ' stale' : '')}>
                  آخر تحديث للأسعار {agoText(data.pricesUpdatedAt)}
                </div>
              )}
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

            {data.recent && (
              <div className="card">
                <div className="section-title">آخر العمليات</div>
                {data.recent.map((e) => <EntryRow key={e.kind + (e.id || e.row)} entry={e} onOpen={openEntry} />)}
                {data.recent.length === 0 && <div className="row"><span className="muted">مفيش عمليات لسه</span></div>}
                <button className="link-row" onClick={() => openDetail(HISTORY_DETAIL)}>عرض الكل</button>
              </div>
            )}

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

            {data.debts && (
              <div className="card">
                <div className="section-title">الديون</div>
                {[
                  { label: 'ليك عند الناس', value: data.debts.receivableEgp, cls: 'pos' },
                  { label: 'عليك للناس', value: data.debts.payableEgp, cls: 'neg' }
                ].map((d) => (
                  <div
                    className="row tap"
                    key={d.label}
                    role="button"
                    tabIndex={0}
                    onClick={() => openDetail(DEBTS_DETAIL)}
                    onKeyDown={(e) => { if (e.key === 'Enter') openDetail(DEBTS_DETAIL) }}
                  >
                    <span>{d.label}</span>
                    <span className="end">
                      <span className={'tnums ' + (d.value ? d.cls : '')}>{money(d.value)} EGP</span>
                      <span className="chev">‹</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
