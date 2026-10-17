import { ArrowDown, ArrowUp } from 'lucide-react'
import type { SpendingSummary } from '@/types/spending'
import { formatMoney, formatPercentage } from '@/utils/spendingFormat'

export default function SummaryCards({ summary }: { summary: SpendingSummary }) {
  const change = summary.comparedToPrevious.spentChange
  return (
    <>
      {!summary.transactionCount && (
        <p className="spending-muted">
          No spending in this date range. Try another period or category.
        </p>
      )}
      <dl className="spending-summary">
        <div className="spending-panel">
          <dt>Total spent</dt>
          <dd>{formatMoney(summary.totalSpent)}</dd>
        </div>
        <div className="spending-panel">
          <dt>Transactions</dt>
          <dd>{summary.transactionCount}</dd>
          <span className="spending-muted">
            {summary.comparedToPrevious.transactionChange === null
              ? 'No previous transactions'
              : `${formatPercentage(summary.comparedToPrevious.transactionChange)} vs previous period`}
          </span>
        </div>
        <div className="spending-panel">
          <dt>Average transaction</dt>
          <dd>{formatMoney(summary.averageTransaction)}</dd>
        </div>
        <div className="spending-panel">
          <dt>Top category</dt>
          <dd>{summary.topCategory ?? '—'}</dd>
        </div>
        <div className="spending-panel">
          <dt>Spending change</dt>
          <dd
            className={
              change !== null && change > 0
                ? 'spending-change--up'
                : change !== null && change < 0
                  ? 'spending-change--down'
                  : ''
            }
          >
            {change !== null && change > 0 && <ArrowUp size={18} aria-hidden="true" />}
            {change !== null && change < 0 && <ArrowDown size={18} aria-hidden="true" />}
            {change === null ? '—' : formatPercentage(change)}
          </dd>
          <span className="spending-muted">
            {change === null ? 'No previous spending' : 'vs previous period'}
          </span>
        </div>
      </dl>
    </>
  )
}
