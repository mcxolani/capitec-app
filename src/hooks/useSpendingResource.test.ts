import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useSpendingResource } from './useSpendingResource'

describe('useSpendingResource', () => {
  it('hides old data during filter changes and ignores late responses', async () => {
    let finishOld: (value: string) => void = () => {}
    const oldLoader = () =>
      new Promise<string>((resolve) => {
        finishOld = resolve
      })
    const newLoader = () => Promise.resolve('new filter results')
    const { result, rerender } = renderHook(({ loader }) => useSpendingResource(loader), {
      initialProps: { loader: oldLoader },
    })
    expect(result.current.loading).toBe(true)
    rerender({ loader: newLoader })
    await waitFor(() => expect(result.current.data).toBe('new filter results'))
    await act(async () => {
      finishOld('old filter results')
    })
    expect(result.current.data).toBe('new filter results')

    rerender({ loader: oldLoader })
    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBeUndefined()
  })

  it('retries a failed request independently', async () => {
    const loader = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce('recovered')
    const { result } = renderHook(() => useSpendingResource(loader))
    await waitFor(() => expect(result.current.error).toBeTruthy())
    act(() => result.current.retry())
    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.data).toBe('recovered'))
    expect(result.current.error).toBeUndefined()
  })
})
