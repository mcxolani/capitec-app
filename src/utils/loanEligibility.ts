import type {
  AffordabilityScore,
  EligibilityRequest,
  EligibilityResponse,
  RiskCategory,
} from '@/types/loan'
import { formatRand } from './currency'
import { repaymentTotals, roundCents } from './loanCalculations'

// Simulated lending rules for a personal loan. These are illustrative, not a
// real credit policy; every threshold is named here so it can be reviewed.

export const MIN_LOAN = 5000
export const MAX_LOAN = 300000
export const MIN_INCOME = 5000
export const MIN_AGE = 18
export const MAX_AGE = 65
export const MIN_EMPLOYMENT_MONTHS = 3
export const MIN_TERM = 6
export const MAX_TERM = 60

// share of disposable income the new repayment may use, leaving a buffer
export const AFFORDABILITY_SHARE = 0.8
// existing debt repayments above this % of income are declined
export const MAX_DEBT_TO_INCOME = 40

// annual rate by credit score, within the personal loan range of 10.5–18.5%
const RATE_BANDS = [
  { minScore: 750, rate: 10.5 },
  { minScore: 650, rate: 12.5 },
  { minScore: 550, rate: 15.5 },
  { minScore: 0, rate: 18.5 },
]
// without a credit score, price as a mid-range applicant
const RATE_WITHOUT_SCORE = 15.5

export function interestRateFor(creditScore?: number): number {
  if (creditScore === undefined) return RATE_WITHOUT_SCORE
  return RATE_BANDS.find((band) => creditScore >= band.minScore)!.rate
}

// Largest loan whose monthly repayment is at most `payment`, rounded down to R1,000
export function maxAffordableAmount(payment: number, annualRate: number, termMonths: number) {
  if (payment <= 0) return 0
  const r = annualRate / 100 / 12
  const amount = r === 0 ? payment * termMonths : (payment * (1 - (1 + r) ** -termMonths)) / r
  return Math.min(MAX_LOAN, Math.floor(amount / 1000) * 1000)
}

function riskCategoryFor(debtToIncome: number, creditScore?: number): RiskCategory {
  if (debtToIncome > 35 || (creditScore !== undefined && creditScore < 550)) return 'high'
  if (debtToIncome <= 20 && creditScore !== undefined && creditScore >= 650) return 'low'
  return 'medium'
}

function affordabilityScoreFor(disposable: number, income: number): AffordabilityScore {
  const share = disposable / income
  if (share >= 0.3) return 'good'
  if (share >= 0.15) return 'fair'
  return 'poor'
}

// Reasons that rule out any loan, in the order they are checked
function declineReason(request: EligibilityRequest, disposable: number, debtToIncome: number) {
  const { age, employmentStatus, employmentDuration } = request.personalInfo
  const { monthlyIncome } = request.financialInfo
  const { requestedAmount, loanTerm } = request.loanDetails

  if (requestedAmount < MIN_LOAN || requestedAmount > MAX_LOAN)
    return `Loan amounts are between ${formatRand(MIN_LOAN)} and ${formatRand(MAX_LOAN)}.`
  if (loanTerm < MIN_TERM || loanTerm > MAX_TERM)
    return `Loan terms are between ${MIN_TERM} and ${MAX_TERM} months.`
  if (age < MIN_AGE || age > MAX_AGE) return `Applicants must be aged ${MIN_AGE} to ${MAX_AGE}.`
  if (employmentStatus === 'unemployed') return 'A regular income from employment is required.'
  if (employmentStatus !== 'retired' && employmentDuration < MIN_EMPLOYMENT_MONTHS)
    return `At least ${MIN_EMPLOYMENT_MONTHS} months in your current employment is required.`
  if (monthlyIncome < MIN_INCOME)
    return `A monthly income of at least ${formatRand(MIN_INCOME)} is required.`
  if (disposable <= 0) return 'Your monthly expenses leave no income available for repayments.'
  if (debtToIncome > MAX_DEBT_TO_INCOME)
    return `Existing debt repayments are above ${MAX_DEBT_TO_INCOME}% of your income.`
  return null
}

const percent = (value: number) => Math.round(value * 10) / 10

export function assessEligibility(request: EligibilityRequest): EligibilityResponse {
  const { monthlyIncome, monthlyExpenses, existingDebt, creditScore } = request.financialInfo
  const { requestedAmount, loanTerm } = request.loanDetails

  // per the spec example, existing debt counts towards the debt ratio and risk,
  // not disposable income
  const disposable = roundCents(monthlyIncome - monthlyExpenses)
  // unrounded for the rules; rounded only in the response
  const debtToIncome = (existingDebt / monthlyIncome) * 100
  const loanToIncome = percent((requestedAmount / (monthlyIncome * 12)) * 100)
  const interestRate = interestRateFor(creditScore)
  const maxPayment = disposable * AFFORDABILITY_SHARE
  const requested = repaymentTotals(requestedAmount, interestRate, loanTerm)

  const affordabilityAnalysis = {
    disposableIncome: disposable,
    debtToIncomeRatio: percent(debtToIncome),
    loanToIncomeRatio: loanToIncome,
    affordabilityScore: affordabilityScoreFor(disposable, monthlyIncome),
  }

  const declined = declineReason(request, disposable, debtToIncome)
  const maxAmount = declined ? 0 : maxAffordableAmount(maxPayment, interestRate, loanTerm)
  const fitsBudget = !declined && requested.monthlyPayment <= maxPayment
  const recommendedAmount = fitsBudget ? requestedAmount : maxAmount >= MIN_LOAN ? maxAmount : 0
  const recommended = repaymentTotals(recommendedAmount, interestRate, loanTerm)

  const riskCategory = declined ? 'high' : riskCategoryFor(debtToIncome, creditScore)

  // a rough indication only, capped so the simulator never promises approval
  const usage = maxPayment > 0 ? recommended.monthlyPayment / maxPayment : 1
  const approvalLikelihood = recommendedAmount
    ? Math.min(
        95,
        Math.max(
          5,
          100 -
            { low: 0, medium: 15, high: 35 }[riskCategory] -
            Math.round(Math.max(0, usage - 0.5) * 40) -
            (creditScore === undefined ? 10 : 0),
        ),
      )
    : 0

  let decisionReason: string
  if (declined) {
    decisionReason = declined
  } else if (fitsBudget) {
    decisionReason = `The repayment of ${formatRand(requested.monthlyPayment)} a month fits within ${AFFORDABILITY_SHARE * 100}% of your disposable income of ${formatRand(disposable)}.`
  } else if (recommendedAmount) {
    decisionReason = `The repayment of ${formatRand(requested.monthlyPayment)} a month is more than ${AFFORDABILITY_SHARE * 100}% of your disposable income. You could afford up to ${formatRand(maxAmount)} over ${loanTerm} months.`
  } else {
    decisionReason = `Your disposable income of ${formatRand(disposable)} can't cover the repayment on the minimum loan of ${formatRand(MIN_LOAN)}.`
  }

  return {
    eligibilityResult: {
      isEligible: fitsBudget,
      approvalLikelihood,
      riskCategory,
      decisionReason,
    },
    recommendedLoan: {
      maxAmount,
      recommendedAmount,
      interestRate,
      monthlyPayment: recommended.monthlyPayment,
      totalRepayment: recommended.totalRepayment,
    },
    affordabilityAnalysis,
  }
}
