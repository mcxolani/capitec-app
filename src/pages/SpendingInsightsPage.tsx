import { useCallback, useState } from 'react'
import { spendingApi } from '@/api/spendingApi'
import BudgetGoals from '@/components/spending-insights/BudgetGoals'
import CategoryBreakdown from '@/components/spending-insights/CategoryBreakdown'
import MonthlyTrends from '@/components/spending-insights/MonthlyTrends'
import ResourcePanel from '@/components/spending-insights/ResourcePanel'
import SpendingControls from '@/components/spending-insights/SpendingControls'
import SummaryCards from '@/components/spending-insights/SummaryCards'
import TransactionsList from '@/components/spending-insights/TransactionsList'
import { useSpendingFilters } from '@/hooks/useSpendingFilters'
import { useSpendingResource } from '@/hooks/useSpendingResource'
import { resolveRange } from '@/utils/spending'
import { formatDate } from '@/utils/spendingFormat'
import '@/components/spending-insights/spending-insights.css'

export default function SpendingInsightsPage() {
  const { query, sortBy, invalidRange, update } = useSpendingFilters()
  const [months, setMonths] = useState(12)
  const [today] = useState(() => new Date())
  const profile = useSpendingResource(spendingApi.profile)
  const filters = useSpendingResource(spendingApi.filters)
  const summary = useSpendingResource(useCallback(() => spendingApi.summary(query), [query]))
  const categories = useSpendingResource(useCallback(() => spendingApi.categories(query), [query]))
  const trends = useSpendingResource(
    useCallback(() => spendingApi.trends(months, query.category), [months, query.category]),
  )
  const goals = useSpendingResource(
    useCallback(() => spendingApi.goals(query.category), [query.category]),
  )
  const range = resolveRange(query, today)

  return (
    <section className="spending-page">
      <h1>Spending Insights</h1>
      <p className="spending-page__intro">Keep track of your spending and monthly budgets.</p>
      <section className="spending-panel spending-profile" aria-label="Customer profile">
        <ResourcePanel resource={profile}>
          {(customer) => (
            <>
              <div>
                <h2>{customer.name}</h2>
                <p className="spending-muted">
                  <span className="spending-account">{customer.accountType}</span> account · Member
                  since {formatDate(customer.joinDate)}
                </p>
              </div>
              <span className="spending-demo">Demo account</span>
            </>
          )}
        </ResourcePanel>
      </section>

      <section className="spending-panel" aria-label="Spending filters">
        <ResourcePanel resource={filters}>
          {(data) => (
            <SpendingControls
              key={`${query.period}-${query.startDate}-${query.endDate}`}
              filters={data}
              query={query}
              update={update}
            />
          )}
        </ResourcePanel>
        {invalidRange && (
          <p role="alert" className="field-error">
            The date range in this link is invalid. Showing the selected preset instead. Choose both
            dates to apply a custom range.
          </p>
        )}
      </section>

      <section aria-labelledby="spending-overview-heading">
        <div className="spending-section-heading">
          <h2 id="spending-overview-heading">Spending overview</h2>
          <p className="spending-muted">
            {formatDate(range.startDate)} – {formatDate(range.endDate)}
            {query.category ? ` · ${query.category}` : ''}
          </p>
        </div>
        <ResourcePanel resource={summary}>
          {(data) => <SummaryCards summary={data} />}
        </ResourcePanel>
      </section>

      <div className="spending-charts">
        <section className="spending-panel" aria-labelledby="categories-heading">
          <h2 id="categories-heading">Spending by category</h2>
          <ResourcePanel resource={categories}>
            {(data) => (
              <CategoryBreakdown
                data={data}
                selected={query.category}
                onSelect={(category) => update({ category })}
              />
            )}
          </ResourcePanel>
        </section>
        <section className="spending-panel" aria-labelledby="trends-heading">
          <div className="spending-section-heading">
            <h2 id="trends-heading">Monthly trends</h2>
            <div className="spending-field">
              <label htmlFor="trend-months" className="visually-hidden">
                Months of history
              </label>
              <select
                id="trend-months"
                value={months}
                onChange={(event) => setMonths(Number(event.target.value))}
              >
                <option value={6}>6 months</option>
                <option value={12}>12 months</option>
                <option value={24}>24 months</option>
              </select>
            </div>
          </div>
          <ResourcePanel resource={trends}>{(data) => <MonthlyTrends data={data} />}</ResourcePanel>
        </section>
      </div>

      <section className="spending-panel" aria-labelledby="budgets-heading">
        <div className="spending-section-heading">
          <h2 id="budgets-heading">Monthly budgets</h2>
          <p className="spending-muted">This month</p>
        </div>
        <ResourcePanel resource={goals}>{(data) => <BudgetGoals data={data} />}</ResourcePanel>
      </section>

      <section className="spending-panel" aria-labelledby="transactions-heading">
        <TransactionsList
          key={`${JSON.stringify(query)}-${sortBy}`}
          query={query}
          sortBy={sortBy}
          onSort={(sort) => update({ sortBy: sort })}
        />
      </section>
      <p className="spending-muted spending-page__disclaimer">
        Demo data. Amounts in rands, dates in South African time.
      </p>
    </section>
  )
}
