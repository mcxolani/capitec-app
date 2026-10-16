import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { rosebank, sandton } from '@/test/fixtures'
import BranchInfoCard from './BranchInfoCard'

describe('BranchInfoCard', () => {
  it('shows the branch details', () => {
    render(<BranchInfoCard branch={sandton} />)

    expect(screen.getByRole('heading', { name: 'Sandton City' })).toBeInTheDocument()
    expect(screen.getByText(sandton.address)).toBeInTheDocument()
    expect(screen.getByText('400 m')).toBeInTheDocument()
    expect(screen.getByText(sandton.hours)).toBeInTheDocument()
  })

  it('links the phone number without spaces', () => {
    render(<BranchInfoCard branch={sandton} />)
    expect(screen.getByRole('link', { name: '011 555 0101' })).toHaveAttribute(
      'href',
      'tel:0115550101',
    )
  })

  it('leaves out the phone row when there is no number', () => {
    render(<BranchInfoCard branch={rosebank} />)
    expect(screen.queryByText('Phone')).not.toBeInTheDocument()
  })

  it('opens directions in a new tab', () => {
    render(<BranchInfoCard branch={sandton} />)
    const link = screen.getByRole('link', { name: 'Navigate' })

    expect(link).toHaveAttribute('href', expect.stringContaining('destination=-26.1076%2C28.0567'))
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('can hide the title', () => {
    render(<BranchInfoCard branch={sandton} hideTitle />)
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })
})
