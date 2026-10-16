import { vi } from 'vitest'

const PERMISSION_DENIED = 1
const POSITION_UNAVAILABLE = 2

type Outcome = { lat: number; lng: number } | 'denied' | 'unavailable'

// Replaces navigator.geolocation with a stub that succeeds or fails as requested
export function mockGeolocation(outcome: Outcome) {
  const getCurrentPosition = vi.fn(
    (success: PositionCallback, failure?: PositionErrorCallback | null) => {
      if (typeof outcome === 'object') {
        success({
          coords: { latitude: outcome.lat, longitude: outcome.lng },
        } as GeolocationPosition)
        return
      }
      failure?.({
        code: outcome === 'denied' ? PERMISSION_DENIED : POSITION_UNAVAILABLE,
        PERMISSION_DENIED,
        POSITION_UNAVAILABLE,
        TIMEOUT: 3,
      } as GeolocationPositionError)
    },
  )
  vi.stubGlobal('navigator', { ...navigator, geolocation: { getCurrentPosition } })
  return getCurrentPosition
}
