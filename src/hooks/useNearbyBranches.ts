import { useEffect, useMemo, useState } from 'react'
import { fetchBranches } from '@/api/branchApi'
import { distanceKm } from '@/utils/distance'
import type { Branch, BranchWithDistance, Origin } from '@/types/branch'

export function useNearbyBranches(origin: Origin | null, radiusKm: number) {
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchBranches()
      .then((data) => {
        if (!cancelled) setBranches(data)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load branches.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const results = useMemo<BranchWithDistance[]>(() => {
    if (!origin) return []
    return branches
      .map((b) => ({ ...b, distanceKm: distanceKm(origin.position, b.position) }))
      .filter((b) => b.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm)
  }, [branches, origin, radiusKm])

  return { results, loading, error }
}
