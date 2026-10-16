import { describe, expect, it } from 'vitest'
import { directionsUrl } from './maps'

describe('directionsUrl', () => {
  it('builds a Google Maps driving directions link to the destination', () => {
    const url = new URL(directionsUrl({ lat: -33.9036, lng: 18.4207 }))

    expect(url.origin + url.pathname).toBe('https://www.google.com/maps/dir/')
    expect(url.searchParams.get('api')).toBe('1')
    expect(url.searchParams.get('destination')).toBe('-33.9036,18.4207')
    expect(url.searchParams.get('travelmode')).toBe('driving')
    expect(url.searchParams.has('origin')).toBe(false)
  })
})
