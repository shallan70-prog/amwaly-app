import React, { useState, useCallback, useEffect } from 'react'
import { isConfigured } from './api.js'
import { lockEnabled, isSessionUnlocked, markUnlocked, clearSessionUnlock, authBusy } from './lock.js'
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
  const [locked, setLocked] = useState(() => lockEnabled() && !isSessionUnlocked())
  const [tab, setTab] = useState('home')
  const [addOpen, setAddOpen] = useState(false)
  const [dataKey, setDataKey] = useState(0)
  const [toast, setToast] = useState('')

  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }, [])

  // Re-lock whenever the app was backgrounded and comes back — but NOT on a
  // plain page refresh (the session-unlocked flag survives a reload), and not
  // because of the biometric dialog itself (authBusy guards the loop).
  useEffect(() => {
    let wasHidden = false
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        wasHidden = true
      } else {
        if (wasHidden && lockEnabled() && !authBusy()) {
          clearSessionUnlock()
          setLocked(true)
        }
        wasHidden = false
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  if (!configured) {
    return <Onboarding onDone={() => { setConfigured(true); setLocked(lockEnabled()) }} />
  }

  if (locked) {
    return <Lock onUnlock={() => { markUnlocked(); setLocked(false) }} />
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
