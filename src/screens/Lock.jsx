import React, { useState, useEffect, useCallback } from 'react'
import { verifyPin, biometricEnabled, verifyBiometric } from '../lock.js'

export default function Lock({ onUnlock }) {
  const [pin, setPinVal] = useState('')
  const [err, setErr] = useState(false)

  const tryBio = useCallback(async () => {
    if (!biometricEnabled()) return
    try { await verifyBiometric(); onUnlock() } catch (e) { /* fall back to PIN */ }
  }, [onUnlock])

  useEffect(() => { tryBio() }, [tryBio])

  const press = (d) => {
    setErr(false)
    const next = (pin + d).slice(0, 6)
    setPinVal(next)
    if (next.length >= 4 && verifyPin(next)) onUnlock()
  }
  const back = () => { setErr(false); setPinVal(pin.slice(0, -1)) }
  const check = () => { if (verifyPin(pin)) onUnlock(); else { setErr(true); setPinVal('') } }

  return (
    <div className="app">
      <div className="center-screen">
        <div className="big-icon">🔒</div>
        <h2 style={{ margin: 0 }}>أموالى</h2>
        <div className="muted">ادخل الرقم السرّى</div>

        <div className="pin-dots">
          {[0, 1, 2, 3, 4, 5].slice(0, Math.max(4, pin.length || 4)).map((i) => (
            <span key={i} className={'pin-dot' + (i < pin.length ? ' on' : '')} />
          ))}
        </div>
        {err && <div className="neg" style={{ marginTop: -10 }}>رقم غير صحيح</div>}

        <div className="keypad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button key={n} onClick={() => press(String(n))}>{n}</button>
          ))}
          <button onClick={back}>⌫</button>
          <button onClick={() => press('0')}>0</button>
          <button onClick={check}>✓</button>
        </div>

        {biometricEnabled() && (
          <button className="btn" style={{ width: 200, marginTop: 18 }} onClick={tryBio}>افتح بالبصمة</button>
        )}
      </div>
    </div>
  )
}
