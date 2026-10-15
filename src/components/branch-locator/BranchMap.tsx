import { Map as GoogleMap } from '@vis.gl/react-google-maps'

const JOHANNESBURG = { lat: -26.2041, lng: 28.0473 }
const MAP_ID = import.meta.env.VITE_GOOGLE_MAP_ID

export default function BranchMap() {
  return (
    <GoogleMap
      mapId={MAP_ID}
      defaultCenter={JOHANNESBURG}
      defaultZoom={10}
      gestureHandling="greedy"
      className="branch-map"
    />
  )
}