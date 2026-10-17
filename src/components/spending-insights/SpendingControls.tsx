import { useState, type FormEvent } from 'react'
import * as ToggleGroup from '@radix-ui/react-toggle-group'
import type { SpendingFilters, SpendingQuery } from '@/types/spending'

export default function SpendingControls({
  filters,
  query,
  update,
}: {
  filters: SpendingFilters
  query: SpendingQuery
  update: (changes: Record<string, string | undefined>) => void
}) {
  const [startDate, setStartDate] = useState(query.startDate ?? '')
  const [endDate, setEndDate] = useState(query.endDate ?? '')
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!startDate || !endDate) {
      setError('Choose a valid start and end date.')
    } else if (startDate > endDate) {
      setError('Start date must be on or before end date.')
    } else {
      setError('')
      update({ startDate, endDate })
    }
  }

  function selectPeriod(period: string) {
    setStartDate('')
    setEndDate('')
    setError('')
    update({ period, startDate: undefined, endDate: undefined })
  }

  function resetFilters() {
    setStartDate('')
    setEndDate('')
    setError('')
    update({ period: undefined, startDate: undefined, endDate: undefined, category: undefined })
  }

  return (
    <div className="spending-controls">
      <div className="spending-controls__row">
        <ToggleGroup.Root
          type="single"
          value={query.startDate ? '' : query.period}
          onValueChange={(period) => selectPeriod(period || query.period || '30d')}
          className="spending-presets"
          aria-label="Spending period"
        >
          {filters.dateRangePresets.map((preset) => (
            <ToggleGroup.Item key={preset.value} value={preset.value} className="btn">
              {preset.label}
            </ToggleGroup.Item>
          ))}
        </ToggleGroup.Root>
        <div className="spending-field">
          <label htmlFor="spending-category">Category</label>
          <select
            id="spending-category"
            value={query.category ?? ''}
            onChange={(event) => update({ category: event.target.value })}
          >
            <option value="">All categories</option>
            {filters.categories.map((category) => (
              <option key={category.name}>{category.name}</option>
            ))}
          </select>
        </div>
      </div>
      <form className="spending-date-form" noValidate onSubmit={handleSubmit}>
        <div className="spending-field">
          <label htmlFor="spending-start">From</label>
          <input
            id="spending-start"
            type="date"
            value={startDate}
            aria-invalid={!!error}
            aria-describedby={error ? 'spending-date-error' : undefined}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </div>
        <div className="spending-field">
          <label htmlFor="spending-end">To</label>
          <input
            id="spending-end"
            type="date"
            value={endDate}
            aria-invalid={!!error}
            aria-describedby={error ? 'spending-date-error' : undefined}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </div>
        <button type="submit" className="btn">
          Apply dates
        </button>
        {(query.category || query.startDate || query.period !== '30d') && (
          <button type="button" className="btn" onClick={resetFilters}>
            Reset filters
          </button>
        )}
        {error && (
          <p className="field-error" id="spending-date-error" role="alert">
            {error}
          </p>
        )}
      </form>
      <p className="spending-muted spending-controls__hint">
        Date filters apply to spending and transactions. Trends show monthly history; budgets cover
        this month.
      </p>
    </div>
  )
}
