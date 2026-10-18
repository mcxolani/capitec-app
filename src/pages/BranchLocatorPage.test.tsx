import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockGeolocation } from '@/test/geolocation'
import type { Branch } from '@/types/branch'

// the map itself needs a real browser and API key, so stub it out
vi.mock('@vis.gl/react-google-maps', () => ({
  APIProvider: ({ children }: { children: ReactNode }) => children,
  useMapsLibrary: () => null,
}))
vi.mock('@/components/branch-locator/BranchMap', () => ({ default: () => null }))
vi.mock('@/api/branchApi', () => ({ fetchBranches: vi.fn() }))

const branch = (id: string, name: string, lat: number, lng: number): Branch => ({
  id,
  name,
  address: `${name} address`,
  position: { lat, lng },
  hours: 'Mon–Fri 08:30–16:30',
})

const BRANCHES = [
  branch('va-waterfront', 'V&A Waterfront', -33.9036, 18.4207),
  branch('cape-town-cbd', 'Cape Town CBD', -33.9221, 18.4196),
  branch('sandton-city', 'Sandton City', -26.1076, 28.0567),
  branch('umhlanga', 'Umhlanga', -29.7276, 31.0663),
  branch('durban-cbd', 'Durban CBD', -29.858, 31.023),
]

// API_KEY is read when the module loads, so import it fresh after setting env
const renderPage = async () => {
  vi.resetModules()
  const { fetchBranches } = await import('@/api/branchApi')
  vi.mocked(fetchBranches).mockResolvedValue(BRANCHES)
  const { default: BranchLocatorPage } = await import('./BranchLocatorPage')
  render(<BranchLocatorPage />)
}

describe('BranchLocatorPage', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', 'test-key')
  })

  it('shows a friendly message in production when the API key is missing', async () => {
    vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', '')
    vi.stubEnv('DEV', false)
    await renderPage()

    expect(screen.getByRole('alert')).toHaveTextContent(/unavailable right now/i)
    expect(screen.getByRole('alert')).not.toHaveTextContent('VITE_')
  })

  it('prompts for a location first', async () => {
    await renderPage()
    expect(screen.getByText(/search for an address or use your location/i)).toBeInTheDocument()
  })

  it('lists the nearest branches after using the current location', async () => {
    mockGeolocation({ lat: -33.9036, lng: 18.4207 }) // V&A Waterfront
    await renderPage()

    await userEvent.click(screen.getByRole('button', { name: 'Use my location' }))

    const items = await screen.findAllByRole('listitem')
    expect(within(items[0]).getByText('V&A Waterfront')).toBeInTheDocument()
    expect(screen.getByText(/branches within 10 km/)).toBeInTheDocument()
    expect(screen.queryByText('Sandton City')).not.toBeInTheDocument()
  })

  it('updates the results when the radius changes', async () => {
    mockGeolocation({ lat: -29.7276, lng: 31.0663 }) // Umhlanga
    await renderPage()
    await userEvent.click(screen.getByRole('button', { name: 'Use my location' }))
    const atTen = (await screen.findAllByRole('listitem')).length

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Radius' }), '50 km')

    expect(screen.getAllByRole('listitem').length).toBeGreaterThan(atTen)
    expect(screen.getByText(/within 50 km/)).toBeInTheDocument()
  })
})
