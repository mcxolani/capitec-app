import { vi } from 'vitest'
import { fetchValidationRules } from '@/api/loanApi'

// Loads the mocked validation rules without waiting out the simulated delay
export async function loadValidationRules() {
  vi.useFakeTimers()
  const pending = fetchValidationRules()
  await vi.advanceTimersByTimeAsync(300)
  vi.useRealTimers()
  return pending
}
