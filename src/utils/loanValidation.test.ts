import { beforeAll, describe, expect, it, vi } from 'vitest'
import { fetchValidationRules } from '@/api/loanApi'
import type { ValidationRules } from '@/types/loan'
import { EMPTY_LOAN_FORM, parseAmount, validateLoanForm } from './loanValidation'
import type { LoanFormValues } from './loanValidation'

let rules: ValidationRules

beforeAll(async () => {
  vi.useFakeTimers()
  const pending = fetchValidationRules()
  await vi.advanceTimersByTimeAsync(300)
  rules = await pending
  vi.useRealTimers()
})

// the spec's example request, as typed into the form
const VALID: LoanFormValues = {
  age: '35',
  employmentStatus: 'employed',
  employmentDuration: '24',
  monthlyIncome: '25000',
  monthlyExpenses: '15000',
  existingDebt: '5000',
  creditScore: '650',
  requestedAmount: '150000',
  loanTerm: '24',
  loanPurpose: 'home_improvement',
}

const validate = (changes: Partial<LoanFormValues> = {}) =>
  validateLoanForm({ ...VALID, ...changes }, rules)

describe('parseAmount', () => {
  it.each([
    ['25000', 25000],
    ['25 000', 25000],
    ['25,000', 25000],
    ['R25,000', 25000],
    [' r 1 500.50 ', 1500.5],
    ['', NaN],
    ['abc', NaN],
    ['-100', NaN],
    ['1e5', NaN],
    ['12.', NaN],
  ])('parses %j as %s', (input, expected) => {
    expect(parseAmount(input)).toBe(expected)
  })
})

describe('validateLoanForm', () => {
  it('builds the API request from valid input', () => {
    expect(validate()).toEqual({
      errors: {},
      request: {
        personalInfo: { age: 35, employmentStatus: 'employed', employmentDuration: 24 },
        financialInfo: {
          monthlyIncome: 25000,
          monthlyExpenses: 15000,
          existingDebt: 5000,
          creditScore: 650,
        },
        loanDetails: { requestedAmount: 150000, loanTerm: 24, loanPurpose: 'home_improvement' },
      },
    })
  })

  it('reports every required field on an empty form', () => {
    const { errors, request } = validateLoanForm(EMPTY_LOAN_FORM, rules)

    expect(request).toBeNull()
    expect(errors).toEqual({
      age: 'Age must be between 18 and 65',
      employmentStatus: 'Please select your employment status',
      monthlyIncome: 'Minimum monthly income of R5,000 required',
      monthlyExpenses: 'Please enter your monthly expenses',
      requestedAmount: 'Loan amount must be between R5,000 and R300,000',
      loanTerm: 'Loan term must be between 6 and 60 months',
      loanPurpose: 'Please select a loan purpose',
    })
  })

  it.each<[keyof LoanFormValues, string, string]>([
    ['age', '17', 'Age must be between 18 and 65'],
    ['age', '66', 'Age must be between 18 and 65'],
    ['age', '30.5', 'Age must be between 18 and 65'],
    ['employmentStatus', 'student', 'Please select your employment status'],
    ['employmentDuration', '2', 'Minimum 3 months employment required'],
    ['employmentDuration', '', 'Minimum 3 months employment required'],
    ['monthlyIncome', '4999', 'Minimum monthly income of R5,000 required'],
    ['monthlyIncome', 'lots', 'Minimum monthly income of R5,000 required'],
    ['monthlyExpenses', '-1', 'Please enter your monthly expenses'],
    ['existingDebt', 'x', 'Existing debt must be 0 or more'],
    ['creditScore', '299', 'Credit score must be between 300 and 850'],
    ['creditScore', '851', 'Credit score must be between 300 and 850'],
    ['requestedAmount', '4999', 'Loan amount must be between R5,000 and R300,000'],
    ['requestedAmount', '300001', 'Loan amount must be between R5,000 and R300,000'],
    ['loanTerm', '5', 'Loan term must be between 6 and 60 months'],
    ['loanTerm', '61', 'Loan term must be between 6 and 60 months'],
    ['loanTerm', '12.5', 'Loan term must be between 6 and 60 months'],
    ['loanPurpose', 'new_vehicle', 'Please select a loan purpose'],
  ])('rejects %s = %j', (field, value, message) => {
    const { errors, request } = validate({ [field]: value })

    expect(errors).toEqual({ [field]: message })
    expect(request).toBeNull()
  })

  it.each<[keyof LoanFormValues, string]>([
    ['age', '18'],
    ['age', '65'],
    ['employmentDuration', '3'],
    ['monthlyIncome', '5000'],
    ['monthlyExpenses', '0'],
    ['requestedAmount', '5000'],
    ['requestedAmount', '300000'],
    ['loanTerm', '6'],
    ['loanTerm', '60'],
    ['creditScore', '300'],
    ['creditScore', '850'],
  ])('accepts the boundary %s = %j', (field, value) => {
    expect(validate({ [field]: value }).errors).toEqual({})
  })

  it('accepts amounts typed with separators', () => {
    const { request } = validate({ monthlyIncome: 'R25 000', requestedAmount: '150,000' })

    expect(request?.financialInfo.monthlyIncome).toBe(25000)
    expect(request?.loanDetails.requestedAmount).toBe(150000)
  })

  it('treats a blank existing debt as none and leaves out a blank credit score', () => {
    const { request } = validate({ existingDebt: '', creditScore: '' })

    expect(request?.financialInfo).toEqual({
      monthlyIncome: 25000,
      monthlyExpenses: 15000,
      existingDebt: 0,
    })
  })

  it.each(['unemployed', 'retired'])(
    'does not ask %s applicants for employment duration',
    (employmentStatus) => {
      const { errors, request } = validate({ employmentStatus, employmentDuration: '' })

      expect(errors).toEqual({})
      expect(request?.personalInfo.employmentDuration).toBe(0)
    },
  )

  it('still requires employment duration when self-employed', () => {
    expect(validate({ employmentStatus: 'self_employed', employmentDuration: '' }).errors).toEqual({
      employmentDuration: 'Minimum 3 months employment required',
    })
  })
})
