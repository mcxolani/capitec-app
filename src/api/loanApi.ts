import type {
  EligibilityRequest,
  EligibilityResponse,
  LoanProduct,
  RateRequest,
  RateResponse,
  ValidationRules,
} from '@/types/loan'
import { requestJson } from './request'

// Loan products, validation rules, eligibility checks and rate calculations use Spring Boot.

// GET /api/loans/products
export async function fetchLoanProducts(): Promise<LoanProduct[]> {
  const { products } = await requestJson<{ products: LoanProduct[] }>('/api/loans/products')
  return products
}

// GET /api/loans/validation-rules
export function fetchValidationRules(): Promise<ValidationRules> {
  return requestJson('/api/loans/validation-rules')
}

// POST /api/loans/eligibility
export function checkEligibility(request: EligibilityRequest): Promise<EligibilityResponse> {
  return requestJson('/api/loans/eligibility', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
}

// POST /api/loans/calculate-rate
export function calculateRate(request: RateRequest): Promise<RateResponse> {
  return requestJson('/api/loans/calculate-rate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
}
