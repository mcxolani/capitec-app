import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { fillSpecExample } from '@/test/loanForm'
import { loadValidationRules } from '@/test/loanRules'
import type { ValidationRules } from '@/types/loan'
import LoanForm from './LoanForm'

let rules: ValidationRules

beforeAll(async () => {
  rules = await loadValidationRules()
})

const renderForm = (submitting = false) => {
  const onSubmit = vi.fn()
  render(<LoanForm rules={rules} submitting={submitting} onSubmit={onSubmit} />)
  return { onSubmit }
}

const field = (name: string | RegExp) => screen.getByLabelText(name)
const submit = () => userEvent.click(screen.getByRole('button', { name: 'Check eligibility' }))

describe('LoanForm', () => {
  it('groups the fields into three sections', () => {
    renderForm()

    for (const name of ['About you', 'Your finances', 'The loan']) {
      expect(screen.getByRole('group', { name })).toBeInTheDocument()
    }
  })

  it('only asks for employment duration when employed or self-employed', async () => {
    renderForm()
    const label = 'Months in current employment'
    expect(screen.queryByLabelText(label)).not.toBeInTheDocument()

    await userEvent.selectOptions(field('Employment status'), 'Self-employed')
    expect(field(label)).toBeInTheDocument()

    await userEvent.selectOptions(field('Employment status'), 'Retired')
    expect(screen.queryByLabelText(label)).not.toBeInTheDocument()
  })

  it('submits the spec example as an eligibility request', async () => {
    const { onSubmit } = renderForm()

    await fillSpecExample()
    await submit()

    expect(onSubmit).toHaveBeenCalledWith({
      personalInfo: { age: 35, employmentStatus: 'employed', employmentDuration: 24 },
      financialInfo: {
        monthlyIncome: 25000,
        monthlyExpenses: 15000,
        existingDebt: 5000,
        creditScore: 650,
      },
      loanDetails: { requestedAmount: 150000, loanTerm: 24, loanPurpose: 'home_improvement' },
    })
  })

  it('shows every error on submit and focuses the first invalid field', async () => {
    const { onSubmit } = renderForm()

    await submit()

    expect(onSubmit).not.toHaveBeenCalled()
    expect(field('Age')).toHaveFocus()
    expect(field('Age')).toHaveAttribute('aria-invalid', 'true')
    expect(field('Age')).toHaveAccessibleDescription('Age must be between 18 and 65')
    expect(field('Loan amount (R)')).toHaveAccessibleDescription(
      'Loan amount must be between R5,000 and R300,000',
    )
    expect(field(/credit score/i)).toHaveAttribute('aria-invalid', 'false')
    expect(field(/credit score/i)).not.toHaveAttribute('aria-describedby')
  })

  it('does not show errors while typing before the first submit', async () => {
    renderForm()

    await userEvent.type(field('Age'), '12')

    expect(screen.queryByText('Age must be between 18 and 65')).not.toBeInTheDocument()
  })

  it('clears an error as soon as the field is fixed after submitting', async () => {
    renderForm()
    await submit()
    expect(screen.getByText('Age must be between 18 and 65')).toBeInTheDocument()

    await userEvent.type(field('Age'), '40')

    expect(screen.queryByText('Age must be between 18 and 65')).not.toBeInTheDocument()
    expect(field('Age')).toHaveAttribute('aria-invalid', 'false')
  })

  it('disables the button while a check is in progress', () => {
    renderForm(true)
    expect(screen.getByRole('button', { name: 'Checking…' })).toBeDisabled()
  })
})
