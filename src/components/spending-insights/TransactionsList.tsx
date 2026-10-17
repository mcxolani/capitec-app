import { useCallback, useState } from 'react'
import { spendingApi } from '@/api/spendingApi'
import { useSpendingResource } from '@/hooks/useSpendingResource'
import type { SpendingQuery, Transaction } from '@/types/spending'
import { formatDate, formatMoney } from '@/utils/spendingFormat'
import CategoryIcon from './CategoryIcon'
import ResourcePanel from './ResourcePanel'

export default function TransactionsList({
  query,
  sortBy,
  onSort,
}: {
  query: SpendingQuery
  sortBy: string
  onSort: (sort: string) => void
}) {
  const loader = useCallback(() => spendingApi.transactions({ ...query, sortBy }), [query, sortBy])
  const resource = useSpendingResource(loader)
  const [extraRows, setExtraRows] = useState<Transaction[]>([])
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(false)

  const rows = [...(resource.data?.transactions ?? []), ...extraRows]
  const total = resource.data?.pagination.total ?? 0

  const loadMore = async () => {
    setLoadingMore(true)
    setError(false)
    try {
      const next = await spendingApi.transactions({ ...query, sortBy, offset: rows.length })
      setExtraRows((previous) => [...previous, ...next.transactions])
    } catch {
      setError(true)
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <>
      <div className="spending-section-heading">
        <h2 id="transactions-heading">Transactions</h2>
        <div className="spending-field">
          <label htmlFor="transaction-sort">Sort by</label>
          <select
            id="transaction-sort"
            value={sortBy}
            onChange={(event) => onSort(event.target.value)}
          >
            <option value="date_desc">Newest first</option>
            <option value="date_asc">Oldest first</option>
            <option value="amount_desc">Highest amount</option>
            <option value="amount_asc">Lowest amount</option>
          </select>
        </div>
      </div>
      <ResourcePanel resource={resource}>
        {() => {
          if (!rows.length)
            return (
              <p className="spending-muted">
                No transactions match these filters. Try another period or category.
              </p>
            )
          return (
            <>
              <p className="spending-muted" role="status">
                Showing {rows.length} of {total} transactions
              </p>
              <table className="spending-table spending-transactions">
                <caption className="visually-hidden">Transactions for the selected filters</caption>
                <thead>
                  <tr>
                    <th scope="col">Merchant</th>
                    <th scope="col">Category</th>
                    <th scope="col">Date</th>
                    <th scope="col">Payment method</th>
                    <th scope="col">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((transaction) => (
                    <tr key={transaction.id}>
                      <th scope="row" className="spending-transactions__merchant">
                        <span>
                          <CategoryIcon icon={transaction.icon} />
                          {transaction.merchant}
                        </span>
                        <small>{transaction.description}</small>
                      </th>
                      <td data-label="Category">
                        <span
                          className="spending-swatch"
                          style={{ background: transaction.categoryColor }}
                        />
                        {transaction.category}
                      </td>
                      <td data-label="Date">
                        <time dateTime={transaction.date}>{formatDate(transaction.date)}</time>
                      </td>
                      <td data-label="Payment method">{transaction.paymentMethod}</td>
                      <td data-label="Amount" className="spending-transactions__amount">
                        {formatMoney(transaction.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="spending-transactions__footer">
                {error && (
                  <p role="alert">
                    More transactions couldn’t load. Your current transactions are still shown.
                  </p>
                )}
                {rows.length < total && (
                  <button type="button" className="btn" disabled={loadingMore} onClick={loadMore}>
                    {loadingMore ? 'Loading more…' : error ? 'Try loading more again' : 'Load more'}
                  </button>
                )}
              </div>
            </>
          )
        }}
      </ResourcePanel>
    </>
  )
}
