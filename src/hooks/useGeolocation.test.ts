import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { mockGeolocation } from '@/test/geolocation'
import { useGeolocation } from './useGeolocation'

describe('useGeolocation', () => {
  it('resolves with the current position', async () => {
    mockGeolocation({ lat: -33.92, lng: 18.42 })
    const { result } = renderHook(() => useGeolocation())

    let position: Awaited<ReturnType<typeof result.current.locate>> = null
    await act(async () => {
      position = await result.current.locate()
    })

    expect(position).toEqual({ lat: -33.92, lng: 18.42 })
    expect(result.current.error).toBeNull()
    expect(result.current.loading).toBe(false)
  })

  it('explains how to recover when permission is denied', async () => {
    mockGeolocation('denied')
    const { result } = renderHook(() => useGeolocation())

    await act(async () => {
      expect(await result.current.locate()).toBeNull()
    })

    expect(result.current.error).toMatch(/permission denied/i)
  })

  it('reports a generic error when the position is unavailable', async () => {
    mockGeolocation('unavailable')
    const { result } = renderHook(() => useGeolocation())

    await act(async () => {
      await result.current.locate()
    })

    expect(result.current.error).toMatch(/could not get your location/i)
  })

  it('reports when the browser has no geolocation support', async () => {
    const { geolocation: _, ...rest } = navigator
    void _
    vi.stubGlobal('navigator', rest)
    const { result } = renderHook(() => useGeolocation())

    await act(async () => {
      expect(await result.current.locate()).toBeNull()
    })

    expect(result.current.error).toMatch(/not supported/i)
  })
})
