import { request } from './request'
import type {
  CustomerProfile,
  SpendingFilters,
  SpendingPeriod,
  SpendingSummary,
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
