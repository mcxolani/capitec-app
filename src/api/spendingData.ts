import { spendingFilters } from '@/constants/spending'
import type { Transaction } from '@/types/spending'
import { saDate } from '@/utils/spendingFormat'

const merchants = [
  ['Pick n Pay', 'Checkers', 'Woolworths Food'],
  ['Netflix', 'Ster-Kinekor', 'Spotify'],
  ['Uber', 'Gautrain', 'Engen'],
  ['Nando’s', 'Seattle Coffee Co.', 'Mugg & Bean'],
  ['Takealot', 'Mr Price', 'Clicks'],
  ['Prepaid electricity', 'Vodacom', 'Municipal water'],
]

// Integer cents and a seeded sequence keep every endpoint consistent and tests repeatable.
// Include 25 calendar months so a full year always has a complete comparison period.
export function generateTransactions(now: Date): Transaction[] {
  const today = saDate(now)
  const anchor = new Date(`${today}T00:00:00Z`)
  const result: Transaction[] = []
  let seed = 12345
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    return seed / 4294967296
  }
  for (let month = 24; month >= 0; month--) {
    const first = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() - month, 1))
    const days = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate()
    const count = 42 + Math.floor(random() * 9)
    for (let i = 0; i < count; i++) {
      const categoryIndex = i % spendingFilters.categories.length
      const category = spendingFilters.categories[categoryIndex]
      const day = 1 + Math.floor(random() * days)
      const date = new Date(
        Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), day, 8 + (i % 10)),
      )
      const amount = (2500 + Math.floor(random() * (categoryIndex === 0 ? 32000 : 18000))) / 100
      if (date > now) continue
      const merchant = merchants[categoryIndex][Math.floor(i / 6) % 3]
      result.push({
        id: `txn_${first.toISOString().slice(0, 7)}_${i}`,
        date: date.toISOString(),
        merchant,
        category: category.name,
        amount,
        description: `${category.name} purchase`,
        paymentMethod: categoryIndex === 5 ? 'Debit Order' : 'Debit Card',
        icon: category.icon,
        categoryColor: category.color,
      })
    }
  }
  return result.sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id))
}
