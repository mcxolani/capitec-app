import type {
  EligibilityRequest,
  EligibilityResponse,
  LoanProduct,
  RateRequest,
  RateResponse,
  ValidationRules,
} from '@/types/loan'
import { repaymentTotals } from '@/utils/loanCalculations'
import { interestRateFor } from '@/utils/loanEligibility'
import { requestJson } from './request'

// Loan products, validation rules and eligibility checks use Spring Boot.
// Rate calculations stay local until that endpoint is connected.

const delay = () => new Promise((resolve) => setTimeout(resolve, 300))

const PERSONAL_RATE_RANGE = { min: 10.5, max: 18.5 }
const VEHICLE_RATE_RANGE = { min: 8.5, max: 15 }

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

// The credit-score rate bands are for personal loans; vehicle finance maps the
// same position onto its own, lower range.
function rateFor(loanType: RateRequest['loanType'], creditScore?: number): number {
  const rate = interestRateFor(creditScore)
  if (loanType === 'personal_loan') return rate

  const position =
    (rate - PERSONAL_RATE_RANGE.min) / (PERSONAL_RATE_RANGE.max - PERSONAL_RATE_RANGE.min)
  return (
    Math.round(
      (VEHICLE_RATE_RANGE.min + position * (VEHICLE_RATE_RANGE.max - VEHICLE_RATE_RANGE.min)) * 100,
    ) / 100
  )
}

// POST /api/loans/calculate-rate
export async function calculateRate(request: RateRequest): Promise<RateResponse> {
  await delay()
  const interestRate = rateFor(request.loanType, request.creditScore)
  const totals = repaymentTotals(request.loanAmount, interestRate, request.loanTerm)

  return {
    interestRate,
    monthlyPayment: totals.monthlyPayment,
    totalInterest: totals.totalInterest,
    totalRepayment: totals.totalRepayment,
    paymentSchedule: totals.schedule,
  }
}
