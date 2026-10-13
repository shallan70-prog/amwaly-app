import React, { useState, useCallback, useEffect } from 'react'
import { isConfigured } from './api.js'
import {
  lockEnabled, isSessionUnlocked, markUnlocked,
  noteHidden, notePageHide, consumeLeaveOnResume, consumeLeaveOnStartup
} from './lock.js'
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
  const [locked, setLocked] = useState(() => {
    consumeLeaveOnStartup()
    return lockEnabled() && !isSessionUnlocked()
  })
  const [lockKey, setLockKey] = useState(0)
  const [tab, setTab] = useState('home')
  const [addOpen, setAddOpen] = useState(false)
  const [dataKey, setDataKey] = useState(0)
  const [toast, setToast] = useState('')

  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }, [])

  // Lock every time the app is left and returned to, but not on an in-app refresh.
  // Leaving is detected from timestamps written at hide time (see lock.js). Bumping
  // lockKey remounts the Lock screen so the fingerprint prompt opens again even when
  // the user left from the Lock screen itself.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        noteHidden()
      } else if (consumeLeaveOnResume() && lockEnabled()) {
        setLocked(true)
        setLockKey((k) => k + 1)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', notePageHide)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', notePageHide)
    }
  }, [])

  if (!configured) {
    return <Onboarding onDone={() => { setConfigured(true); setLocked(lockEnabled()) }} />
  }

  if (locked) {
    return <Lock key={lockKey} onUnlock={() => { markUnlocked(); setLocked(false) }} />
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
