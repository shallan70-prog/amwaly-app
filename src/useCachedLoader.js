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
  // A failed refresh while old data is on screen: shown as a warning, never hidden.
  const [staleError, setStaleError] = useState('')

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
      setStaleError('')
    } catch (e) {
      if (getCached(key)) setStaleError(e.message || 'error')
      else setError(e.message || 'error')
    } finally {
      setLoading(false)
    }
  }, [key])

  useEffect(() => { run(false) }, [run])

  return {
    data,
    loading,
    error,
    staleError,
    reload: () => run(true),
    mutate: (d) => { setCached(key, d); setData(d); setStaleError('') }
  }
}
