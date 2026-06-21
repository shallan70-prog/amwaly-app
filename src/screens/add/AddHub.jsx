import React from 'react'
import { linkStyle } from './ui.jsx'

const ITEMS = [
  { id: 'transaction', title: 'معاملة', sub: 'دخل / مصروف / تحويل' },
  { id: 'investment', title: 'صفقة استثمار', sub: 'شراء / بيع كريبتو' },
  { id: 'trade', title: 'صفقة تداول', sub: 'دخول بستوب وهدف' },
  { id: 'closeTrade', title: 'إغلاق صفقة', sub: 'بالمتوسط المرجّح' },
  { id: 'zakat', title: 'زكاة', sub: 'دفعة تُضاف للمدفوع مقدّمًا' },
  { id: 'entryPlan', title: 'خطة دخول', sub: 'تخطيط عملة جديدة' }
]

export default function AddHub({ onPick, onClose }) {
  return (
    <>
      <div className="topbar">
        <h1>إضافة</h1>
        <button onClick={onClose} style={linkStyle}>إغلاق</button>
      </div>
      <div className="content">
        <div className="card">
          {ITEMS.map((it) => (
            <div className="row" key={it.id} onClick={() => onPick(it.id)} style={{ cursor: 'pointer', padding: '14px 4px' }}>
              <div>
                <div className="sym">{it.title}</div>
                <div className="muted" style={{ fontSize: 12 }}>{it.sub}</div>
              </div>
              <span style={{ color: 'var(--text-3)', fontSize: 20 }}>‹</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
