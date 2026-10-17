import type { SpendingTrends } from '@/types/spending'
import { formatMoney, formatMonth } from '@/utils/spendingFormat'

export default function MonthlyTrends({ data }: { data: SpendingTrends }) {
  if (!data.trends.some((month) => month.transactionCount))
    return <p className="spending-muted">No monthly spending to display.</p>
  const maximum = Math.max(...data.trends.map((month) => month.totalSpent), 1)
  const width = 480 / data.trends.length
  return (
    <>
      <p className="spending-muted">
        Monthly totals in rands. The current month is still in progress.
      </p>
      <svg viewBox="0 0 520 260" className="spending-trends" aria-hidden="true">
        <text x="20" y="18" className="spending-trends__label">
          {formatMoney(maximum)}
        </text>
        {[45, 120, 195].map((y) => (
          <line key={y} x1="20" x2="500" y1={y} y2={y} stroke="#dde1e8" />
        ))}
        {data.trends.map((month, index) => {
          const height = (month.totalSpent / maximum) * 165
          return (
            <g key={month.month}>
              <rect
                x={20 + index * width + width * 0.2}
                y={210 - height}
                width={width * 0.6}
                height={height}
                rx="3"
                fill="#0b3d91"
              >
                <title>
                  {formatMonth(month.month)}: {formatMoney(month.totalSpent)}
                </title>
              </rect>
              {index % Math.ceil(data.trends.length / 12) === 0 && (
                <text
                  x={20 + index * width + width / 2}
                  y={230}
                  textAnchor="middle"
                  className="spending-trends__label"
                >
                  {formatMonth(month.month).split(' ')[0]}
                </text>
              )}
            </g>
          )
        })}
      </svg>
      <details className="spending-trends-data">
        <summary>View monthly figures</summary>
        <div className="spending-table-scroll">
          <table className="spending-table">
            <caption className="visually-hidden">Monthly spending totals</caption>
            <thead>
              <tr>
                <th scope="col">Month</th>
                <th scope="col">Spent</th>
                <th scope="col">Transactions</th>
                <th scope="col">Average</th>
              </tr>
            </thead>
            <tbody>
              {data.trends.map((month) => (
                <tr key={month.month}>
                  <th scope="row">{formatMonth(month.month)}</th>
                  <td>{formatMoney(month.totalSpent)}</td>
                  <td>{month.transactionCount}</td>
                  <td>{formatMoney(month.averageTransaction)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </>
  )
}
