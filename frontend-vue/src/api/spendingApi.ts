import { request } from './request'
import type {
  CustomerProfile,
  SpendingCategories,
  SpendingFilters,
  SpendingGoals,
  SpendingDateRange,
  SpendingPeriod,
  SpendingSort,
  SpendingSummary,
  SpendingTransactions,
  SpendingTrends,
} from '@/types/spending'

const customerUrl = '/api/customers/12345'

export function getCustomerProfile() {
  return request<CustomerProfile>(`${customerUrl}/profile`)
}

export function getSpendingFilters() {
  return request<SpendingFilters>(`${customerUrl}/filters`)
}

function spendingParams(period: SpendingPeriod, category?: string, dates?: SpendingDateRange) {
  const params = new URLSearchParams({ period })
  if (category) params.set('category', category)
  if (dates?.startDate && dates.endDate) {
    params.set('startDate', dates.startDate)
    params.set('endDate', dates.endDate)
  }
  return params
}

export function getSpendingSummary(
  period: SpendingPeriod,
  category?: string,
  dates?: SpendingDateRange,
) {
  const params = spendingParams(period, category, dates)
  return request<SpendingSummary>(`${customerUrl}/spending/summary?${params}`)
}

export function getSpendingCategories(
  period: SpendingPeriod,
  category?: string,
  dates?: SpendingDateRange,
) {
  const params = spendingParams(period, category, dates)
  return request<SpendingCategories>(`${customerUrl}/spending/categories?${params}`)
}

export function getSpendingTrends(months = 12, category?: string) {
  const params = new URLSearchParams({ months: String(months) })
  if (category) params.set('category', category)
  return request<SpendingTrends>(`${customerUrl}/spending/trends?${params}`)
}

export function getSpendingGoals(category?: string) {
  const params = new URLSearchParams()
  if (category) params.set('category', category)
  const query = category ? `?${params}` : ''
  return request<SpendingGoals>(`${customerUrl}/goals${query}`)
}

export function getSpendingTransactions(
  period: SpendingPeriod,
  category: string | undefined,
  dates: SpendingDateRange | undefined,
  sortBy: SpendingSort,
  offset = 0,
) {
  const params = spendingParams(period, category, dates)
  params.set('limit', '20')
  params.set('offset', String(offset))
  params.set('sortBy', sortBy)
  return request<SpendingTransactions>(`${customerUrl}/transactions?${params}`)
}
