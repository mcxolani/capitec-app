import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useMapsLibrary } from '@vis.gl/react-google-maps'
import type { Origin } from '@/types/branch'
import PlaceSearch from './PlaceSearch'

vi.mock('@vis.gl/react-google-maps', () => ({ useMapsLibrary: vi.fn() }))

const fetchFields = vi.fn()
const fetchAutocompleteSuggestions = vi.fn()

const prediction = (placeId: string, text: string, location = { lat: -26.1, lng: 28.05 }) => ({
  placePrediction: {
    placeId,
    text: { toString: () => text },
    toPlace: () => ({
      fetchFields,
      location: { lat: () => location.lat, lng: () => location.lng },
      formattedAddress: `${text}, South Africa`,
    }),
  },
})

const fakePlaces = {
  AutocompleteSessionToken: class {},
  AutocompleteSuggestion: { fetchAutocompleteSuggestions },
}

// PlaceSearch is controlled, so give it a parent that owns the value
function Harness({ onSelect }: { onSelect: (origin: Origin) => void }) {
  const [value, setValue] = useState('')
  return <PlaceSearch value={value} onValueChange={setValue} onSelect={onSelect} />
}

const input = () => screen.getByRole('combobox', { name: 'Search for an address' })

describe('PlaceSearch', () => {
  beforeEach(() => {
    vi.mocked(useMapsLibrary).mockReturnValue(
      fakePlaces as unknown as ReturnType<typeof useMapsLibrary>,
    )
    fetchFields.mockResolvedValue(undefined)
    fetchAutocompleteSuggestions.mockResolvedValue({
      suggestions: [
        prediction('p1', 'Sandton, Johannesburg'),
        prediction('p2', 'Sandringham, Johannesburg', { lat: -26.15, lng: 28.11 }),
        { placePrediction: null },
      ],
    })
  })

  it('is disabled until the Places library has loaded', () => {
    vi.mocked(useMapsLibrary).mockReturnValue(null)
    render(<Harness onSelect={vi.fn()} />)
    expect(input()).toBeDisabled()
  })

  it('waits for at least 3 characters before searching', async () => {
    render(<Harness onSelect={vi.fn()} />)

    await userEvent.type(input(), 'Sa')
    await new Promise((r) => setTimeout(r, 300))

    expect(fetchAutocompleteSuggestions).not.toHaveBeenCalled()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('shows South African suggestions as the user types', async () => {
    render(<Harness onSelect={vi.fn()} />)

    await userEvent.type(input(), 'San')

    expect(await screen.findAllByRole('option')).toHaveLength(2)
    expect(fetchAutocompleteSuggestions).toHaveBeenCalledWith(
      expect.objectContaining({ input: 'San', includedRegionCodes: ['za'] }),
    )
    expect(input()).toHaveAttribute('aria-expanded', 'true')
  })

  it('selects a suggestion with the mouse', async () => {
    const onSelect = vi.fn()
    render(<Harness onSelect={onSelect} />)
    await userEvent.type(input(), 'San')

    await userEvent.click(await screen.findByRole('option', { name: 'Sandton, Johannesburg' }))

    await waitFor(() =>
      expect(onSelect).toHaveBeenCalledWith({
        position: { lat: -26.1, lng: 28.05 },
        label: 'Sandton, Johannesburg, South Africa',
      }),
    )
    expect(input()).toHaveValue('Sandton, Johannesburg')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('supports choosing a suggestion with the keyboard', async () => {
    const onSelect = vi.fn()
    render(<Harness onSelect={onSelect} />)
    await userEvent.type(input(), 'San')
    await screen.findAllByRole('option')

    await userEvent.keyboard('{ArrowDown}{ArrowDown}')
    expect(screen.getByRole('option', { name: /sandringham/i })).toHaveAttribute(
      'aria-selected',
      'true',
    )

    await userEvent.keyboard('{Enter}')
    await waitFor(() =>
      expect(onSelect).toHaveBeenCalledWith(
        expect.objectContaining({ position: { lat: -26.15, lng: 28.11 } }),
      ),
    )
  })

  it('closes the suggestions on Escape', async () => {
    render(<Harness onSelect={vi.fn()} />)
    await userEvent.type(input(), 'San')
    await screen.findAllByRole('option')

    await userEvent.keyboard('{Escape}')

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('shows an error when the place details cannot be loaded', async () => {
    fetchFields.mockRejectedValue(new Error('quota'))
    const onSelect = vi.fn()
    render(<Harness onSelect={onSelect} />)
    await userEvent.type(input(), 'San')

    await userEvent.click(await screen.findByRole('option', { name: 'Sandton, Johannesburg' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/could not load that place/i)
    expect(onSelect).not.toHaveBeenCalled()
  })
})
