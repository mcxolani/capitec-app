import * as ToggleGroup from '@radix-ui/react-toggle-group'
import { Label, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { SpendingCategories } from '@/types/spending'
import { formatMoney } from '@/utils/spendingFormat'
import CategoryIcon from './CategoryIcon'

export default function CategoryBreakdown({
  data,
  selected,
  onSelect,
}: {
  data: SpendingCategories
  selected?: string
  onSelect: (category?: string) => void
}) {
  if (!data.categories.length)
    return <p className="spending-muted">No category spending in this date range.</p>

  const chartData = data.categories.map((category) => ({ ...category, fill: category.color }))

  return (
    <div className="spending-breakdown">
      <div className="spending-donut">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart accessibilityLayer aria-label="Spending by category">
            <Pie
              data={chartData}
              dataKey="amount"
              nameKey="name"
              innerRadius={65}
              outerRadius={90}
              startAngle={90}
              endAngle={-270}
              cursor="pointer"
              isAnimationActive={false}
              onClick={(_, index) =>
                onSelect(selected === chartData[index].name ? undefined : chartData[index].name)
              }
            >
              <Label
                position="center"
                value={formatMoney(data.totalAmount)}
                className="spending-donut__amount"
              />
            </Pie>
            <Tooltip
              formatter={(value) => formatMoney(Number(value))}
              itemStyle={{ color: '#1a1a1a' }}
              contentStyle={{ borderColor: '#dde1e8', borderRadius: 8 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ToggleGroup.Root
        type="single"
        orientation="vertical"
        value={selected ?? ''}
        onValueChange={(category) => onSelect(category || undefined)}
        className="spending-categories"
        aria-label="Filter by spending category"
      >
        {data.categories.map((category) => (
          <ToggleGroup.Item key={category.name} value={category.name}>
            <span className="spending-category-name">
              <span className="spending-swatch" style={{ background: category.color }} />
              <CategoryIcon icon={category.icon} />
              {category.name}
            </span>
            <span className="spending-category-value">
              <strong>{formatMoney(category.amount)}</strong>
              <span className="spending-muted">
                {category.percentage.toFixed(1)}% · {category.transactionCount} transactions
              </span>
            </span>
          </ToggleGroup.Item>
        ))}
      </ToggleGroup.Root>
      <p className="spending-muted">Select a category to filter your spending.</p>
    </div>
  )
}
