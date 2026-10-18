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

export type SpendingFilters = {
  categories: { name: string; color: string; icon: string }[]
  dateRangePresets: { label: string; value: SpendingPeriod }[]
}
