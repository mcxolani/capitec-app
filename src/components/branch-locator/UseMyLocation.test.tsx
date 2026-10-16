import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { mockGeolocation } from '@/test/geolocation'
import UseMyLocation from './UseMyLocation'

describe('UseMyLocation', () => {
  it('passes the current position on as "My location"', async () => {
    mockGeolocation({ lat: -29.85, lng: 31.02 })
    const onLocated = vi.fn()
    render(<UseMyLocation onLocated={onLocated} />)

    await userEvent.click(screen.getByRole('button', { name: 'Use my location' }))

    expect(onLocated).toHaveBeenCalledWith({
      position: { lat: -29.85, lng: 31.02 },
      label: 'My location',
    })
  })

  it('shows an error and does not report a position when permission is denied', async () => {
    mockGeolocation('denied')
    const onLocated = vi.fn()
    render(<UseMyLocation onLocated={onLocated} />)

    await userEvent.click(screen.getByRole('button', { name: 'Use my location' }))

    expect(screen.getByRole('alert')).toHaveTextContent(/permission denied/i)
    expect(onLocated).not.toHaveBeenCalled()
  })
})
