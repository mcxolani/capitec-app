import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation, useNavigate } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { spendingApi } from '@/api/spendingApi'
import SpendingInsightsPage from './SpendingInsightsPage'

vi.mock('@/api/spendingApi', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/api/spendingApi')>()
  return {
    ...original,
    spendingApi: original.createSpendingApi(new Date('2026-10-16T12:00:00Z'), 0),
  }
})

function Location() {
  const location = useLocation()
  const navigate = useNavigate()
  return (
    <>
      <output aria-label="Current URL">{location.search}</output>
      <button onClick={() => navigate(-1)}>Back</button>
    </>
  )
}

function visit(search = '') {
  return render(
    <MemoryRouter initialEntries={[`/spending-insights${search}`]}>
      <SpendingInsightsPage />
      <Location />
    </MemoryRouter>,
  )
}

describe('Spending insights page', () => {
  it('reloads only transactions when sorting changes, including back navigation', async () => {
    const user = userEvent.setup()
    const otherRequests = [
      vi.spyOn(spendingApi, 'profile'),
      vi.spyOn(spendingApi, 'filters'),
      vi.spyOn(spendingApi, 'summary'),
      vi.spyOn(spendingApi, 'categories'),
      vi.spyOn(spendingApi, 'trends'),
      vi.spyOn(spendingApi, 'goals'),
    ]
    const transactions = vi.spyOn(spendingApi, 'transactions')
    visit('?period=90d')
    await screen.findByRole('button', { name: 'Load more' })
    const initialCounts = otherRequests.map((request) => request.mock.calls.length)

    await user.selectOptions(screen.getByLabelText('Sort by'), 'amount_desc')
    await screen.findByRole('button', { name: 'Load more' })
    expect(transactions).toHaveBeenLastCalledWith(
      expect.objectContaining({ period: '90d', sortBy: 'amount_desc' }),
    )
    expect(transactions).toHaveBeenCalledTimes(2)
    expect(otherRequests.map((request) => request.mock.calls.length)).toEqual(initialCounts)

    await user.click(screen.getByRole('button', { name: 'Back' }))
    await screen.findByRole('button', { name: 'Load more' })
    expect(screen.getByLabelText('Sort by')).toHaveValue('date_desc')
    expect(transactions).toHaveBeenCalledTimes(3)
    expect(otherRequests.map((request) => request.mock.calls.length)).toEqual(initialCounts)
  })

  it('preserves draft dates across category and sort changes, but clears them on reset or a preset', async () => {
    const user = userEvent.setup()
    visit()
    await screen.findByText('John Doe')
    fireEvent.change(screen.getByLabelText('From'), { target: { value: '2026-09-01' } })
    fireEvent.change(screen.getByLabelText('To'), { target: { value: '2026-09-30' } })

    await user.selectOptions(screen.getByLabelText('Category'), 'Dining')
    await user.selectOptions(screen.getByLabelText('Sort by'), 'amount_desc')
    expect(screen.getByLabelText('From')).toHaveValue('2026-09-01')
    expect(screen.getByLabelText('To')).toHaveValue('2026-09-30')
    expect(screen.getByLabelText('Current URL')).not.toHaveTextContent('startDate')

    await user.click(screen.getByRole('button', { name: 'Reset filters' }))
    expect(screen.getByLabelText('From')).toHaveValue('')
    expect(screen.getByLabelText('To')).toHaveValue('')

    fireEvent.change(screen.getByLabelText('From'), { target: { value: '2026-09-01' } })
    await user.click(screen.getByRole('button', { name: 'Last 30 days' }))
    expect(screen.getByLabelText('From')).toHaveValue('')
  })

  it('loads the dashboard, filters every applicable section and preserves back navigation', async () => {
    const user = userEvent.setup()
    const summary = vi.spyOn(spendingApi, 'summary')
    const categories = vi.spyOn(spendingApi, 'categories')
    const trends = vi.spyOn(spendingApi, 'trends')
    const goals = vi.spyOn(spendingApi, 'goals')
    const transactions = vi.spyOn(spendingApi, 'transactions')
    visit()
    expect(await screen.findByText('John Doe')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Last 90 days' }))
    await user.selectOptions(screen.getByLabelText('Category'), 'Dining')
    await waitFor(() =>
      expect(summary).toHaveBeenLastCalledWith(
        expect.objectContaining({ period: '90d', category: 'Dining' }),
      ),
    )
    expect(categories).toHaveBeenLastCalledWith(
      expect.objectContaining({ period: '90d', category: 'Dining' }),
    )
    expect(trends).toHaveBeenLastCalledWith(12, 'Dining')
    expect(goals).toHaveBeenLastCalledWith('Dining')
    expect(transactions).toHaveBeenLastCalledWith(
      expect.objectContaining({ period: '90d', category: 'Dining' }),
    )
    expect(screen.getByLabelText('Current URL')).toHaveTextContent('period=90d&category=Dining')
    expect(await screen.findByText('No monthly budget set for this category.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Back' }))
    await waitFor(() => expect(screen.getByLabelText('Category')).toHaveValue(''))
    expect(screen.getByRole('button', { name: 'Last 90 days' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('restores URL filters, validates custom dates, and clears them when choosing a preset', async () => {
    const user = userEvent.setup()
    visit('?period=90d&category=Groceries')
    await screen.findByText('John Doe')
    expect(screen.getByLabelText('Category')).toHaveValue('Groceries')
    fireEvent.change(screen.getByLabelText('From'), { target: { value: '2020-02-01' } })
    fireEvent.change(screen.getByLabelText('To'), { target: { value: '2020-01-01' } })
    await user.click(screen.getByRole('button', { name: 'Apply dates' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Start date must be on or before end date')
    fireEvent.change(screen.getByLabelText('To'), { target: { value: '2020-02-20' } })
    await user.click(screen.getByRole('button', { name: 'Apply dates' }))
    expect(
      await screen.findByText(
        'No transactions match these filters. Try another period or category.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Current URL')).toHaveTextContent(
      'startDate=2020-02-01&endDate=2020-02-20',
    )
    await user.click(screen.getByRole('button', { name: 'Last 7 days' }))
    expect(screen.getByLabelText('From')).toHaveValue('')
    expect(screen.getByLabelText('Current URL')).not.toHaveTextContent('startDate')
  })

  it('loads more transactions, sorts and resets pagination after filter changes', async () => {
    const user = userEvent.setup()
    visit('?period=1y')
    await screen.findByRole('button', { name: 'Load more' })
    const region = screen.getByRole('region', { name: 'Transactions' })
    expect(within(region).getAllByRole('row')).toHaveLength(21)
    await user.click(screen.getByRole('button', { name: 'Load more' }))
    await waitFor(() => expect(within(region).getAllByRole('row')).toHaveLength(41))
    await user.selectOptions(screen.getByLabelText('Sort by'), 'amount_desc')
    await waitFor(() => expect(within(region).getAllByRole('row')).toHaveLength(21))
    const amounts = within(region)
      .getAllByRole('row')
      .slice(1)
      .map((row) =>
        Number(within(row).getAllByRole('cell').at(-1)?.textContent?.replace(/[R,]/g, '')),
      )
    expect(amounts).toEqual([...amounts].sort((a, b) => b - a))
    await user.selectOptions(screen.getByLabelText('Category'), 'Dining')
    await waitFor(() => expect(within(region).getAllByRole('row')).toHaveLength(21))
    expect(within(region).queryByText(/Showing 40/)).not.toBeInTheDocument()
  })

  it('keeps other sections available when one fails, then retries it', async () => {
    const user = userEvent.setup()
    vi.spyOn(spendingApi, 'categories').mockRejectedValueOnce(new Error('Network error'))
    visit()
    expect(await screen.findByRole('alert')).toHaveTextContent('This section couldn’t load')
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Transactions' })).toHaveTextContent('Showing')
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument())
    expect(
      await screen.findByText('Select a category to filter your spending.'),
    ).toBeInTheDocument()
  })

  it('retains loaded transactions when loading more fails, and supports retry', async () => {
    const user = userEvent.setup()
    visit('?period=90d')
    await screen.findByRole('button', { name: 'Load more' })
    vi.spyOn(spendingApi, 'transactions').mockRejectedValueOnce(new Error('Network error'))
    await user.click(screen.getByRole('button', { name: 'Load more' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Your current transactions are still shown',
    )
    const region = screen.getByRole('region', { name: 'Transactions' })
    expect(within(region).getAllByRole('row')).toHaveLength(21)
    await user.click(screen.getByRole('button', { name: 'Try loading more again' }))
    await waitFor(() => expect(within(region).getAllByRole('row')).toHaveLength(41))
  })

  it('handles malformed URL filters safely', async () => {
    visit('?period=invalid&category=Unknown&startDate=invalid')
    await screen.findByText('John Doe')
    expect(screen.getByRole('alert')).toHaveTextContent('date range in this link is invalid')
    expect(screen.getByRole('button', { name: 'Last 30 days' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByLabelText('Category')).toHaveValue('')
  })
})
