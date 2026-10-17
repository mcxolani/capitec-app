import type { SpendingGoals } from '@/types/spending'
import { formatMoney } from '@/utils/spendingFormat'

const labels: Record<string, string> = {
  on_track: 'On track',
  warning: 'Near budget',
  over_budget: 'Over budget',
}

export default function BudgetGoals({ data }: { data: SpendingGoals }) {
  if (!data.goals.length)
    return <p className="spending-muted">No monthly budget set for this category.</p>
  return (
    <ul className="spending-goals">
      {data.goals.map((goal) => (
        <li key={goal.id} className={`spending-goal spending-goal--${goal.status}`}>
          <div className="spending-goal__heading">
            <h3>{goal.category}</h3>
            <span className="spending-goal__status">{labels[goal.status]}</span>
          </div>
          <p>
            <strong>{formatMoney(goal.currentSpent)}</strong>
            <span className="spending-muted"> of {formatMoney(goal.monthlyBudget)}</span>
          </p>
          <progress
            max={100}
            value={Math.min(100, goal.percentageUsed)}
            aria-label={`${goal.category} budget used`}
            aria-valuetext={`${goal.percentageUsed.toFixed(1)}% used, ${labels[goal.status]}`}
          />
          <p className="spending-muted">
            {goal.percentageUsed.toFixed(1)}% used · {goal.daysRemaining} days remaining
          </p>
        </li>
      ))}
    </ul>
  )
}
