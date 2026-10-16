import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { rosebank, sandton } from '@/test/fixtures'
import BranchList from './BranchList'

const renderList = (props: Partial<ComponentProps<typeof BranchList>> = {}) => {
  const onSelect = vi.fn()
  render(
    <BranchList
      branches={[sandton, rosebank]}
      selectedId={null}
      onSelect={onSelect}
      hasOrigin
      loading={false}
      radiusKm={10}
      {...props}
    />,
  )
  return { onSelect }
}

describe('BranchList', () => {
  it('prompts for a location before one is chosen', () => {
    renderList({ hasOrigin: false })
    expect(screen.getByText(/search for an address or use your location/i)).toBeInTheDocument()
  })

  it('shows a loading message while branches load', () => {
    renderList({ loading: true })
    expect(screen.getByText('Loading branches…')).toBeInTheDocument()
  })

  it('suggests a larger radius when nothing is found', () => {
    renderList({ branches: [], radiusKm: 5 })
    expect(screen.getByText('No branches within 5 km. Try a larger radius.')).toBeInTheDocument()
  })

  it('lists branches with a count', () => {
    renderList()
    expect(screen.getByText('2 branches within 10 km')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })

  it('uses the singular for one branch', () => {
    renderList({ branches: [sandton] })
    expect(screen.getByText('1 branch within 10 km')).toBeInTheDocument()
  })

  it('selects a branch when it is clicked', async () => {
    const { onSelect } = renderList()
    await userEvent.click(screen.getByRole('button', { name: /rosebank/i }))
    expect(onSelect).toHaveBeenCalledWith('rosebank')
  })
})
