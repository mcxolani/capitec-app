import { describe, expect, it } from 'vitest'
import type { EligibilityRequest } from '@/types/loan'
import { assessEligibility, interestRateFor, maxAffordableAmount } from './loanEligibility'

// the example request from the API spec
const SPEC_EXAMPLE: EligibilityRequest = {
  personalInfo: { age: 35, employmentStatus: 'employed', employmentDuration: 24 },
  financialInfo: {
    monthlyIncome: 25000,
    monthlyExpenses: 15000,
    existingDebt: 5000,
    creditScore: 650,
  },
  loanDetails: { requestedAmount: 150000, loanTerm: 24, loanPurpose: 'home_improvement' },
}

type Overrides = {
  personalInfo?: Partial<EligibilityRequest['personalInfo']>
  financialInfo?: Partial<EligibilityRequest['financialInfo']>
  loanDetails?: Partial<EligibilityRequest['loanDetails']>
}

const withChanges = (changes: Overrides): EligibilityRequest => ({
  personalInfo: { ...SPEC_EXAMPLE.personalInfo, ...changes.personalInfo },
  financialInfo: { ...SPEC_EXAMPLE.financialInfo, ...changes.financialInfo },
  loanDetails: { ...SPEC_EXAMPLE.loanDetails, ...changes.loanDetails },
})

describe('interestRateFor', () => {
  it.each([
    [850, 10.5],
    [750, 10.5],
    [749, 12.5],
    [650, 12.5],
    [600, 15.5],
    [549, 18.5],
    [300, 18.5],
    [undefined, 15.5],
  ])('credit score %s gets %s%%', (score, rate) => {
    expect(interestRateFor(score)).toBe(rate)
  })
})

describe('maxAffordableAmount', () => {
  it('finds the largest loan the payment covers, rounded down to R1,000', () => {
    // R8,000/month at 12.5% over 24 months covers ~R169,107
    expect(maxAffordableAmount(8000, 12.5, 24)).toBe(169000)
  })

  it('handles 0% interest', () => {
    expect(maxAffordableAmount(1000, 0, 12)).toBe(12000)
  })

  it('never exceeds the product maximum', () => {
    expect(maxAffordableAmount(100000, 12.5, 60)).toBe(300000)
  })

  it('is 0 when nothing can be paid', () => {
    expect(maxAffordableAmount(0, 12.5, 24)).toBe(0)
  })
})

