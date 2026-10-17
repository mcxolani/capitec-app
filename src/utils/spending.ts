import { spendingFilters, periodDays } from '@/constants/spending'
import type { DateRange, SpendingQuery, Transaction } from '@/types/spending'
import { saDate } from './spendingFormat'

export function shiftDate(date: string, days: number): string {
  const value = new Date(`${date}T00:00:00Z`)
  value.setUTCDate(value.getUTCDate() + days)
  return value.toISOString().slice(0, 10)
}

export function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export function resolveRange(query: SpendingQuery, now: Date): DateRange {
  if (query.startDate && query.endDate) {
    return { startDate: query.startDate, endDate: query.endDate }
  }
  const endDate = saDate(now)
  return { startDate: shiftDate(endDate, 1 - periodDays[query.period ?? '30d']), endDate }
}

export function filterTransactions(
  transactions: Transaction[],
  range: DateRange,
  category?: string,
) {
  // UTC timestamps are compared at the South African midnight boundary, including the final day.
  const start = new Date(`${range.startDate}T00:00:00+02:00`).getTime()
  const end = new Date(`${range.endDate}T00:00:00+02:00`).getTime() + 86400000
  return transactions.filter((transaction) => {
    const time = new Date(transaction.date).getTime()
    return time >= start && time < end && (!category || transaction.category === category)
  })
}

export function totalAmount(transactions: Transaction[]): number {
  return (
    transactions.reduce((sum, transaction) => sum + Math.round(transaction.amount * 100), 0) / 100
  )
}

export function categoryBreakdown(transactions: Transaction[], dateRange: DateRange) {
  const total = totalAmount(transactions)
  return {
    dateRange,
    totalAmount: total,
    categories: spendingFilters.categories
      .map((category) => {
        const matches = transactions.filter((transaction) => transaction.category === category.name)
        const amount = totalAmount(matches)
        return {
          ...category,
          amount,
          transactionCount: matches.length,
          percentage: total ? Math.round((amount / total) * 1000) / 10 : 0,
        }
      })
      .filter((category) => category.transactionCount > 0)
      .sort((a, b) => b.amount - a.amount),
  }
}

function percentChange(current: number, previous: number): number | null {
  return previous ? Math.round(((current - previous) / previous) * 1000) / 10 : current ? null : 0
}

export function spendingSummary(transactions: Transaction[], query: SpendingQuery, now: Date) {
  const range = resolveRange(query, now)
  const days = Math.round((Date.parse(range.endDate) - Date.parse(range.startDate)) / 86400000) + 1
  const current = filterTransactions(transactions, range, query.category)
  const previous = filterTransactions(
    transactions,
    {
      startDate: shiftDate(range.startDate, -days),
      endDate: shiftDate(range.startDate, -1),
    },
    query.category,
  )
  const total = totalAmount(current)
  return {
    period: query.period ?? '30d',
    totalSpent: total,
    transactionCount: current.length,
    averageTransaction: current.length ? Math.round((total / current.length) * 100) / 100 : 0,
    topCategory: categoryBreakdown(current, range).categories[0]?.name ?? null,
    comparedToPrevious: {
      spentChange: percentChange(total, totalAmount(previous)),
      transactionChange: percentChange(current.length, previous.length),
    },
  }
}

export function budgetStatus(percentage: number) {
  return percentage > 100 ? 'over_budget' : percentage >= 80 ? 'warning' : 'on_track'
}
