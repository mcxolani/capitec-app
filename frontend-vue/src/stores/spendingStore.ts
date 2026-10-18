import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getCustomerProfile,
  getSpendingCategories,
  getSpendingFilters,
  getSpendingGoals,
  getSpendingSummary,
  getSpendingTransactions,
  getSpendingTrends,
} from '@/api/spendingApi'
import type {
  CustomerProfile,
  SpendingCategories,
  SpendingDateRange,
  SpendingFilters,
  SpendingGoals,
  SpendingPeriod,
  SpendingSort,
  SpendingSummary,
  SpendingTransactions,
  SpendingTrends,
} from '@/types/spending'

export const useSpendingStore = defineStore('spending', () => {
  const profile = ref<CustomerProfile | null>(null)
  const filters = ref<SpendingFilters | null>(null)
  const summary = ref<SpendingSummary | null>(null)
  const categories = ref<SpendingCategories | null>(null)
  const trends = ref<SpendingTrends | null>(null)
  const goals = ref<SpendingGoals | null>(null)
  const transactions = ref<SpendingTransactions['transactions']>([])
  const hasMoreTransactions = ref(false)
  const loading = ref(true)
  const periodLoading = ref(false)
  const transactionLoading = ref(false)
  const error = ref('')
  const periodError = ref('')
  const transactionError = ref('')

  async function load(
    period: SpendingPeriod,
    category?: string,
    dates?: SpendingDateRange,
    months = 12,
    sortBy: SpendingSort = 'date_desc',
  ) {
    loading.value = true
    error.value = ''

    try {
      const [
        customerProfile,
        spendingFilters,
        spendingSummary,
        spendingCategories,
        spendingTrends,
        spendingGoals,
        spendingTransactions,
      ] = await Promise.all([
        getCustomerProfile(),
        getSpendingFilters(),
        getSpendingSummary(period, category, dates),
        getSpendingCategories(period, category, dates),
        getSpendingTrends(months, category),
        getSpendingGoals(category),
        getSpendingTransactions(period, category, dates, sortBy),
      ])
      profile.value = customerProfile
      filters.value = spendingFilters
      summary.value = spendingSummary
      categories.value = spendingCategories
      trends.value = spendingTrends
      goals.value = spendingGoals
      transactions.value = spendingTransactions.transactions
      hasMoreTransactions.value = spendingTransactions.pagination.hasMore
    } catch {
      error.value = 'Could not load spending insights. Check that the Spring Boot API is running.'
    } finally {
      loading.value = false
    }
  }

  async function loadPeriod(
    period: SpendingPeriod,
    category?: string,
    dates?: SpendingDateRange,
    months = 12,
    sortBy: SpendingSort = 'date_desc',
  ) {
    periodLoading.value = true
    transactionLoading.value = true
    periodError.value = ''
    transactionError.value = ''

    try {
      const [spendingSummary, spendingCategories, spendingTrends, spendingGoals, firstPage] =
        await Promise.all([
          getSpendingSummary(period, category, dates),
          getSpendingCategories(period, category, dates),
          getSpendingTrends(months, category),
          getSpendingGoals(category),
          getSpendingTransactions(period, category, dates, sortBy),
        ])
      summary.value = spendingSummary
      categories.value = spendingCategories
      trends.value = spendingTrends
      goals.value = spendingGoals
      transactions.value = firstPage.transactions
      hasMoreTransactions.value = firstPage.pagination.hasMore
    } catch {
      periodError.value = 'Could not update spending insights for this period. Please try again.'
    } finally {
      periodLoading.value = false
      transactionLoading.value = false
    }
  }

  async function loadTrends(months: number, category?: string) {
    try {
      trends.value = await getSpendingTrends(months, category)
    } catch {
      periodError.value = 'Could not update the spending trend. Please try again.'
    }
  }

  async function loadTransactions(
    period: SpendingPeriod,
    category: string | undefined,
    dates: SpendingDateRange | undefined,
    sortBy: SpendingSort,
    loadMore = false,
  ) {
    transactionLoading.value = true
    transactionError.value = ''

    try {
      const page = await getSpendingTransactions(
        period,
        category,
        dates,
        sortBy,
        loadMore ? transactions.value.length : 0,
      )
      transactions.value = loadMore
        ? [...transactions.value, ...page.transactions]
        : page.transactions
      hasMoreTransactions.value = page.pagination.hasMore
    } catch {
      transactionError.value = 'Could not load transactions. Please try again.'
    } finally {
      transactionLoading.value = false
    }
  }

  return {
    profile,
    filters,
    summary,
    categories,
    trends,
    goals,
    transactions,
    hasMoreTransactions,
    loading,
    periodLoading,
    transactionLoading,
    error,
    periodError,
    transactionError,
    load,
    loadPeriod,
    loadTrends,
    loadTransactions,
  }
})
