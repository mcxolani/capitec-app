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
export type EligibilityPurpose = Exclude<LoanPurpose, 'new_vehicle' | 'used_vehicle'>

export type LoanProduct = {
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

export type NumberRule = {
  min?: number
  max?: number
  required: boolean
  errorMessage: string
}

export type ValidationRules = {
  personalInfo: {
    age: NumberRule
    employmentStatus: {
      required: boolean
      options: EmploymentStatus[]
      errorMessage: string
    }
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

export type EligibilityRequest = {
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
    loanPurpose: EligibilityPurpose
  }
}

export type EligibilityResponse = {
  eligibilityResult: {
    isEligible: boolean
    approvalLikelihood: number
    riskCategory: string
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
    affordabilityScore: string
  }
}

export type RateRequest = {
  loanAmount: number
  loanTerm: number
  creditScore?: number
  loanType: LoanType
}

export type PaymentScheduleEntry = {
  month: number
  payment: number
  principal: number
  interest: number
  balance: number
}

export type RateResponse = {
  interestRate: number
  monthlyPayment: number
  totalInterest: number
  totalRepayment: number
  paymentSchedule: PaymentScheduleEntry[]
}
