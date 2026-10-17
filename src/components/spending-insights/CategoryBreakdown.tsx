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
  const circumference = 2 * Math.PI * 70
  return (
    <div className="spending-breakdown">
      <svg viewBox="0 0 200 200" className="spending-donut" aria-hidden="true">
        {data.categories.map((category, index) => {
          const preceding = data.categories
            .slice(0, index)
            .reduce((sum, item) => sum + item.amount, 0)
          return (
            <circle
              key={category.name}
              cx="100"
              cy="100"
              r="70"
              fill="none"
              stroke={category.color}
              strokeWidth="24"
              strokeDasharray={`${(category.amount / data.totalAmount) * circumference} ${circumference}`}
              strokeDashoffset={(-preceding / data.totalAmount) * circumference}
              transform="rotate(-90 100 100)"
            />
          )
        })}
        <text x="100" y="96" textAnchor="middle" className="spending-donut__label">
          Total spent
        </text>
        <text x="100" y="118" textAnchor="middle" className="spending-donut__amount">
          {formatMoney(data.totalAmount)}
        </text>
      </svg>
      <ul className="spending-categories">
        {data.categories.map((category) => (
          <li key={category.name}>
            <button
              type="button"
              aria-pressed={selected === category.name}
              onClick={() => onSelect(selected === category.name ? undefined : category.name)}
            >
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
            </button>
          </li>
        ))}
      </ul>
      <p className="spending-muted">Select a category to filter your spending.</p>
    </div>
  )
}
