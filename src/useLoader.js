import { useState, useEffect, useCallback } from 'react'

export function useLoader(fn, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setData(await fn())
    } catch (e) {
      setError(e.message || 'error')
    } finally {
      setLoading(false)
    }
  }, deps)

  useEffect(() => { load() }, [load])

  return { data, loading, error, reload: load }
}
