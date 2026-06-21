import React, { useState, useCallback } from 'react'
import { isConfigured } from './api.js'
import { lockEnabled } from './lock.js'
import BottomNav from './components/BottomNav.jsx'
import Home from './screens/Home.jsx'
import Portfolio from './screens/Portfolio.jsx'
import Zakat from './screens/Zakat.jsx'
import Reports from './screens/Reports.jsx'
import More from './screens/More.jsx'
import Lock from './screens/Lock.jsx'
import Onboarding from './screens/Onboarding.jsx'
import Add from './screens/add/Add.jsx'

export default function App() {
  const [configured, setConfigured] = useState(isConfigured())
  const [locked, setLocked] = useState(lockEnabled())
  const [tab, setTab] = useState('home')
  const [addOpen, setAddOpen] = useState(false)
  const [dataKey, setDataKey] = useState(0)
  const [toast, setToast] = useState('')

  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }, [])

  if (!configured) {
    return <Onboarding onDone={() => { setConfigured(true); setLocked(lockEnabled()) }} />
  }

  if (locked) {
    return <Lock onUnlock={() => setLocked(false)} />
  }

  if (addOpen) {
    return <Add showToast={showToast} onClose={() => { setAddOpen(false); setDataKey((k) => k + 1) }} />
  }

  return (
    <div className="app">
      {tab === 'home' && <Home key={dataKey} showToast={showToast} />}
      {tab === 'portfolio' && <Portfolio key={dataKey} showToast={showToast} />}
      {tab === 'zakat' && <Zakat key={dataKey} showToast={showToast} />}
      {tab === 'reports' && <Reports key={dataKey} showToast={showToast} />}
      {tab === 'more' && <More showToast={showToast} setTab={setTab} onReset={() => setConfigured(false)} />}

      <BottomNav tab={tab} setTab={setTab} onAdd={() => setAddOpen(true)} />
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
