import React, { useState } from 'react'
import { api } from '../api.js'
import { useLoader } from '../useLoader.js'

const REPORTS = [
  { id: 'Monthly Cash Flow', name: 'التدفّق الشهرى' },
  { id: 'Investment Profit Stats', name: 'أرباح الاستثمار' },
  { id: 'Trading Stats', name: 'إحصائيات التداول' },
  { id: 'Closed Trades by Period', name: 'الصفقات المغلقة' }
]

export default function Reports() {
  const [sel, setSel] = useState(REPORTS[0].id)
  const { data, loading, error } = useLoader(() => api.report(sel), [sel])
  const report = data && data.report

  return (
    <>
      <div className="topbar"><h1>التقارير</h1></div>
      <div className="content">
        <select className="input" value={sel} onChange={(e) => setSel(e.target.value)}>
          {REPORTS.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>

        {loading && <div className="spinner" />}
        {error && <div className="card">تعذّر التحميل: {error}</div>}
        {report && (
          <div className="card" style={{ overflowX: 'auto', padding: '8px 10px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, whiteSpace: 'nowrap' }}>
              <thead>
                <tr>
                  {report.headers.map((h, i) => (
                    <th key={i} style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--text-2)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="tnums" style={{ padding: '6px 8px', borderBottom: '0.5px solid var(--border)' }}>{String(cell)}</td>
                    ))}
                  </tr>
                ))}
                {(report.summaryRows || []).map((row, ri) => (
                  <tr key={'s' + ri} style={{ fontWeight: 600 }}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="tnums" style={{ padding: '6px 8px' }}>{String(cell)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {report.rows.length === 0 && <div className="muted" style={{ padding: 8 }}>لا توجد بيانات للفترة.</div>}
          </div>
        )}
      </div>
    </>
  )
}
