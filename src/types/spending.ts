export interface SpendingQuery {
  period?: string
  startDate?: string
  endDate?: string
  category?: string
}

export interface DateRange {
  startDate: string
  endDate: string
}

export interface SpendingSummary {
  period: string
  totalSpent: number
  transactionCount: number
  averageTransaction: number
  topCategory: string | null
  comparedToPrevious: {
    spentChange: number | null
    transactionChange: number | null
  }
}

export interface SpendingCategories {
  dateRange: DateRange
  totalAmount: number
  categories: {
    name: string
    color: string
    icon: string
    amount: number
    percentage: number
    transactionCount: number
  }[]
}

export interface SpendingTrends {
  trends: {
    month: string
    totalSpent: number
    transactionCount: number
    averageTransaction: number
  }[]
}

export interface Transaction {
  id: string
  date: string
  merchant: string
  category: string
  amount: number
  description: string
  paymentMethod: string
  icon: string
  categoryColor: string
}

export interface TransactionQuery extends SpendingQuery {
  limit?: number
  offset?: number
  sortBy?: string
}

export interface SpendingGoals {
  goals: {
    id: string
    category: string
    monthlyBudget: number
    currentSpent: number
    percentageUsed: number
    daysRemaining: number
    status: string
  }[]
}

export interface SpendingFilters {
  categories: { name: string; color: string; icon: string }[]
  dateRangePresets: { label: string; value: string }[]
}
