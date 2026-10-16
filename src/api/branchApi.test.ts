import { describe, expect, it, vi } from 'vitest'
import { fetchBranches } from './branchApi'

// rough bounding box around South Africa
const SA = { minLat: -35, maxLat: -22, minLng: 16, maxLng: 33 }

describe('fetchBranches', () => {
  it('resolves after a simulated network delay', async () => {
    vi.useFakeTimers()
    const promise = fetchBranches()
    await vi.advanceTimersByTimeAsync(300)
    await expect(promise).resolves.not.toHaveLength(0)
    vi.useRealTimers()
  })

  it('returns branches with unique ids and positions inside South Africa', async () => {
    const branches = await fetchBranches()

    expect(new Set(branches.map((b) => b.id)).size).toBe(branches.length)
    for (const { name, position } of branches) {
      expect(position.lat, name).toBeGreaterThan(SA.minLat)
      expect(position.lat, name).toBeLessThan(SA.maxLat)
      expect(position.lng, name).toBeGreaterThan(SA.minLng)
      expect(position.lng, name).toBeLessThan(SA.maxLng)
    }
  })

  it('covers Gauteng, Cape Town and Durban', async () => {
    const ids = (await fetchBranches()).map((b) => b.id)
    expect(ids).toEqual(expect.arrayContaining(['sandton-city', 'va-waterfront', 'umhlanga']))
  })
})
