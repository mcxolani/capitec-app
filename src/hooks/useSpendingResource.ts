import { useEffect, useState } from 'react'

export function useSpendingResource<T>(loader: () => Promise<T>) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<{
    data?: T
    error?: string
    loading: boolean
  }>({ loading: true })

  useEffect(() => {
    let cancelled = false
    async function load() {
      setResult({ loading: true })
      try {
        const data = await loader()
        if (!cancelled) setResult({ data, loading: false })
      } catch {
        if (!cancelled) {
          setResult({ error: 'This section couldn’t load. Please try again.', loading: false })
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [loader, attempt])

  return {
    ...result,
    retry: () => setAttempt((value) => value + 1),
  }
}
