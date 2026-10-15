import { useEffect } from 'react'
import { useMap } from '@vis.gl/react-google-maps'
import type { LatLng } from '@/types/branch'

interface Props {
  center: LatLng
  radiusKm: number
}

export default function RadiusCircle({ center, radiusKm }: Props) {
  const map = useMap()

  useEffect(() => {
    if (!map) return

    const circle = new google.maps.Circle({
      map,
      center,
      radius: radiusKm * 1000,
      strokeColor: '#0b3d91',
      strokeOpacity: 0.8,
      strokeWeight: 1,
      fillColor: '#0b3d91',
      fillOpacity: 0.08,
      clickable: false,
    })

    const bounds = circle.getBounds()
    if (bounds) map.fitBounds(bounds, 24)

    return () => circle.setMap(null)
  }, [map, center, radiusKm])

  return null
}
