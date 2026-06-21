import React, { useState } from 'react'
import { api } from '../../api.js'
import { useCachedLoader } from '../../useCachedLoader.js'
import { invalidate } from '../../cache.js'
import AddHub from './AddHub.jsx'
import TransactionForm from './TransactionForm.jsx'
import InvestmentForm from './InvestmentForm.jsx'
import TradeForm from './TradeForm.jsx'
import CloseTradeForm from './CloseTradeForm.jsx'
import ZakatForm from './ZakatForm.jsx'
import EntryPlanForm from './EntryPlanForm.jsx'

export default function Add({ onClose, showToast }) {
  const [view, setView] = useState('hub')
  const { data, loading, error } = useCachedLoader('formOptions', () => api.formOptions())

  if (loading) {
    return <div className="app"><div className="spinner" /></div>
  }
  if (error) {
    return (
      <div className="app">
        <div className="content">
          <div className="card">تعذّر تحميل الخيارات: {error}</div>
          <button className="btn" onClick={onClose}>رجوع</button>
        </div>
      </div>
    )
  }

  const common = {
    opts: data,
    onBack: () => setView('hub'),
    onDone: () => { invalidate(['summary', 'portfolio', 'zakat']); showToast('تم الحفظ ✓'); onClose() }
  }

  return (
    <div className="app">
      {view === 'hub' && <AddHub onPick={setView} onClose={onClose} />}
      {view === 'transaction' && <TransactionForm {...common} />}
      {view === 'investment' && <InvestmentForm {...common} />}
      {view === 'trade' && <TradeForm {...common} />}
      {view === 'closeTrade' && <CloseTradeForm {...common} />}
      {view === 'zakat' && <ZakatForm {...common} />}
      {view === 'entryPlan' && <EntryPlanForm {...common} />}
    </div>
  )
}
