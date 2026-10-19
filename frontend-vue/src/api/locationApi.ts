import { request } from './request'
import type { Location } from '@/types/branch'

type GeocodingResult = {
  display_name: string
  lat: string
  lon: string
}

let lastLookupAt = 0

export async function findAddress(query: string): Promise<Location> {
  const wait = Math.max(0, 1000 - (Date.now() - lastLookupAt))
  if (wait) await new Promise((resolve) => setTimeout(resolve, wait))
  lastLookupAt = Date.now()

  const searchUrl = new URL(
    import.meta.env.VITE_GEOCODER_URL || 'https://nominatim.openstreetmap.org/search',
  )
  searchUrl.search = new URLSearchParams({ format: 'jsonv2', limit: '1', q: query }).toString()

  const results = await request<GeocodingResult[]>(searchUrl.toString())
  const match = results[0]

  if (!match) throw new Error('No matching address found.')

  return {
    label: match.display_name,
    position: { lat: Number(match.lat), lng: Number(match.lon) },
  }
}
