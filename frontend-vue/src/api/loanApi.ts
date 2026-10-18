import { request } from './request'
import type {
  EligibilityRequest,
  EligibilityResponse,
  LoanProduct,
  RateRequest,
  RateResponse,
  ValidationRules,
} from '@/types/loan'

export async function getLoanProducts() {
  const response = await request<{ products: LoanProduct[] }>('/api/loans/products')
  return response.products
}

export function getValidationRules() {
  return request<ValidationRules>('/api/loans/validation-rules')
}

export function checkEligibility(body: EligibilityRequest) {
  return request<EligibilityResponse>('/api/loans/eligibility', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export function calculateRate(body: RateRequest) {
  return request<RateResponse>('/api/loans/calculate-rate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}
