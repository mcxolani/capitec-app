import type {
  EligibilityRequest,
  EligibilityResponse,
  LoanProduct,
  RateRequest,
  RateResponse,
  ValidationRules,
} from '@/types/loan'
import { formatRand } from '@/utils/currency'
import { repaymentTotals } from '@/utils/loanCalculations'
import {
  MAX_AGE,
  MAX_LOAN,
  MAX_TERM,
  MIN_AGE,
  MIN_EMPLOYMENT_MONTHS,
  MIN_INCOME,
  MIN_LOAN,
  MIN_TERM,
  assessEligibility,
  interestRateFor,
} from '@/utils/loanEligibility'

// Mocked versions of the endpoints in docs/LoanEligibilitySimulatorEndpoints.md.
// Each resolves after a short delay to behave like a network call.

const delay = () => new Promise((resolve) => setTimeout(resolve, 300))

const PRODUCTS: LoanProduct[] = [
  {
    id: 'personal_loan',
    name: 'Personal Loan',
    description: 'Flexible personal financing for various needs',
    minAmount: MIN_LOAN,
    maxAmount: MAX_LOAN,
    minTerm: MIN_TERM,
    maxTerm: MAX_TERM,
    interestRateRange: { min: 10.5, max: 18.5 },
    purposes: ['debt_consolidation', 'home_improvement', 'education', 'medical', 'other'],
  },
  {
    id: 'vehicle_loan',
    name: 'Vehicle Finance',
    description: 'Financing for new and used vehicles',
    minAmount: 50000,
    maxAmount: 1500000,
    minTerm: 12,
    maxTerm: 72,
    interestRateRange: { min: 8.5, max: 15.0 },
    purposes: ['new_vehicle', 'used_vehicle'],
  },
]

const VALIDATION_RULES: ValidationRules = {
  personalInfo: {
    age: {
      min: MIN_AGE,
      max: MAX_AGE,
      required: true,
      errorMessage: `Age must be between ${MIN_AGE} and ${MAX_AGE}`,
    },
    employmentStatus: {
      required: true,
      options: ['employed', 'self_employed', 'unemployed', 'retired'],
      errorMessage: 'Please select your employment status',
    },
    employmentDuration: {
      min: MIN_EMPLOYMENT_MONTHS,
      required: true,
      errorMessage: `Minimum ${MIN_EMPLOYMENT_MONTHS} months employment required`,
    },
  },
  financialInfo: {
    monthlyIncome: {
      min: MIN_INCOME,
      required: true,
      errorMessage: `Minimum monthly income of ${formatRand(MIN_INCOME)} required`,
    },
    monthlyExpenses: {
      min: 0,
      required: true,
      errorMessage: 'Please enter your monthly expenses',
    },
    creditScore: {
      min: 300,
      max: 850,
      required: false,
      errorMessage: 'Credit score must be between 300 and 850',
    },
  },
  loanDetails: {
    requestedAmount: {
      min: MIN_LOAN,
      max: MAX_LOAN,
      required: true,
      errorMessage: `Loan amount must be between ${formatRand(MIN_LOAN)} and ${formatRand(MAX_LOAN)}`,
    },
    loanTerm: {
      min: MIN_TERM,
      max: MAX_TERM,
      required: true,
      errorMessage: `Loan term must be between ${MIN_TERM} and ${MAX_TERM} months`,
    },
  },
}

// GET /api/loans/products
export async function fetchLoanProducts(): Promise<LoanProduct[]> {
  await delay()
  return PRODUCTS
}

// GET /api/loans/validation-rules
export async function fetchValidationRules(): Promise<ValidationRules> {
  await delay()
  return VALIDATION_RULES
}

// POST /api/loans/eligibility
export async function checkEligibility(request: EligibilityRequest): Promise<EligibilityResponse> {
  await delay()
  return assessEligibility(request)
}

// The credit-score rate bands are for personal loans; vehicle finance maps the
// same position onto its own, lower range.
function rateFor(loanType: RateRequest['loanType'], creditScore?: number): number {
  const personal = PRODUCTS[0].interestRateRange
  const rate = interestRateFor(creditScore)
  if (loanType === 'personal_loan') return rate

  const { min, max } = PRODUCTS[1].interestRateRange
  const position = (rate - personal.min) / (personal.max - personal.min)
  return Math.round((min + position * (max - min)) * 100) / 100
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
