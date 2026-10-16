import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchBranches } from '@/api/branchApi'
import type { Branch, Origin } from '@/types/branch'
import { useNearbyBranches } from './useNearbyBranches'

vi.mock('@/api/branchApi', () => ({ fetchBranches: vi.fn() }))

const branch = (id: string, lat: number, lng: number): Branch => ({
  id,
  name: id,
  address: `${id} address`,
  position: { lat, lng },
  hours: 'Mon–Fri',
})

// ~1.1 km per 0.01° of latitude
const ORIGIN: Origin = { position: { lat: -26, lng: 28 }, label: 'Origin' }
const BRANCHES = [branch('far', -26.2, 28), branch('near', -26.01, 28), branch('mid', -26.05, 28)]

describe('useNearbyBranches', () => {
  beforeEach(() => {
    vi.mocked(fetchBranches).mockResolvedValue(BRANCHES)
  })

  it('returns no results until there is an origin', async () => {
    const { result } = renderHook(() => useNearbyBranches(null, 50))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.results).toEqual([])
  })

  it('returns branches within the radius, nearest first, with their distance', async () => {
    const { result } = renderHook(() => useNearbyBranches(ORIGIN, 10))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.results.map((b) => b.id)).toEqual(['near', 'mid'])
    expect(result.current.results[0].distanceKm).toBeCloseTo(1.1, 1)
  })

  it('recalculates when the radius changes without refetching', async () => {
    const { result, rerender } = renderHook(({ radius }) => useNearbyBranches(ORIGIN, radius), {
      initialProps: { radius: 10 },
    })
    await waitFor(() => expect(result.current.results).toHaveLength(2))

    rerender({ radius: 50 })

    expect(result.current.results.map((b) => b.id)).toEqual(['near', 'mid', 'far'])
    expect(fetchBranches).toHaveBeenCalledTimes(1)
  })

  it('reports an error when branches fail to load', async () => {
    vi.mocked(fetchBranches).mockRejectedValue(new Error('network'))
    const { result } = renderHook(() => useNearbyBranches(ORIGIN, 10))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('Could not load branches.')
    expect(result.current.results).toEqual([])
  })
})
