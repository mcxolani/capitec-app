import { useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { spendingFilters, periodDays } from '@/constants/spending'
import { isValidDate } from '@/utils/spending'

export function useSpendingFilters() {
  const [params, setParams] = useSearchParams()
  const rawPeriod = params.get('period') ?? '30d'
  const rawCategory = params.get('category')
  const startDate = params.get('startDate') ?? ''
  const endDate = params.get('endDate') ?? ''
  const sortBy = params.get('sortBy') ?? 'date_desc'

  const parsed = useMemo(() => {
    const period = Object.hasOwn(periodDays, rawPeriod) ? rawPeriod : '30d'
    const category = spendingFilters.categories.find((item) => item.name === rawCategory)?.name
    const validRange = isValidDate(startDate) && isValidDate(endDate) && startDate <= endDate
    const invalidRange = Boolean(startDate || endDate) && !validRange
    const query = {
      period,
      category,
      ...(validRange ? { startDate, endDate } : {}),
    }
    return {
      query,
      invalidRange,
    }
  }, [rawPeriod, rawCategory, startDate, endDate])

  const update = (changes: Record<string, string | undefined>) => {
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      for (const [name, value] of Object.entries(changes)) {
        if (value) next.set(name, value)
        else next.delete(name)
      }
      return next
    })
  }
  return { ...parsed, sortBy, update }
}
