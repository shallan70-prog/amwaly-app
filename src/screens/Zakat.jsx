import React from 'react'
import { api } from '../api.js'
import { useCachedLoader } from '../useCachedLoader.js'
import StaleBanner from '../components/StaleBanner.jsx'
import { money } from '../format.js'

const ASSET_NAMES = {
  'Total Fiat EGP': 'نقدية جنيه',
  'Total Fiat USD': 'نقدية دولار',
  'Total Fiat SAR': 'نقدية ريال',
  'Total Fiat AED': 'نقدية درهم',
  'Total Crypto': 'كريبتو',
  'Gold': 'ذهب',
  'Stocks': 'أسهم',
  'Debts Receivable': 'ديون ليا',
  'Debts Payable': 'ديون عليا'
}

export default function Zakat() {
  const { data, loading, error, staleError } = useCachedLoader('zakat', () => api.zakat())
  const hawls = (data && data.hawls) || []
  const open = hawls[hawls.length - 1]

  return (
    <>
      <div className="topbar"><h1>الزكاة</h1></div>
      <div className="content">
        {loading && <div className="spinner" />}
        {error && <div className="card">تعذّر التحميل: {error}</div>}
        <StaleBanner error={staleError} />
        {data && (
          <>
            <div className="hero warn">
              <div className="label">باقى الزكاة المستحقة</div>
              <div className="value tnums">{money(data.remainingEgp != null ? data.remainingEgp : data.totalDueEgp)} <span style={{ fontSize: 14 }}>EGP</span></div>
            </div>

            {open && (
              <div className="card">
                <div className="section-title">الحول الحالى {open.label}</div>
                <div className="row"><span>بدأ</span><span className="tnums">{open.start}</span></div>
                <div className="row"><span>يوم الزكاة (27 رمضان)</span><span className="tnums">{open.end}</span></div>
                <div className="row"><span>فاضل</span><span className="tnums">{data.daysLeft} يوم</span></div>
              </div>
            )}

            {data.nisabEgp != null && (
              <div className="card">
                <div className="section-title">النصاب</div>
                <div className="row"><span>إجمالى فلوسك</span><span className="tnums">{money(data.wealthEgp)}</span></div>
                <div className="row"><span>نصاب الفضة (595 جرام)</span><span className="tnums">{money(data.nisabEgp)}</span></div>
                <div className="row"><span>سعر جرام الفضة</span><span className="tnums">{money(data.silverGramEgp, 2)}</span></div>
                <div className="row"><span>الوضع</span><span className={data.belowNisab ? 'muted' : 'pos'}>{data.belowNisab ? 'أقل من النصاب' : 'وصلت النصاب'}</span></div>
              </div>
            )}

            <div className="card">
              <div className="row"><span>زكاة الحول الحالى (تقدير)</span><span className="tnums">{money(data.totalDueEgp)}</span></div>
              <div className="row"><span>المدفوع فى الحول الحالى</span><span className="tnums pos">− {money(data.advancePaidEgp)}</span></div>
              {data.oldRemainingEgp > 0 && (
                <div className="row"><span>متبقى من حول قديم</span><span className="tnums">{money(data.oldRemainingEgp)}</span></div>
              )}
              <div className="row"><span style={{ fontWeight: 500 }}>الباقى المستحق</span><span className="tnums" style={{ fontWeight: 600, color: 'var(--warning)' }}>{money(data.remainingEgp != null ? data.remainingEgp : data.totalDueEgp)}</span></div>
            </div>

            <div className="card">
              <div className="section-title">تفصيل الأصول</div>
              <div className="row" style={{ color: 'var(--text-3)', fontSize: 11 }}>
                <span>الأصل</span><span>بعد التحويل</span><span>الزكاة</span>
              </div>
              {data.rows
                .filter((r) => r.afterConversionEgp !== 0)
                .map((r, i) => (
                  <div className="row" key={i}>
                    <span>{ASSET_NAMES[r.asset] || r.asset}</span>
                    <span className="muted tnums">{money(r.afterConversionEgp)}</span>
                    <span className="tnums">{money(r.zakatEgp)}</span>
                  </div>
                ))}
            </div>

            {hawls.length > 0 && (
              <div className="card">
                <div className="section-title">سجل الزكاة كل سنة</div>
                <div className="row" style={{ color: 'var(--text-3)', fontSize: 11 }}>
                  <span>الحول</span><span>الزكاة</span><span>المدفوع</span><span>الحالة</span>
                </div>
                {hawls.slice().reverse().map((h) => (
                  <div className="row" key={h.label}>
                    <span className="tnums">{h.label}</span>
                    <span className="tnums">{money(h.due)}</span>
                    <span className="tnums">{money(h.paid)}</span>
                    <span className="muted">{h.status}</span>
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
