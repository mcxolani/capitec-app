import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { EligibilityRequest } from '@/types/loan'
import { calculateRate, checkEligibility, fetchLoanProducts, fetchValidationRules } from './loanApi'

// resolves a mocked call by running out its simulated network delay
async function settle<T>(promise: Promise<T>): Promise<T> {
  await vi.advanceTimersByTimeAsync(300)
  return promise
}

describe('loanApi', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('waits before responding, like a network call', async () => {
    const onDone = vi.fn()
    void fetchLoanProducts().then(onDone)

    await vi.advanceTimersByTimeAsync(299)
    expect(onDone).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    expect(onDone).toHaveBeenCalled()
  })

  describe('fetchLoanProducts', () => {
    it('returns the personal loan and vehicle finance products from the spec', async () => {
      const products = await settle(fetchLoanProducts())

      expect(products.map((p) => p.id)).toEqual(['personal_loan', 'vehicle_loan'])
      expect(products[0]).toMatchObject({
        minAmount: 5000,
        maxAmount: 300000,
        minTerm: 6,
        maxTerm: 60,
        interestRateRange: { min: 10.5, max: 18.5 },
      })
    })
  })

  describe('fetchValidationRules', () => {
    it('returns the spec’s rules and messages', async () => {
      const rules = await settle(fetchValidationRules())

      expect(rules.personalInfo.age).toEqual({
        min: 18,
        max: 65,
        required: true,
        errorMessage: 'Age must be between 18 and 65',
      })
      expect(rules.financialInfo.monthlyIncome.errorMessage).toBe(
        'Minimum monthly income of R5,000 required',
      )
      expect(rules.financialInfo.creditScore.required).toBe(false)
      expect(rules.loanDetails.requestedAmount.errorMessage).toBe(
        'Loan amount must be between R5,000 and R300,000',
      )
      expect(rules.loanDetails.loanTerm).toMatchObject({ min: 6, max: 60 })
    })
  })

  describe('checkEligibility', () => {
    it('assesses the request', async () => {
      const request: EligibilityRequest = {
        personalInfo: { age: 35, employmentStatus: 'employed', employmentDuration: 24 },
        financialInfo: {
          monthlyIncome: 25000,
          monthlyExpenses: 15000,
          existingDebt: 5000,
          creditScore: 650,
        },
        loanDetails: { requestedAmount: 150000, loanTerm: 24, loanPurpose: 'home_improvement' },
      }

      const result = await settle(checkEligibility(request))

      expect(result.eligibilityResult.isEligible).toBe(true)
      expect(result.recommendedLoan.monthlyPayment).toBe(7096.1)
    })
  })

  describe('calculateRate', () => {
    it('returns the rate, totals and full schedule for a personal loan', async () => {
      const result = await settle(
        calculateRate({
          loanAmount: 150000,
          loanTerm: 24,
          creditScore: 650,
          loanType: 'personal_loan',
        }),
      )

      expect(result).toMatchObject({
        interestRate: 12.5,
        monthlyPayment: 7096.1,
        totalInterest: 20306.3,
        totalRepayment: 170306.3,
      })
      expect(result.paymentSchedule).toHaveLength(24)
      expect(result.paymentSchedule[0]).toEqual({
        month: 1,
        payment: 7096.1,
        principal: 5533.6,
        interest: 1562.5,
        balance: 144466.4,
      })
    })

    it.each([
      [850, 8.5], // best personal rate 10.5% → bottom of the vehicle range
      [650, 10.13], // 12.5% is a quarter of the way up 10.5–18.5%
      [300, 15], // worst personal rate 18.5% → top of the vehicle range
    ])('maps credit score %s to %s%% for vehicle finance', async (creditScore, rate) => {
      const result = await settle(
        calculateRate({ loanAmount: 100000, loanTerm: 48, creditScore, loanType: 'vehicle_loan' }),
      )
      expect(result.interestRate).toBe(rate)
    })
  })
})
