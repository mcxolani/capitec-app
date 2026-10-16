import { useState } from 'react'
import { APIProvider } from '@vis.gl/react-google-maps'
import BranchList from '@/components/branch-locator/BranchList'
import BranchMap from '@/components/branch-locator/BranchMap'
import PlaceSearch from '@/components/branch-locator/PlaceSearch'
import RadiusSelect from '@/components/branch-locator/RadiusSelect'
import UseMyLocation from '@/components/branch-locator/UseMyLocation'
import { useNearbyBranches } from '@/hooks/useNearbyBranches'
import type { Origin } from '@/types/branch'
import '@/components/branch-locator/branch-locator.css'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

export default function BranchLocatorPage() {
  const [origin, setOrigin] = useState<Origin | null>(null)
  const [query, setQuery] = useState('')
  const [radiusKm, setRadiusKm] = useState(10)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { results, loading, error } = useNearbyBranches(origin, radiusKm)
  const activeId = results.some((b) => b.id === selectedId) ? selectedId : null

  const handleOrigin = (next: Origin) => {
    setOrigin(next)
    setQuery(next.label)
    setSelectedId(null)
  }

  if (!API_KEY) {
    return (
      <p role="alert">
        {import.meta.env.DEV
          ? 'Missing VITE_GOOGLE_MAPS_API_KEY. Add it to .env.local and restart.'
          : 'The branch locator is unavailable right now. Please try again later.'}
      </p>
    )
  }

  return (
    <section className="locator">
      <h1>Branch Locator</h1>
      <APIProvider apiKey={API_KEY}>
        <div className="locator__controls">
          <PlaceSearch value={query} onValueChange={setQuery} onSelect={handleOrigin} />
          <UseMyLocation onLocated={handleOrigin} />
          <RadiusSelect value={radiusKm} onChange={setRadiusKm} />
        </div>

        {error && <p role="alert">{error}</p>}

        <div className="locator__body">
          <BranchList
            branches={results}
            selectedId={activeId}
            onSelect={setSelectedId}
            hasOrigin={origin !== null}
            loading={loading}
            radiusKm={radiusKm}
          />
          <BranchMap
            origin={origin}
            radiusKm={radiusKm}
            branches={results}
            selectedId={activeId}
            onSelect={setSelectedId}
          />
        </div>
      </APIProvider>
    </section>
  )
}
