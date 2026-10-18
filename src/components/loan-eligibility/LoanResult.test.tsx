import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import type { EligibilityRequest } from '@/types/loan'
import { assessEligibility } from '@/utils/loanEligibility'
import LoanResult from './LoanResult'

// the spec's example request
const REQUEST: EligibilityRequest = {
  personalInfo: { age: 35, employmentStatus: 'employed', employmentDuration: 24 },
  financialInfo: {
    monthlyIncome: 25000,
    monthlyExpenses: 15000,
    existingDebt: 5000,
    creditScore: 650,
  },
  loanDetails: { requestedAmount: 150000, loanTerm: 24, loanPurpose: 'home_improvement' },
}

const renderResult = (
  requestedAmount: number,
  changes: Partial<EligibilityRequest['personalInfo']> = {},
) => {
  const request = {
    ...REQUEST,
    personalInfo: { ...REQUEST.personalInfo, ...changes },
    loanDetails: { ...REQUEST.loanDetails, requestedAmount },
  }
  return render(<LoanResult result={assessEligibility(request)} loanTerm={24} />)
}

// reads a <dt>/<dd> pair, e.g. figure('Monthly repayment') → 'R7,096'
const figure = (term: string) => screen.getByText(term).nextElementSibling?.textContent

describe('LoanResult', () => {
  describe('when eligible', () => {
    it('confirms the requested amount and explains why', () => {
      const { container } = renderResult(150000)

      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        "You're likely eligible for R150,000",
      )
      expect(screen.getByText(/fits within 80% of your disposable income/)).toBeInTheDocument()
      expect(container.querySelector('.loan-result')).toHaveClass('loan-result--eligible')
    })

    it('shows the loan figures', () => {
      renderResult(150000)

      expect(screen.getByRole('heading', { name: 'Your loan' })).toBeInTheDocument()
      expect(figure('Amount')).toBe('R150,000')
      expect(figure('Monthly repayment')).toBe('R7,096')
      expect(figure('Interest rate')).toBe('12.5% a year')
      expect(figure('Term')).toBe('24 months')
      expect(figure('Total repayment')).toBe('R170,306')
      expect(figure('Most you could borrow')).toBe('R169,000')
    })

    it('shows the affordability analysis', () => {
      renderResult(150000)

      expect(figure('Disposable income')).toBe('R10,000 a month')
      expect(figure('Debt-to-income')).toBe('20%')
      expect(figure('Loan-to-income')).toBe('50% of annual income')
      expect(figure('Affordability rating')).toBe('Good')
      expect(figure('Risk category')).toBe('Low')
      expect(figure('Estimated approval likelihood')).toBe('85%')
    })
  })

  it('offers a smaller loan when the request is over budget', () => {
    const { container } = renderResult(250000)

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'You could qualify for up to R169,000',
    )
    expect(screen.getByRole('heading', { name: 'Suggested loan' })).toBeInTheDocument()
    expect(figure('Amount')).toBe('R169,000')
    expect(container.querySelector('.loan-result')).toHaveClass('loan-result--partial')
  })

  it('explains a decline and leaves out the loan figures', () => {
    const { container } = renderResult(150000, { employmentStatus: 'unemployed' })

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      "You're not eligible for a loan right now",
    )
    expect(screen.getByText('A regular income from employment is required.')).toBeInTheDocument()
    expect(screen.queryByText('Monthly repayment')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Affordability' })).toBeInTheDocument()
    expect(container.querySelector('.loan-result')).toHaveClass('loan-result--declined')
  })

  it('lets the page focus the heading', () => {
    const headingRef = createRef<HTMLHeadingElement>()
    render(<LoanResult result={assessEligibility(REQUEST)} loanTerm={24} headingRef={headingRef} />)

    headingRef.current?.focus()

    expect(screen.getByRole('heading', { level: 2 })).toHaveFocus()
  })
})
