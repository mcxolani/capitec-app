import * as Collapsible from '@radix-ui/react-collapsible'
import { ChevronDown } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { SpendingTrends } from '@/types/spending'
import { formatMoney, formatMonth } from '@/utils/spendingFormat'

export default function MonthlyTrends({ data }: { data: SpendingTrends }) {
  if (!data.trends.some((month) => month.transactionCount))
    return <p className="spending-muted">No monthly spending to display.</p>

  return (
    <>
      <p className="spending-muted">
        Monthly totals in rands. The current month is still in progress.
      </p>
      <div className="spending-trends">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data.trends}
            accessibilityLayer
            aria-label="Monthly spending totals"
            margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
          >
            <CartesianGrid vertical={false} stroke="#dde1e8" />
            <XAxis
              dataKey="month"
              tickFormatter={formatMonth}
              tickLine={false}
              axisLine={false}
              minTickGap={24}
              tick={{ fill: '#555', fontSize: 12 }}
            />
            <YAxis
              tickFormatter={(value) => `R${value / 1000}k`}
              tickLine={false}
              axisLine={false}
              width={55}
              tick={{ fill: '#555', fontSize: 12 }}
            />
            <Tooltip
              labelFormatter={(month) => formatMonth(String(month))}
              formatter={(value) => [formatMoney(Number(value)), 'Spent']}
              cursor={{ fill: '#eef3fc' }}
              contentStyle={{ borderColor: '#dde1e8', borderRadius: 8 }}
            />
            <Bar
              dataKey="totalSpent"
              name="Spent"
              fill="var(--color-blue)"
              radius={[3, 3, 0, 0]}
              maxBarSize={36}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <Collapsible.Root className="spending-trends-data">
        <Collapsible.Trigger className="spending-trends-data__trigger">
          View monthly figures <ChevronDown size={16} aria-hidden="true" />
        </Collapsible.Trigger>
        <Collapsible.Content className="spending-table-scroll">
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
        </Collapsible.Content>
      </Collapsible.Root>
    </>
  )
}
