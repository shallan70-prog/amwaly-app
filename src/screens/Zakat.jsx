import React from 'react'
import { api } from '../api.js'
import { useCachedLoader } from '../useCachedLoader.js'
import { money } from '../format.js'

const ASSET_NAMES = {
  'Total Fiat EGP': 'نقدية جنيه',
  'Total Fiat USD': 'نقدية دولار',
  'Total Fiat SAR': 'نقدية ريال',
  'Total Fiat AED': 'نقدية درهم',
  'Total Crypto': 'كريبتو',
  'Gold': 'ذهب',
  'Stocks': 'أسهم'
}

export default function Zakat() {
  const { data, loading, error } = useCachedLoader('zakat', () => api.zakat())

  return (
    <>
      <div className="topbar"><h1>الزكاة</h1></div>
      <div className="content">
        {loading && <div className="spinner" />}
        {error && <div className="card">تعذّر التحميل: {error}</div>}
        {data && (
          <>
            <div className="hero warn">
              <div className="label">باقى الزكاة المستحقة</div>
              <div className="value tnums">{money(data.remainingEgp != null ? data.remainingEgp : data.totalDueEgp)} <span style={{ fontSize: 14 }}>EGP</span></div>
            </div>

            <div className="card">
              <div className="row"><span>إجمالى الزكاة</span><span className="tnums">{money(data.totalDueEgp)}</span></div>
              <div className="row"><span>مدفوع مقدّمًا</span><span className="tnums pos">− {money(data.advancePaidEgp)}</span></div>
              <div className="row"><span style={{ fontWeight: 500 }}>الباقى المستحق</span><span className="tnums" style={{ fontWeight: 600, color: 'var(--warning)' }}>{money(data.remainingEgp != null ? data.remainingEgp : data.totalDueEgp)}</span></div>
            </div>

            <div className="card">
              <div className="section-title">تفصيل الأصول</div>
              <div className="row" style={{ color: 'var(--text-3)', fontSize: 11 }}>
                <span>الأصل</span><span>بعد التحويل</span><span>الزكاة</span>
              </div>
              {data.rows
                .filter((r) => r.afterConversionEgp > 0)
                .map((r, i) => (
                  <div className="row" key={i}>
                    <span>{ASSET_NAMES[r.asset] || r.asset}</span>
                    <span className="muted tnums">{money(r.afterConversionEgp)}</span>
                    <span className="tnums">{money(r.zakatEgp)}</span>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}
