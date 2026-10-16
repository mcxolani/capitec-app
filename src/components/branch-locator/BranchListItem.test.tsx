import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { sandton } from '@/test/fixtures'
import BranchListItem from './BranchListItem'

describe('BranchListItem', () => {
  it('is collapsed when not selected', () => {
    render(<BranchListItem branch={sandton} selected={false} onSelect={vi.fn()} />)

    expect(screen.getByRole('button', { name: /sandton city/i })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(screen.queryByRole('link', { name: 'Navigate' })).not.toBeInTheDocument()
  })

  it('expands to show details when selected', () => {
    render(<BranchListItem branch={sandton} selected onSelect={vi.fn()} />)

    expect(screen.getByRole('button', { name: /sandton city/i })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(screen.getByRole('link', { name: 'Navigate' })).toBeInTheDocument()
  })

  it('scrolls itself into view when selected', () => {
    const scrollIntoView = vi.spyOn(Element.prototype, 'scrollIntoView')
    render(<BranchListItem branch={sandton} selected onSelect={vi.fn()} />)
    expect(scrollIntoView).toHaveBeenCalled()
  })

  it('selects on click, and deselects when clicked again', async () => {
    const onSelect = vi.fn()
    const { rerender } = render(
      <BranchListItem branch={sandton} selected={false} onSelect={onSelect} />,
    )
    const button = screen.getByRole('button', { name: /sandton city/i })

    await userEvent.click(button)
    expect(onSelect).toHaveBeenLastCalledWith('sandton-city')

    rerender(<BranchListItem branch={sandton} selected onSelect={onSelect} />)
    await userEvent.click(button)
    expect(onSelect).toHaveBeenLastCalledWith(null)
  })
})
