import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import RadiusSelect from './RadiusSelect'

describe('RadiusSelect', () => {
  it('shows the current radius', () => {
    render(<RadiusSelect value={10} onChange={vi.fn()} />)
    expect(screen.getByRole('combobox', { name: 'Radius' })).toHaveValue('10')
  })

  it('reports the chosen radius as a number', async () => {
    const onChange = vi.fn()
    render(<RadiusSelect value={10} onChange={onChange} />)

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Radius' }), '25 km')

    expect(onChange).toHaveBeenCalledWith(25)
  })
})
