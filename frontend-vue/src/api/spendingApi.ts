import { request } from './request'
import type {
  CustomerProfile,
  SpendingCategories,
  SpendingFilters,
  SpendingPeriod,
  SpendingSummary,
  SpendingTrends,
} from '@/types/spending'

const customerUrl = '/api/customers/12345'

export function getCustomerProfile() {
  return request<CustomerProfile>(`${customerUrl}/profile`)
}

export function getSpendingFilters() {
  return request<SpendingFilters>(`${customerUrl}/filters`)
}

export function getSpendingSummary(period: SpendingPeriod, category?: string) {
  const params = new URLSearchParams({ period })
  if (category) params.set('category', category)
  return request<SpendingSummary>(`${customerUrl}/spending/summary?${params}`)
}

export function getSpendingCategories(period: SpendingPeriod, category?: string) {
  const params = new URLSearchParams({ period })
  if (category) params.set('category', category)
  return request<SpendingCategories>(`${customerUrl}/spending/categories?${params}`)
}

export function getSpendingTrends(months = 12, category?: string) {
  const params = new URLSearchParams({ months: String(months) })
  if (category) params.set('category', category)
  return request<SpendingTrends>(`${customerUrl}/spending/trends?${params}`)
}
