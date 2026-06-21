import { useState, useEffect, useCallback, useRef } from 'react'
import { getCached, setCached } from './cache.js'

// Shows cached data instantly, then revalidates in the background only if the
// cache is older than STALE_MS. Makes tab navigation feel instant.
const STALE_MS = 30000

export function useCachedLoader(key, fetchFn) {
  const fnRef = useRef(fetchFn)
  fnRef.current = fetchFn

  const initial = getCached(key)
  const [data, setData] = useState(initial ? initial.data : null)
  const [loading, setLoading] = useState(!initial)
  const [error, setError] = useState('')

  const run = useCallback(async (force) => {
    const cached = getCached(key)
    if (!force && cached && Date.now() - cached.ts < STALE_MS) {
      setData(cached.data)
      setLoading(false)
      return
    }
    if (!cached) setLoading(true)
    try {
      const fresh = await fnRef.current()
      setCached(key, fresh)
      setData(fresh)
      setError('')
    } catch (e) {
      if (!getCached(key)) setError(e.message || 'error')
    } finally {
      setLoading(false)
    }
  }, [key])

  useEffect(() => { run(false) }, [run])

  return {
    data,
    loading,
    error,
    reload: () => run(true),
    mutate: (d) => { setCached(key, d); setData(d) }
  }
}
