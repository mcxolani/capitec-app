import { useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import type {
  EligibilityRequest,
  EmploymentStatus,
  LoanPurpose,
  ValidationRules,
} from '@/types/loan'
import { formatRand } from '@/utils/currency'
import { EMPTY_LOAN_FORM, PERSONAL_LOAN_PURPOSES, validateLoanForm } from '@/utils/loanValidation'
import type { LoanFormErrors, LoanFormValues } from '@/utils/loanValidation'

type FieldName = keyof LoanFormValues

const EMPLOYMENT_LABELS: Record<EmploymentStatus, string> = {
  employed: 'Employed',
  self_employed: 'Self-employed',
  unemployed: 'Unemployed',
  retired: 'Retired',
}

const PURPOSE_LABELS: Partial<Record<LoanPurpose, string>> = {
  debt_consolidation: 'Debt consolidation',
  home_improvement: 'Home improvement',
  education: 'Education',
  medical: 'Medical',
  other: 'Other',
}

interface Props {
  rules: ValidationRules
  submitting: boolean
  onSubmit: (request: EligibilityRequest) => void
}

export default function LoanForm({ rules, submitting, onSubmit }: Props) {
  const formRef = useRef<HTMLFormElement>(null)
  const [values, setValues] = useState<LoanFormValues>(EMPTY_LOAN_FORM)
  const [errors, setErrors] = useState<LoanFormErrors>({})
  // errors only show after the first submit, then update as the user fixes them
  const [submitted, setSubmitted] = useState(false)

  const { requestedAmount, loanTerm } = rules.loanDetails
  const hints: Partial<Record<FieldName, string>> = {
    monthlyIncome: 'After tax',
    monthlyExpenses: 'Everything you pay each month, including debt repayments',
    existingDebt: 'The part of your expenses that goes to loans and credit',
    creditScore: 'Between 300 and 850, if you know it',
    requestedAmount: `${formatRand(requestedAmount.min ?? 0)} to ${formatRand(requestedAmount.max ?? 0)}`,
    loanTerm: `${loanTerm.min} to ${loanTerm.max} months`,
  }

  const update = (name: FieldName, value: string) => {
    const next = { ...values, [name]: value }
    setValues(next)
    if (submitted) setErrors(validateLoanForm(next, rules).errors)
  }

  // props shared by every control: id for the label, plus its hint and error for screen readers
  const control = (name: FieldName) => ({
    id: `loan-${name}`,
    name,
    value: values[name],
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby':
      [hints[name] && `loan-${name}-hint`, errors[name] && `loan-${name}-error`]
        .filter(Boolean)
        .join(' ') || undefined,
  })

  const field = (name: FieldName, label: string, input: ReactNode) => (
    <div className="loan-field">
      <label htmlFor={`loan-${name}`}>{label}</label>
      {hints[name] && (
        <p id={`loan-${name}-hint`} className="loan-field__hint">
          {hints[name]}
        </p>
      )}
      {input}
      {errors[name] && (
        <p id={`loan-${name}-error`} className="field-error">
          {errors[name]}
        </p>
      )}
    </div>
  )

  const textInput = (name: FieldName, inputMode: 'numeric' | 'decimal') => (
    <input
      {...control(name)}
      type="text"
      inputMode={inputMode}
      autoComplete="off"
      onChange={(e) => update(name, e.target.value)}
    />
  )

  const select = (name: FieldName, options: [value: string, label: string][]) => (
    <select {...control(name)} onChange={(e) => update(name, e.target.value)}>
      <option value="">Select…</option>
      {options.map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  )

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    const result = validateLoanForm(values, rules)
    setErrors(result.errors)

    if (result.request) {
      onSubmit(result.request)
      return
    }
    // read from the result, not the DOM: the error state hasn't rendered yet
    const controls = Array.from(formRef.current?.elements ?? []) as HTMLInputElement[]
    controls.find((el) => el.name in result.errors)?.focus()
  }

  const showDuration =
    values.employmentStatus === 'employed' || values.employmentStatus === 'self_employed'

  return (
    <form ref={formRef} className="loan-form" noValidate onSubmit={handleSubmit}>
      <fieldset>
        <legend>About you</legend>
        {field('age', 'Age', textInput('age', 'numeric'))}
        {field(
          'employmentStatus',
          'Employment status',
          select(
            'employmentStatus',
            rules.personalInfo.employmentStatus.options.map((s) => [s, EMPLOYMENT_LABELS[s]]),
          ),
        )}
        {showDuration &&
          field(
            'employmentDuration',
            'Months in current employment',
            textInput('employmentDuration', 'numeric'),
          )}
      </fieldset>

      <fieldset>
        <legend>Your finances</legend>
        {field('monthlyIncome', 'Monthly income (R)', textInput('monthlyIncome', 'decimal'))}
        {field('monthlyExpenses', 'Monthly expenses (R)', textInput('monthlyExpenses', 'decimal'))}
        {field(
          'existingDebt',
          'Existing debt repayments (R, optional)',
          textInput('existingDebt', 'decimal'),
        )}
        {field('creditScore', 'Credit score (optional)', textInput('creditScore', 'numeric'))}
      </fieldset>

      <fieldset>
        <legend>The loan</legend>
        {field('requestedAmount', 'Loan amount (R)', textInput('requestedAmount', 'decimal'))}
        {field('loanTerm', 'Term (months)', textInput('loanTerm', 'numeric'))}
        {field(
          'loanPurpose',
          'Purpose',
          select(
            'loanPurpose',
            PERSONAL_LOAN_PURPOSES.map((p) => [p, PURPOSE_LABELS[p] ?? p]),
          ),
        )}
      </fieldset>

      <button type="submit" className="btn btn--primary loan-form__submit" disabled={submitting}>
        {submitting ? 'Checking…' : 'Check eligibility'}
      </button>
    </form>
  )
}
