import React from 'react'
import { api } from '../api.js'
import { useLoader } from '../useLoader.js'
import { money, pct, signed, plClass, usd } from '../format.js'

export default function Portfolio() {
  const { data, loading, error } = useLoader(() => api.portfolio())

  return (
    <>
      <div className="topbar"><h1>المحفظة</h1></div>
      <div className="content">
        {loading && <div className="spinner" />}
        {error && <div className="card">تعذّر التحميل: {error}</div>}
        {data && (
          <>
            <div className="metrics">
              <div className="metric">
                <div className="label">إجمالى الكريبتو</div>
                <div className="value tnums">{usd(data.totalMarketUsd)}</div>
              </div>
              <div className="metric">
                <div className="label">ربح/خسارة</div>
                <div className={'value tnums ' + plClass(data.totalPL)}>{signed(data.totalPL, 2)}</div>
              </div>
            </div>

            <div className="card">
              <div className="row" style={{ color: 'var(--text-3)', fontSize: 11 }}>
                <span>العملة</span><span>القيمة</span><span>ربح/خسارة</span>
              </div>
              {data.coins.map((c) => (
                <div className="row" key={c.symbol}>
                  <span className="sym">{c.symbol}</span>
                  <span className="muted tnums">{usd(c.marketValue)}</span>
                  <span className={'tnums ' + plClass(c.totalPL)}>{pct(c.totalPLPercent)}</span>
                </div>
              ))}
              {data.coins.length === 0 && <div className="row"><span className="muted">لا توجد عملات</span></div>}
            </div>
          </>
        )}
      </div>
    </>
  )
}
