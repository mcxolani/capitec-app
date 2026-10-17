import type { SpendingQuery, TransactionQuery } from '@/types/spending'
import {
  budgetStatus,
  categoryBreakdown,
  filterTransactions,
  resolveRange,
  spendingSummary,
  totalAmount,
} from '@/utils/spending'
import { saDate } from '@/utils/spendingFormat'
import { generateTransactions } from './spendingData'
import { spendingFilters } from '@/constants/spending'

// All seven mock endpoints share the same snapshot. Inject a clock and zero delay in tests.
export function createSpendingApi(now = new Date(), delay = 250) {
  const transactions = generateTransactions(now)
  const today = saDate(now)
  const respond = async <T>(calculate: () => T): Promise<T> => {
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay))
    return calculate()
  }
  return {
    profile: () =>
      respond(() => ({
        customerId: '12345',
        name: 'John Doe',
        email: 'john.doe@example.com',
        joinDate: transactions[transactions.length - 1].date.slice(0, 10),
        accountType: 'premium',
        totalSpent: totalAmount(transactions),
        currency: 'ZAR',
      })),
    filters: () => respond(() => spendingFilters),
    summary: (query: SpendingQuery = {}) =>
      respond(() => spendingSummary(transactions, query, now)),
    categories: (query: SpendingQuery = {}) =>
      respond(() => {
        const range = resolveRange(query, now)
        return categoryBreakdown(filterTransactions(transactions, range, query.category), range)
      }),
    trends: (months = 12, category?: string) =>
      respond(() => {
        const count = Math.min(months, 24)
        const anchor = new Date(`${today}T00:00:00Z`)
        return {
          trends: Array.from({ length: count }, (_, i) => {
            const first = new Date(
              Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() - count + i + 1, 1),
            )
            const last = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0))
            const matches = filterTransactions(
              transactions,
              {
                startDate: first.toISOString().slice(0, 10),
                endDate: last.toISOString().slice(0, 10),
              },
              category,
            )
            const total = totalAmount(matches)
            return {
              month: first.toISOString().slice(0, 7),
              totalSpent: total,
              transactionCount: matches.length,
              averageTransaction: matches.length
                ? Math.round((total / matches.length) * 100) / 100
                : 0,
            }
          }),
        }
      }),
    transactions: (query: TransactionQuery = {}) =>
      respond(() => {
        const limit = Math.min(query.limit ?? 20, 100)
        const offset = query.offset ?? 0
        // With no period or dates, the endpoint returns the full history, per the API spec.
        const range =
          query.period || query.startDate || query.endDate
            ? resolveRange(query, now)
            : { startDate: transactions[transactions.length - 1].date.slice(0, 10), endDate: today }
        const matches = filterTransactions(transactions, range, query.category)
        const sort = query.sortBy ?? 'date_desc'
        matches.sort((a, b) => {
          const order = sort.startsWith('amount')
            ? a.amount - b.amount
            : a.date.localeCompare(b.date)
          return (sort.endsWith('desc') ? -order : order) || a.id.localeCompare(b.id)
        })
        return {
          transactions: matches.slice(offset, offset + limit),
          pagination: {
            total: matches.length,
            limit,
            offset,
            hasMore: offset + limit < matches.length,
          },
        }
      }),
    goals: (category?: string) =>
      respond(() => {
        const anchor = new Date(`${today}T00:00:00Z`)
        const lastDay = new Date(
          Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() + 1, 0),
        ).getUTCDate()
        const budgets = [
          { category: 'Entertainment', monthlyBudget: 1000 },
          { category: 'Groceries', monthlyBudget: 1500 },
        ]
        return {
          goals: budgets
            .filter((budget) => !category || category === budget.category)
            .map((budget) => {
              const currentSpent = totalAmount(
                filterTransactions(
                  transactions,
                  {
                    startDate: `${today.slice(0, 7)}-01`,
                    endDate: today,
                  },
                  budget.category,
                ),
              )
              const percentageUsed = Math.round((currentSpent / budget.monthlyBudget) * 10000) / 100
              return {
                ...budget,
                id: `goal_${budget.category.toLowerCase()}`,
                currentSpent,
                percentageUsed,
                daysRemaining: lastDay - anchor.getUTCDate(),
                status: budgetStatus((currentSpent / budget.monthlyBudget) * 100),
              }
            }),
        }
      }),
  }
}

export const spendingApi = createSpendingApi()
