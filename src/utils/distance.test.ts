import { describe, expect, it } from 'vitest'
import { distanceKm, formatDistance } from './distance'

const JOHANNESBURG = { lat: -26.2041, lng: 28.0473 }
const CAPE_TOWN = { lat: -33.9249, lng: 18.4241 }

describe('distanceKm', () => {
  it('returns 0 for the same point', () => {
    expect(distanceKm(JOHANNESBURG, JOHANNESBURG)).toBe(0)
  })

  it('matches the known great-circle distance between Johannesburg and Cape Town', () => {
    expect(distanceKm(JOHANNESBURG, CAPE_TOWN)).toBeCloseTo(1263, -1)
  })

  it('is symmetric', () => {
    expect(distanceKm(JOHANNESBURG, CAPE_TOWN)).toBe(distanceKm(CAPE_TOWN, JOHANNESBURG))
  })
})

describe('formatDistance', () => {
  it.each([
    [0, '0 m'],
    [0.25, '250 m'],
    [0.9994, '999 m'],
    [0.9996, '1.0 km'],
    [1, '1.0 km'],
    [12.345, '12.3 km'],
  ])('formats %s km as %s', (km, expected) => {
    expect(formatDistance(km)).toBe(expected)
  })
})
