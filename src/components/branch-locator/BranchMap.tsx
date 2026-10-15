import { useEffect } from 'react'
import { AdvancedMarker, Map as GoogleMap, Pin, useMap } from '@vis.gl/react-google-maps'
import RadiusCircle from './RadiusCircle'
import type { BranchWithDistance, LatLng, Origin } from '@/types/branch'

const JOHANNESBURG = { lat: -26.2041, lng: 28.0473 }
const MAP_ID = import.meta.env.VITE_GOOGLE_MAP_ID

interface Props {
  origin: Origin | null
  radiusKm: number
  branches: BranchWithDistance[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}

// must render inside <GoogleMap> so useMap() resolves
function PanToPosition({ position }: { position: LatLng | null }) {
  const map = useMap()

  useEffect(() => {
    if (map && position) map.panTo(position)
  }, [map, position])

  return null
}

export default function BranchMap({ origin, radiusKm, branches, selectedId, onSelect }: Props) {
  const selected = branches.find((b) => b.id === selectedId) ?? null

  return (
    <GoogleMap
      mapId={MAP_ID}
      defaultCenter={JOHANNESBURG}
      defaultZoom={10}
      gestureHandling="greedy"
      className="branch-map"
      onClick={() => onSelect(null)}
    >
      {origin && (
        <>
          <RadiusCircle center={origin.position} radiusKm={radiusKm} />
          <AdvancedMarker position={origin.position} title={origin.label}>
            <div className="origin-dot" />
          </AdvancedMarker>
        </>
      )}

      {branches.map((b) => {
        const isSelected = b.id === selectedId
        return (
          <AdvancedMarker
            key={b.id}
            position={b.position}
            title={b.name}
            zIndex={isSelected ? 10 : 1}
            onClick={() => onSelect(b.id)}
          >
            <Pin
              background={isSelected ? '#c62828' : '#0b3d91'}
              borderColor="#fff"
              glyphColor="#fff"
              scale={isSelected ? 1.3 : 1}
            />
          </AdvancedMarker>
        )
      })}

      <PanToPosition position={selected?.position ?? null} />
    </GoogleMap>
  )
}
