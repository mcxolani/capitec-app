import { AdvancedMarker, Map as GoogleMap, Pin } from '@vis.gl/react-google-maps'
import RadiusCircle from './RadiusCircle'
import type { BranchWithDistance, Origin } from '@/types/branch'

const JOHANNESBURG = { lat: -26.2041, lng: 28.0473 }
const MAP_ID = import.meta.env.VITE_GOOGLE_MAP_ID

interface Props {
  origin: Origin | null
  radiusKm: number
  branches: BranchWithDistance[]
}

export default function BranchMap({ branches, origin, radiusKm }: Props) {
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
          {branches.map((b) => (
            <AdvancedMarker key={b.id} position={b.position} title={b.name}>
              <Pin background="#0b3d91" borderColor="#fff" glyphColor="#fff" />
            </AdvancedMarker>
          ))}
        </>
      )}
    </GoogleMap>
  )
}
