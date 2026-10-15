import { AdvancedMarker, Map as GoogleMap } from '@vis.gl/react-google-maps'
import RadiusCircle from './RadiusCircle'
import type { Origin } from '@/types/branch'

const JOHANNESBURG = { lat: -26.2041, lng: 28.0473 }
const MAP_ID = import.meta.env.VITE_GOOGLE_MAP_ID

interface Props {
  origin: Origin | null
  radiusKm: number
}

export default function BranchMap({ origin, radiusKm }: Props) {
  return (
    <GoogleMap
      mapId={MAP_ID}
      defaultCenter={JOHANNESBURG}
      defaultZoom={10}
      gestureHandling="greedy"
      className="branch-map"
    >
      {origin && (
        <>
          <RadiusCircle center={origin.position} radiusKm={radiusKm} />
          <AdvancedMarker position={origin.position} title={origin.label}>
            <div className="origin-dot" />
          </AdvancedMarker>
        </>
      )}
    </GoogleMap>
  )
}