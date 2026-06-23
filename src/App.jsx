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

  // Lock again when the app is backgrounded and returns — but NOT on a plain
  // refresh. Trick: a real backgrounding keeps the page alive, so a short timer
  // fires and clears the session-unlock flag (survives even if Android reloads
  // the page on return). A page reload instead fires `pagehide` first, which
  // cancels the timer, so a refresh stays unlocked. `authBusy` skips the
  // biometric dialog's own hide/show so it doesn't loop.
  useEffect(() => {
    let hideTimer = 0
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        clearTimeout(hideTimer)
        hideTimer = setTimeout(() => { if (!authBusy()) clearSessionUnlock() }, 150)
      } else {
        clearTimeout(hideTimer)
        if (lockEnabled() && !authBusy() && !isSessionUnlocked()) setLocked(true)
      }
    }
    const onPageHide = () => clearTimeout(hideTimer)
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', onPageHide)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', onPageHide)
      clearTimeout(hideTimer)
    }
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
