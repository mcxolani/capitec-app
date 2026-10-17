import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'

const visit = (path: string) => {
  window.history.pushState({}, '', path)
  render(<App />)
}

describe('App routing', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/')
  })

  it('renders the home page inside the layout', () => {
    visit('/')
    expect(screen.getByRole('heading', { name: 'What would you like to do?' })).toBeInTheDocument()
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Branch Locator' })).toHaveAttribute(
      'href',
      '/branch-locator',
    )
    expect(screen.getByRole('link', { name: 'Loan Eligibility' })).toHaveAttribute(
      'href',
      '/loan-eligibility',
    )
    expect(screen.getByRole('link', { name: 'Spending Insights' })).toHaveAttribute(
      'href',
      '/spending-insights',
    )
  })

  it('opens the loan simulator from the home page', async () => {
    visit('/')
    await userEvent.click(screen.getByRole('link', { name: 'Check eligibility' }))
    expect(
      await screen.findByRole('heading', { name: 'Loan Eligibility Simulator' }),
    ).toBeInTheDocument()
  })

  it('shows a not-found page for unknown URLs, with a way home', async () => {
    visit('/does-not-exist')
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('link', { name: 'Go to home' }))

    expect(screen.getByRole('heading', { name: 'What would you like to do?' })).toBeInTheDocument()
  })
})
