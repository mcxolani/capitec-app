import { APIProvider } from '@vis.gl/react-google-maps'
import BranchMap from '@/components/branch-locator/BranchMap'
import '@/components/branch-locator/branch-locator.css'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

export default function BranchLocatorPage() {
  if (!API_KEY) {
    return <p role="alert">Missing VITE_GOOGLE_MAPS_API_KEY. Add it to .env.local and restart.</p>
  }

  return (
    <section className="locator">
      <h1>Branch Locator</h1>
      <APIProvider apiKey={API_KEY}>
        <BranchMap />
      </APIProvider>
    </section>
  )
}