import type { LatLng } from '@/types/branch'

// Without an origin, Google Maps starts from the user's current location
export function directionsUrl(destination: LatLng): string {
  const params = new URLSearchParams({
    api: '1',
    destination: `${destination.lat},${destination.lng}`,
    travelmode: 'driving',
  })
  return `https://www.google.com/maps/dir/?${params.toString()}`
}
