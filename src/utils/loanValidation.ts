import type {
  EligibilityRequest,
  EmploymentStatus,
  LoanPurpose,
  NumberRule,
  ValidationRules,
} from '@/types/loan'

// Raw form input: everything is a string until it has been validated
export interface LoanFormValues {
  age: string
  employmentStatus: string
  employmentDuration: string
  monthlyIncome: string
  monthlyExpenses: string
  existingDebt: string
  creditScore: string
  requestedAmount: string
  loanTerm: string
  loanPurpose: string
}

export type LoanFormErrors = Partial<Record<keyof LoanFormValues, string>>

export const EMPTY_LOAN_FORM: LoanFormValues = {
  age: '',
  employmentStatus: '',
  employmentDuration: '',
  monthlyIncome: '',
  monthlyExpenses: '',
  existingDebt: '',
  creditScore: '',
  requestedAmount: '',
  loanTerm: '',
  loanPurpose: '',
}

export const PERSONAL_LOAN_PURPOSES: LoanPurpose[] = [
  'debt_consolidation',
  'home_improvement',
  'education',
  'medical',
  'other',
]

// Accepts "25000", "25 000", "25,000" and "R25,000"; returns NaN for anything else
export function parseAmount(input: string): number {
  const cleaned = input.trim().replace(/^R/i, '').replace(/[\s,]/g, '')
  return cleaned === '' || !/^\d+(\.\d+)?$/.test(cleaned) ? NaN : Number(cleaned)
}

const isBlank = (input: string) => input.trim() === ''

// Returns the rule's message if the input breaks it, otherwise null
function checkNumber(input: string, rule: NumberRule, wholeNumber = false): string | null {
  if (isBlank(input)) return rule.required ? rule.errorMessage : null
  const value = parseAmount(input)
  if (Number.isNaN(value)) return rule.errorMessage
  if (wholeNumber && !Number.isInteger(value)) return rule.errorMessage
  if (rule.min !== undefined && value < rule.min) return rule.errorMessage
  if (rule.max !== undefined && value > rule.max) return rule.errorMessage
  return null
}

// unemployed and retired applicants have no current employment to measure
const needsEmploymentDuration = (status: string) =>
  status === 'employed' || status === 'self_employed'

export function validateLoanForm(
  values: LoanFormValues,
  rules: ValidationRules,
): { errors: LoanFormErrors; request: EligibilityRequest | null } {
  const { personalInfo, financialInfo, loanDetails } = rules
  const errors: LoanFormErrors = {}
  const set = (field: keyof LoanFormValues, error: string | null) => {
    if (error) errors[field] = error
  }

  set('age', checkNumber(values.age, personalInfo.age, true))

  const statusRule = personalInfo.employmentStatus
  if (!statusRule.options.includes(values.employmentStatus as EmploymentStatus))
    set('employmentStatus', statusRule.errorMessage)

  if (needsEmploymentDuration(values.employmentStatus))
    set(
      'employmentDuration',
      checkNumber(values.employmentDuration, personalInfo.employmentDuration, true),
    )

  set('monthlyIncome', checkNumber(values.monthlyIncome, financialInfo.monthlyIncome))
  set('monthlyExpenses', checkNumber(values.monthlyExpenses, financialInfo.monthlyExpenses))
  // not in the spec's rules: optional, and blank means none
  set(
    'existingDebt',
    checkNumber(values.existingDebt, {
      min: 0,
      required: false,
      errorMessage: 'Existing debt must be 0 or more',
    }),
  )
  set('creditScore', checkNumber(values.creditScore, financialInfo.creditScore, true))

  set('requestedAmount', checkNumber(values.requestedAmount, loanDetails.requestedAmount))
  set('loanTerm', checkNumber(values.loanTerm, loanDetails.loanTerm, true))
  if (!PERSONAL_LOAN_PURPOSES.includes(values.loanPurpose as LoanPurpose))
    set('loanPurpose', 'Please select a loan purpose')

  if (Object.keys(errors).length > 0) return { errors, request: null }

  return {
    errors,
    request: {
      personalInfo: {
        age: parseAmount(values.age),
        employmentStatus: values.employmentStatus as EmploymentStatus,
        employmentDuration: needsEmploymentDuration(values.employmentStatus)
          ? parseAmount(values.employmentDuration)
          : 0,
      },
      financialInfo: {
        monthlyIncome: parseAmount(values.monthlyIncome),
        monthlyExpenses: parseAmount(values.monthlyExpenses),
        existingDebt: isBlank(values.existingDebt) ? 0 : parseAmount(values.existingDebt),
        ...(isBlank(values.creditScore) ? {} : { creditScore: parseAmount(values.creditScore) }),
      },
      loanDetails: {
        requestedAmount: parseAmount(values.requestedAmount),
        loanTerm: parseAmount(values.loanTerm),
        loanPurpose: values.loanPurpose as LoanPurpose,
      },
    },
  }
}
