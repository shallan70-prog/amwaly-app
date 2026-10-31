import React from 'react'

// Old numbers must never look current: shown whenever a refresh failed behind cached data.
export default function StaleBanner({ error }) {
  if (!error) return null

  return (
    <div className="banner" role="alert">
      {error === 'unauthorized'
        ? 'المفتاح غير صحيح، والأرقام دى آخر نسخة محفوظة. حدّثه من المزيد ← تغيير الرابط / المفتاح'
        : 'تعذّر الاتصال، والأرقام دى آخر نسخة محفوظة'}
    </div>
  )
}
