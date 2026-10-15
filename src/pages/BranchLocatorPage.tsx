
import { useState } from 'react'
import PlaceSearch from '@/components/branch-locator/PlaceSearch'
import type { Origin } from '@/types/branch'


import { APIProvider } from '@vis.gl/react-google-maps'
import BranchMap from '@/components/branch-locator/BranchMap'
import '@/components/branch-locator/branch-locator.css'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

export default function BranchLocatorPage() {
  const [origin, setOrigin] = useState<Origin | null>(null)
  const [query, setQuery] = useState('')
  const radiusKm = 10

  const handleOrigin = (next: Origin) => {
    setOrigin(next)
    setQuery(next.label)
  }

  if (!API_KEY) {
    return <p role="alert">Missing VITE_GOOGLE_MAPS_API_KEY. Add it to .env.local and restart.</p>
  }

  return (
    <section className="locator">
      <h1>Branch Locator</h1>
      <APIProvider apiKey={API_KEY}>
        <div className="locator__controls">
          <PlaceSearch value={query} onValueChange={setQuery} onSelect={handleOrigin} />
        </div>
        <BranchMap origin={origin} radiusKm={radiusKm} />
      </APIProvider>
    </section>
  )
}
