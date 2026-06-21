import React, { useState, useEffect } from 'react'
import { api } from '../api.js'
import {
  lockEnabled, hasPin, setPin, clearLock,
  biometricSupported, biometricEnabled, registerBiometric
} from '../lock.js'

export default function More({ showToast, onReset, setTab }) {
  const [pinInput, setPinInput] = useState('')
  const [bioOk, setBioOk] = useState(false)
  const [, force] = useState(0)

  useEffect(() => { biometricSupported().then(setBioOk) }, [])

  const fullRefresh = async () => {
    showToast('بيحدّث كل البيانات...')
    try { await api.refresh(); showToast('تم التحديث الكامل') }
    catch (e) { showToast('فشل: ' + e.message) }
  }

  const savePin = () => {
    if (!/^\d{4,6}$/.test(pinInput)) { showToast('الرقم 4 لـ 6 أرقام'); return }
    setPin(pinInput); setPinInput(''); force((n) => n + 1)
    showToast('تم تفعيل القفل')
  }

  const enableBio = async () => {
    if (!hasPin()) { showToast('عيّن رقم PIN أولًا'); return }
    try { await registerBiometric(); force((n) => n + 1); showToast('تم تفعيل البصمة') }
    catch (e) { showToast('تعذّر تفعيل البصمة') }
  }

  const disable = () => { clearLock(); force((n) => n + 1); showToast('تم إلغاء القفل') }

  return (
    <>
      <div className="topbar"><h1>المزيد</h1></div>
      <div className="content">
        <button className="btn primary block" onClick={fullRefresh}>↻ تحديث كل البيانات</button>
        <button className="btn block" onClick={() => setTab('reports')}>📊 التقارير</button>

        <div className="card" style={{ marginTop: 14 }}>
          <div className="section-title">قفل التطبيق</div>
          <div className="row">
            <span>الحالة</span>
            <span className={lockEnabled() ? 'pos' : 'muted'}>{lockEnabled() ? 'مفعّل' : 'غير مفعّل'}</span>
          </div>
          {!hasPin() ? (
            <>
              <label className="field">رقم PIN (4 لـ 6 أرقام)</label>
              <input className="input" inputMode="numeric" maxLength={6} value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))} placeholder="••••" />
              <button className="btn" onClick={savePin}>تفعيل القفل برقم</button>
            </>
          ) : (
            <>
              <div className="row">
                <span>البصمة</span>
                <span className={biometricEnabled() ? 'pos' : 'muted'}>
                  {biometricEnabled() ? 'مفعّلة' : bioOk ? 'متاحة' : 'غير مدعومة'}
                </span>
              </div>
              {bioOk && !biometricEnabled() && (
                <button className="btn block" onClick={enableBio}>تفعيل فتح بالبصمة</button>
              )}
              <button className="btn block" onClick={disable}>إلغاء القفل</button>
            </>
          )}
        </div>

        <div className="card">
          <div className="section-title">الاتصال</div>
          <button className="btn" onClick={() => { onReset() }}>تغيير الرابط / المفتاح</button>
        </div>

        <div className="muted" style={{ textAlign: 'center', fontSize: 11, marginTop: 8 }}>أموالى · إصدار 0.1</div>
      </div>
    </>
  )
}
