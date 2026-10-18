export type SpendingPeriod = '7d' | '30d' | '90d' | '1y'

export type CustomerProfile = {
  customerId: string
  name: string
  email: string
  joinDate: string
  accountType: string
  totalSpent: number
  currency: string
}

export type SpendingSummary = {
  period: SpendingPeriod
  totalSpent: number
  transactionCount: number
  averageTransaction: number
  topCategory: string | null
  comparedToPrevious: {
    spentChange: number | null
    transactionChange: number | null
  }
}

export type SpendingCategories = {
  dateRange: { startDate: string; endDate: string }
  totalAmount: number
  categories: {
    name: string
    amount: number
    percentage: number
    transactionCount: number
    color: string
    icon: string
  }[]
}

export type SpendingTrends = {
  trends: {
    month: string
    totalSpent: number
    transactionCount: number
    averageTransaction: number
  }[]
}

export type SpendingFilters = {
  categories: { name: string; color: string; icon: string }[]
  dateRangePresets: { label: string; value: SpendingPeriod }[]
}
