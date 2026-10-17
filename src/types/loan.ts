// Shapes follow docs/LoanEligibilitySimulatorEndpoints.md. Amounts are in rands,
// rates and ratios are percentages, terms and durations are in months.

export type EmploymentStatus = 'employed' | 'self_employed' | 'unemployed' | 'retired'

export type LoanType = 'personal_loan' | 'vehicle_loan'

export type LoanPurpose =
  | 'debt_consolidation'
  | 'home_improvement'
  | 'education'
  | 'medical'
  | 'other'
  | 'new_vehicle'
  | 'used_vehicle'

export type RiskCategory = 'low' | 'medium' | 'high'

export type AffordabilityScore = 'good' | 'fair' | 'poor'

// POST /api/loans/eligibility

export interface EligibilityRequest {
  personalInfo: {
    age: number
    employmentStatus: EmploymentStatus
    employmentDuration: number
  }
  financialInfo: {
    monthlyIncome: number
    monthlyExpenses: number
    existingDebt: number
    creditScore?: number
  }
  loanDetails: {
    requestedAmount: number
    loanTerm: number
    loanPurpose: LoanPurpose
  }
}

export interface EligibilityResponse {
  eligibilityResult: {
    isEligible: boolean
    approvalLikelihood: number
    riskCategory: RiskCategory
    decisionReason: string
  }
  recommendedLoan: {
    maxAmount: number
    recommendedAmount: number
    interestRate: number
    monthlyPayment: number
    totalRepayment: number
  }
  affordabilityAnalysis: {
    disposableIncome: number
    debtToIncomeRatio: number
    loanToIncomeRatio: number
    affordabilityScore: AffordabilityScore
  }
}

// GET /api/loans/products

export interface LoanProduct {
  id: LoanType
  name: string
  description: string
  minAmount: number
  maxAmount: number
  minTerm: number
  maxTerm: number
  interestRateRange: { min: number; max: number }
  purposes: LoanPurpose[]
}

// POST /api/loans/calculate-rate

export interface RateRequest {
  loanAmount: number
  loanTerm: number
  creditScore?: number
  loanType: LoanType
}

export interface PaymentScheduleEntry {
  month: number
  payment: number
  principal: number
  interest: number
  balance: number
}

export interface RateResponse {
  interestRate: number
  monthlyPayment: number
  totalInterest: number
  totalRepayment: number
  paymentSchedule: PaymentScheduleEntry[]
}

// GET /api/loans/validation-rules

export interface NumberRule {
  min?: number
  max?: number
  required: boolean
  errorMessage: string
}

export interface OptionsRule<T extends string> {
  required: boolean
  options: T[]
  errorMessage: string
}

export interface ValidationRules {
  personalInfo: {
    age: NumberRule
    employmentStatus: OptionsRule<EmploymentStatus>
    employmentDuration: NumberRule
  }
  financialInfo: {
    monthlyIncome: NumberRule
    monthlyExpenses: NumberRule
    creditScore: NumberRule
  }
  loanDetails: {
    requestedAmount: NumberRule
    loanTerm: NumberRule
  }
}
