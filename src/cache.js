// Simple stale-while-revalidate cache: in-memory + localStorage.
const mem = {}

export function getCached(key) {
  if (mem[key]) return mem[key]
  try {
    const raw = localStorage.getItem('cache_' + key)
    if (raw) {
      mem[key] = JSON.parse(raw)
      return mem[key]
    }
  } catch (e) { /* ignore */ }
  return null
}

export function setCached(key, data) {
  const entry = { data, ts: Date.now() }
  mem[key] = entry
  try { localStorage.setItem('cache_' + key, JSON.stringify(entry)) } catch (e) { /* ignore */ }
  return entry
}

export function invalidate(keys) {
  keys.forEach((k) => {
    delete mem[k]
    try { localStorage.removeItem('cache_' + k) } catch (e) { /* ignore */ }
  })
}
