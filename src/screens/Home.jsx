import React from 'react'
import { api } from '../api.js'
import { useCachedLoader } from '../useCachedLoader.js'
import { invalidate } from '../cache.js'
import { money, signed, plClass } from '../format.js'

export default function Home({ showToast }) {
  const { data, loading, error, mutate } = useCachedLoader('summary', () => api.summary())

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
                <div className="label">مستقرّة USDT</div>
                <div className="value tnums">{money(data.liquidity.totalStableUsd, 2)}</div>
              </div>
              <div className="metric">
                <div className="label">الكريبتو USD</div>
                <div className="value tnums">{money(data.crypto.marketValueUsd, 2)}</div>
              </div>
              <div className="metric">
                <div className="label">ربح/خسارة</div>
                <div className={'value tnums ' + plClass(data.crypto.totalPL)}>{signed(data.crypto.totalPL, 2)}</div>
              </div>
            </div>

            <div className="card">
              <div className="section-title">الزكاة المستحقة</div>
              <div className="row">
                <span>إجمالى الزكاة</span>
                <span className="tnums" style={{ color: 'var(--warning)', fontWeight: 600 }}>{money(data.zakatDueEgp)} EGP</span>
              </div>
            </div>

            <div className="card">
              <div className="section-title">الأرصدة الورقية</div>
              <div className="row"><span>جنيه EGP</span><span className="tnums">{money(data.liquidity.fiat.EGP)}</span></div>
              <div className="row"><span>دولار USD</span><span className="tnums">{money(data.liquidity.fiat.USD, 2)}</span></div>
              <div className="row"><span>ريال SAR</span><span className="tnums">{money(data.liquidity.fiat.SAR, 2)}</span></div>
              <div className="row"><span>درهم AED</span><span className="tnums">{money(data.liquidity.fiat.AED, 2)}</span></div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
