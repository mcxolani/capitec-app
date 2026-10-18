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

export function getSpendingSummary(period: SpendingPeriod) {
  return request<SpendingSummary>(`${customerUrl}/spending/summary?period=${period}`)
}

export function getSpendingCategories(period: SpendingPeriod) {
  return request<SpendingCategories>(`${customerUrl}/spending/categories?period=${period}`)
}

export function getSpendingTrends(months = 12) {
  return request<SpendingTrends>(`${customerUrl}/spending/trends?months=${months}`)
}
