import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  LOAN_ELIGIBILITY_RESPONSE,
  LOAN_PRODUCTS,
  LOAN_RATE_RESPONSE,
  LOAN_VALIDATION_RULES,
} from '@/test/loanData'
import type { EligibilityRequest, RateRequest } from '@/types/loan'
import { calculateRate, checkEligibility, fetchLoanProducts, fetchValidationRules } from './loanApi'

describe('loanApi', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn((input: string) =>
        Promise.resolve({
          ok: true,
          json: async () =>
            input === '/api/loans/products'
              ? { products: LOAN_PRODUCTS }
              : input === '/api/loans/eligibility'
                ? LOAN_ELIGIBILITY_RESPONSE
                : input === '/api/loans/calculate-rate'
                  ? LOAN_RATE_RESPONSE
                  : LOAN_VALIDATION_RULES,
        }),
      ),
    )
  })

  describe('fetchLoanProducts', () => {
    it('loads the personal loan and vehicle finance products', async () => {
      const products = await fetchLoanProducts()

      expect(products.map((p) => p.id)).toEqual(['personal_loan', 'vehicle_loan'])
      expect(fetch).toHaveBeenCalledWith('/api/loans/products', undefined)
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
    it('loads the validation rules and messages', async () => {
      const rules = await fetchValidationRules()

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
      expect(fetch).toHaveBeenCalledWith('/api/loans/validation-rules', undefined)
    })
  })

  describe('checkEligibility', () => {
    it('posts the request and returns the backend response', async () => {
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

      const result = await checkEligibility(request)

      expect(result).toEqual(LOAN_ELIGIBILITY_RESPONSE)
      expect(fetch).toHaveBeenCalledWith('/api/loans/eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      })
    })
  })

  describe('calculateRate', () => {
    it('posts the request and returns the backend response', async () => {
      const request: RateRequest = {
        loanAmount: 150000,
        loanTerm: 24,
        creditScore: 650,
        loanType: 'personal_loan',
      }

      const result = await calculateRate(request)

      expect(result).toEqual(LOAN_RATE_RESPONSE)
      expect(fetch).toHaveBeenCalledWith('/api/loans/calculate-rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      })
    })
  })
})
