import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import Header from './Header'

const renderHeader = (path = '/') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Header />
    </MemoryRouter>,
  )

const toggle = () => screen.getByRole('button', { name: /menu/i })

describe('Header', () => {
  it('links to every page', () => {
    renderHeader()
    const nav = screen.getByRole('navigation', { name: 'Main' })

    for (const name of ['Home', 'Branch Locator', 'Loan Eligibility', 'Spending Insights']) {
      expect(nav).toContainElement(screen.getByRole('link', { name }))
    }
  })

  it('marks the current page as active', () => {
    renderHeader('/branch-locator')

    expect(screen.getByRole('link', { name: 'Branch Locator' })).toHaveClass('header__link--active')
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveClass('header__link--active')
  })

  it('opens and closes the mobile menu', async () => {
    renderHeader()
    expect(toggle()).toHaveAttribute('aria-expanded', 'false')
    expect(toggle()).toHaveAccessibleName('Open menu')

    await userEvent.click(toggle())
    expect(toggle()).toHaveAttribute('aria-expanded', 'true')
    expect(toggle()).toHaveAccessibleName('Close menu')
    expect(screen.getByRole('navigation', { name: 'Mobile' })).toBeVisible()

    await userEvent.click(toggle())
    expect(toggle()).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes the menu on Escape', async () => {
    renderHeader()
    await userEvent.click(toggle())

    await userEvent.keyboard('{Escape}')

    expect(toggle()).toHaveAttribute('aria-expanded', 'false')
    expect(toggle()).toHaveFocus()
  })

  it('closes the menu after following a link', async () => {
    renderHeader()
    await userEvent.click(toggle())

    await userEvent.click(
      within(screen.getByRole('navigation', { name: 'Mobile' })).getByRole('link', {
        name: 'Loan Eligibility',
      }),
    )

    expect(toggle()).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByRole('link', { name: 'Loan Eligibility' })).toHaveClass(
      'header__link--active',
    )
  })
})