describe('assessEligibility', () => {
  describe('with the spec example', () => {
    const result = assessEligibility(SPEC_EXAMPLE)

    it('is eligible, low risk, with the spec’s approval likelihood', () => {
      expect(result.eligibilityResult).toMatchObject({
        isEligible: true,
        riskCategory: 'low',
        approvalLikelihood: 85,
      })
      expect(result.eligibilityResult.decisionReason).toBe(
        'The repayment of R7,096 a month fits within 80% of your disposable income of R10,000.',
      )
    })

    it('recommends the requested amount at the credit-score rate', () => {
      expect(result.recommendedLoan).toEqual({
        maxAmount: 169000,
        recommendedAmount: 150000,
        interestRate: 12.5,
        monthlyPayment: 7096.1,
        totalRepayment: 170306.3,
      })
    })

    it('matches the spec’s affordability analysis, except loan-to-income', () => {
      expect(result.affordabilityAnalysis).toEqual({
        disposableIncome: 10000,
        debtToIncomeRatio: 20,
        loanToIncomeRatio: 50, // R150,000 ÷ R300,000 a year; the spec's 60 has no stated basis
        affordabilityScore: 'good',
      })
    })
  })

  it('recommends a smaller amount when the repayment is over budget', () => {
    const result = assessEligibility(withChanges({ loanDetails: { requestedAmount: 250000 } }))

    expect(result.eligibilityResult.isEligible).toBe(false)
    expect(result.recommendedLoan.recommendedAmount).toBe(169000)
    expect(result.recommendedLoan.monthlyPayment).toBeLessThanOrEqual(8000)
    expect(result.eligibilityResult.decisionReason).toMatch(/could afford up to R169,000/)
    expect(result.eligibilityResult.approvalLikelihood).toBeGreaterThan(0)
  })

  it('recommends nothing when even the minimum loan is unaffordable', () => {
    const result = assessEligibility(
      withChanges({
        financialInfo: { monthlyIncome: 6000, monthlyExpenses: 5900, existingDebt: 0 },
      }),
    )

    expect(result.eligibilityResult).toMatchObject({ isEligible: false, approvalLikelihood: 0 })
    expect(result.recommendedLoan).toMatchObject({
      recommendedAmount: 0,
      monthlyPayment: 0,
      totalRepayment: 0,
    })
    expect(result.eligibilityResult.decisionReason).toMatch(/can't cover .* minimum loan/)
  })

  it.each<[string, Overrides, RegExp]>([
    ['too young', { personalInfo: { age: 17 } }, /aged 18 to 65/],
    ['too old', { personalInfo: { age: 66 } }, /aged 18 to 65/],
    ['unemployed', { personalInfo: { employmentStatus: 'unemployed' } }, /regular income/],
    ['recently employed', { personalInfo: { employmentDuration: 2 } }, /3 months/],
    ['income below minimum', { financialInfo: { monthlyIncome: 4999 } }, /at least R5,000/],
    ['expenses use all income', { financialInfo: { monthlyExpenses: 25000 } }, /no income/],
    ['debt above 40% of income', { financialInfo: { existingDebt: 10001 } }, /above 40%/],
    ['amount above maximum', { loanDetails: { requestedAmount: 300001 } }, /R5,000 and R300,000/],
    ['term too short', { loanDetails: { loanTerm: 5 } }, /6 and 60 months/],
  ])('declines when %s', (_, changes, reason) => {
    const result = assessEligibility(withChanges(changes))

    expect(result.eligibilityResult).toMatchObject({
      isEligible: false,
      approvalLikelihood: 0,
      riskCategory: 'high',
    })
    expect(result.eligibilityResult.decisionReason).toMatch(reason)
    expect(result.recommendedLoan.maxAmount).toBe(0)
  })

  it('does not require retirees to be employed', () => {
    const result = assessEligibility(
      withChanges({
        personalInfo: { employmentStatus: 'retired', employmentDuration: 0, age: 62 },
      }),
    )
    expect(result.eligibilityResult.isEligible).toBe(true)
  })

  it.each<[string, Overrides, string]>([
    ['good credit, low debt', {}, 'low'],
    ['no credit score', { financialInfo: { creditScore: undefined } }, 'medium'],
    ['debt between 20% and 35%', { financialInfo: { existingDebt: 7500 } }, 'medium'],
    ['debt above 35%', { financialInfo: { existingDebt: 9000 } }, 'high'],
    ['poor credit score', { financialInfo: { creditScore: 500 } }, 'high'],
  ])('rates %s as %s risk', (_, changes, risk) => {
    expect(assessEligibility(withChanges(changes)).eligibilityResult.riskCategory).toBe(risk)
  })

  it.each<[number, string]>([
    [15000, 'good'], // R10,000 of R25,000 left (40%)
    [20000, 'fair'], // 20% left
    [22000, 'poor'], // 12% left
  ])('scores affordability with R%s expenses as %s', (monthlyExpenses, score) => {
    const result = assessEligibility(
      withChanges({ financialInfo: { monthlyExpenses }, loanDetails: { requestedAmount: 5000 } }),
    )
    expect(result.affordabilityAnalysis.affordabilityScore).toBe(score)
  })

  it('never gives an approval likelihood above 95%', () => {
    const result = assessEligibility(
      withChanges({
        financialInfo: { creditScore: 850, existingDebt: 0 },
        loanDetails: { requestedAmount: 5000 },
      }),
    )
    expect(result.eligibilityResult.approvalLikelihood).toBe(95)
  })
})
