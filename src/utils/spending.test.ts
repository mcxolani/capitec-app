import { describe, expect, it } from 'vitest'
import {
  budgetStatus,
  filterTransactions,
  isValidDate,
  resolveRange,
  spendingSummary,
} from './spending'
import { formatDate, formatMoney, formatPercentage, saDate } from './spendingFormat'
import type { Transaction } from '@/types/spending'

const transaction = (id: string, date: string, amount: number): Transaction => ({
  id,
  date,
  amount,
  merchant: 'Test merchant',
  category: 'Groceries',
  description: 'Groceries',
  paymentMethod: 'Debit Card',
  icon: 'shopping-cart',
  categoryColor: '#FF6B6B',
})

describe('spending calculations and formatting', () => {
  it('uses inclusive dates at South African midnight', () => {
    const rows = [
      transaction('before', '2026-10-15T21:59:59Z', 10),
      transaction('start', '2026-10-15T22:00:00Z', 20),
      transaction('end', '2026-10-16T21:59:59Z', 30),
      transaction('after', '2026-10-16T22:00:00Z', 40),
    ]
    expect(
      filterTransactions(rows, { startDate: '2026-10-16', endDate: '2026-10-16' }).map(
        (item) => item.id,
      ),
    ).toEqual(['start', 'end'])
    expect(resolveRange({ period: '7d' }, new Date('2026-10-15T22:30:00Z'))).toEqual({
      startDate: '2026-10-10',
      endDate: '2026-10-16',
    })
    expect(saDate(new Date('2026-10-15T22:30:00Z'))).toBe('2026-10-16')
  })

  it('compares with an equally sized preceding period and handles a zero baseline', () => {
    const now = new Date('2026-10-16T12:00:00Z')
    const rows = [
      transaction('previous', '2026-10-09T12:00:00Z', 100),
      transaction('current', '2026-10-16T12:00:00Z', 125),
    ]
    expect(spendingSummary(rows, { period: '7d' }, now).comparedToPrevious).toEqual({
      spentChange: 25,
      transactionChange: 0,
    })
    expect(
      spendingSummary(rows.slice(1), { period: '7d' }, now).comparedToPrevious.spentChange,
    ).toBeNull()
  })

  it('validates leap days and budget boundaries', () => {
    expect(isValidDate('2024-02-29')).toBe(true)
    expect(isValidDate('2026-02-29')).toBe(false)
    expect([79.99, 80, 100, 100.01].map(budgetStatus)).toEqual([
      'on_track',
      'warning',
      'warning',
      'over_budget',
    ])
  })

  it('shows cents, signed percentages and South African dates', () => {
    expect(formatMoney(1250.3)).toBe('R1,250.30')
    expect(formatPercentage(12.5)).toBe('+12.5%')
    expect(formatPercentage(-3)).toBe('-3.0%')
    expect(formatPercentage(null)).toBe('No previous spending')
    expect(formatDate('2026-10-15T22:30:00Z')).toContain('16')
  })
})
