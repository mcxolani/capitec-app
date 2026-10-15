import { useCallback, useState } from 'react'
import type { LatLng } from '@/types/branch'

export function useGeolocation() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const locate = useCallback(async (): Promise<LatLng | null> => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by your browser.')
      return null
    }

    setLoading(true)
    setError(null)
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        }),
      )
      return { lat: pos.coords.latitude, lng: pos.coords.longitude }
    } catch (e) {
      const err = e as GeolocationPositionError
      setError(
        err.code === err.PERMISSION_DENIED
          ? 'Location permission denied. Allow it in your browser or search for an address.'
          : 'Could not get your location. Try again or search for an address.',
      )
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { locate, loading, error }
}
