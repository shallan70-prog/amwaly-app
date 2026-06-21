import React from 'react'

function Icon({ name }) {
  const common = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (name) {
    case 'home': return <svg {...common}><path d="M3 10l9-7 9 7" /><path d="M5 9v11h14V9" /></svg>
    case 'coin': return <svg {...common}><path d="M12 2.5v19" /><path d="M16.5 6.5H10a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6H7" /></svg>
    case 'moon': return <svg {...common}><path d="M20 14a8 8 0 1 1-9.9-9.9A6 6 0 0 0 20 14z" /></svg>
    case 'more': return <svg {...common}><circle cx="5" cy="12" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="19" cy="12" r="1.4" /></svg>
    default: return null
  }
}

export default function BottomNav({ tab, setTab, onAdd }) {
  const item = (id, icon, label) => {
    const active = tab === id || (id === 'more' && tab === 'reports')
    return (
      <button className={active ? 'active' : ''} onClick={() => setTab(id)}>
        <span className="icon"><Icon name={icon} /></span>
        <span>{label}</span>
      </button>
    )
  }

  return (
    <nav className="nav">
      {item('home', 'home', 'الرئيسية')}
      {item('portfolio', 'coin', 'المحفظة')}
      <button onClick={onAdd} aria-label="إضافة">
        <span className="add">+</span>
        <span>إضافة</span>
      </button>
      {item('zakat', 'moon', 'الزكاة')}
      {item('more', 'more', 'المزيد')}
    </nav>
  )
}
