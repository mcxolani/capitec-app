import { describe, expect, it } from 'vitest'
import { formatRand } from './currency'

describe('formatRand', () => {
  it.each([
    [0, 'R0'],
    [5000, 'R5,000'],
    [7096.1, 'R7,096'],
    [169999.5, 'R170,000'],
    [1500000, 'R1,500,000'],
  ])('formats %s as %s', (amount, expected) => {
    expect(formatRand(amount)).toBe(expected)
  })
})
