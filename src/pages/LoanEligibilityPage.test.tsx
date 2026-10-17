import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { checkEligibility, fetchValidationRules } from '@/api/loanApi'
import { fillSpecExample } from '@/test/loanForm'
import LoanEligibilityPage from './LoanEligibilityPage'

// real mocked API by default; individual tests make calls fail
vi.mock('@/api/loanApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/loanApi')>()
  return {
    ...actual,
    fetchValidationRules: vi.fn(actual.fetchValidationRules),
    checkEligibility: vi.fn(actual.checkEligibility),
  }
})

const submit = () => userEvent.click(screen.getByRole('button', { name: 'Check eligibility' }))

describe('LoanEligibilityPage', () => {
  it('shows the form once the validation rules have loaded', async () => {
    render(<LoanEligibilityPage />)

    expect(screen.getByRole('heading', { name: 'Loan Eligibility Simulator' })).toBeInTheDocument()
    expect(screen.getByText('Loading…')).toBeInTheDocument()
    expect(await screen.findByRole('group', { name: 'About you' })).toBeInTheDocument()
    expect(screen.getByText(/your estimate will appear here/i)).toBeInTheDocument()
  })

  it('checks eligibility and moves focus to the result', async () => {
    render(<LoanEligibilityPage />)
    await screen.findByRole('group', { name: 'About you' })

    await fillSpecExample()
    await submit()

    expect(screen.getByRole('button', { name: 'Checking…' })).toBeDisabled()
    const heading = await screen.findByRole('heading', {
      name: "You're likely eligible for R150,000",
    })
    expect(heading).toHaveFocus()
    expect(screen.queryByText(/your estimate will appear here/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Check eligibility' })).toBeEnabled()
  })

  it('updates the result when the form is submitted again', async () => {
    render(<LoanEligibilityPage />)
    await screen.findByRole('group', { name: 'About you' })
    await fillSpecExample()
    await submit()
    await screen.findByRole('heading', { name: /likely eligible/ })

    const amount = screen.getByLabelText('Loan amount (R)')
    await userEvent.clear(amount)
    await userEvent.type(amount, '250000')
    await submit()

    expect(
      await screen.findByRole('heading', { name: 'You could qualify for up to R169,000' }),
    ).toHaveFocus()
  })

  it('lets the user retry when the eligibility check fails', async () => {
    vi.mocked(checkEligibility).mockRejectedValueOnce(new Error('network'))
    render(<LoanEligibilityPage />)
    await screen.findByRole('group', { name: 'About you' })
    await fillSpecExample()

    await submit()

    expect(await screen.findByRole('alert')).toHaveTextContent(/couldn’t check your eligibility/)
    expect(screen.getByRole('button', { name: 'Check eligibility' })).toBeEnabled()

    await submit()

    expect(await screen.findByRole('heading', { name: /likely eligible/ })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('offers a retry when the simulator fails to load', async () => {
    vi.mocked(fetchValidationRules).mockRejectedValueOnce(new Error('network'))
    render(<LoanEligibilityPage />)

    expect(await screen.findByRole('alert')).toHaveTextContent(/couldn’t load/)

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))

    expect(await screen.findByRole('group', { name: 'About you' })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
