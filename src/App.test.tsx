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
    expect(screen.getByRole('heading', { name: 'Home Page' })).toBeInTheDocument()
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('lazy-loads other pages', async () => {
    visit('/loan-eligibility')
    expect(
      await screen.findByRole('heading', { name: 'Loan Eligibility Simulator' }),
    ).toBeInTheDocument()
  })

  it('shows a not-found page for unknown URLs, with a way home', async () => {
    visit('/does-not-exist')
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('link', { name: 'Go to home' }))

    expect(screen.getByRole('heading', { name: 'Home Page' })).toBeInTheDocument()
  })
})
