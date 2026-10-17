import { describe, expect, it } from 'vitest'
import { createSpendingApi } from './spendingApi'
import { generateTransactions } from './spendingData'
import { totalAmount } from '@/utils/spending'

const now = new Date('2026-10-16T12:00:00Z')
const api = createSpendingApi(now, 0)

describe('spending mock API', () => {
  it('generates deterministic history without future transactions', () => {
    const transactions = generateTransactions(now)
    expect(transactions).toEqual(generateTransactions(now))
    expect(transactions.length).toBeGreaterThan(1000)
    expect(new Set(transactions.map((item) => item.id)).size).toBe(transactions.length)
    expect(transactions.every((item) => new Date(item.date) <= now)).toBe(true)
    expect(new Set(transactions.map((item) => item.merchant)).size).toBe(18)
  })

  it('reconciles summary, category totals, transactions and lifetime spending', async () => {
    const query = { period: '30d' as const }
    const [summary, categories, transactions, profile] = await Promise.all([
      api.summary(query),
      api.categories(query),
      api.transactions({ ...query, limit: 100 }),
      api.profile(),
    ])
    expect(summary.totalSpent).toBe(totalAmount(transactions.transactions))
    expect(categories.totalAmount).toBe(summary.totalSpent)
    expect(categories.categories.reduce((sum, item) => sum + item.transactionCount, 0)).toBe(
      summary.transactionCount,
    )
    expect(transactions.pagination.total).toBe(summary.transactionCount)
    expect(categories.categories.map((item) => item.amount)).toEqual(
      categories.categories.map((item) => item.amount).sort((a, b) => b - a),
    )
    expect(summary.topCategory).toBe(categories.categories[0].name)
    expect(profile.totalSpent).toBe(totalAmount(generateTransactions(now)))
  })

  it('applies custom dates before periods and category filters consistently', async () => {
    const query = {
      period: '1y' as const,
      startDate: '2026-09-01',
      endDate: '2026-09-30',
      category: 'Dining' as const,
    }
    const [summary, categories, transactions] = await Promise.all([
      api.summary(query),
      api.categories(query),
      api.transactions(query),
    ])
    expect(transactions.transactions.length).toBeGreaterThan(0)
    expect(
      transactions.transactions.every(
        (item) => item.category === 'Dining' && item.date.startsWith('2026-09'),
      ),
    ).toBe(true)
    expect(summary.totalSpent).toBe(categories.totalAmount)
    expect(summary.totalSpent).toBe(totalAmount(transactions.transactions))
    expect(summary.topCategory).toBe('Dining')
  })

  it('paginates sorted transactions without overlap and respects limits', async () => {
    const first = await api.transactions({ limit: 20, sortBy: 'amount_desc' })
    const second = await api.transactions({ limit: 20, offset: 20, sortBy: 'amount_desc' })
    const amounts = [...first.transactions, ...second.transactions].map((item) => item.amount)
    expect(amounts).toEqual([...amounts].sort((a, b) => b - a))
    expect(
      new Set([...first.transactions, ...second.transactions].map((item) => item.id)).size,
    ).toBe(40)
    expect((await api.transactions({ limit: 500 })).transactions).toHaveLength(100)
    expect((await api.transactions({ offset: 99999 })).pagination.hasMore).toBe(false)
    expect((await api.transactions({ sortBy: 'date_asc' })).transactions[0].date).toBe(
      generateTransactions(now).at(-1)?.date,
    )
  })

  it('reconciles monthly trends and goals with the same transactions', async () => {
    const trends = await api.trends(12, 'Groceries')
    expect(trends.trends).toHaveLength(12)
    const month = await api.summary({
      startDate: '2026-10-01',
      endDate: '2026-10-16',
      category: 'Groceries',
    })
    expect(trends.trends.at(-1)?.totalSpent).toBe(month.totalSpent)
    const goals = await api.goals('Groceries')
    expect(goals.goals).toHaveLength(1)
    expect(goals.goals[0].currentSpent).toBe(month.totalSpent)
    expect(goals.goals[0].daysRemaining).toBe(15)
    expect((await api.goals('Dining')).goals).toHaveLength(0)
    expect((await api.trends(100)).trends).toHaveLength(24)
    expect((await api.trends()).trends).toHaveLength(12)
  })

  it('returns empty results when the date range has no spending', async () => {
    const query = { startDate: '2020-01-01', endDate: '2020-01-31' }
    expect(await api.summary(query)).toMatchObject({
      totalSpent: 0,
      transactionCount: 0,
      averageTransaction: 0,
      topCategory: null,
    })
    expect((await api.categories(query)).categories).toEqual([])
    expect((await api.transactions(query)).transactions).toEqual([])
  })
})
