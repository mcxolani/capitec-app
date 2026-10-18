import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getCustomerProfile,
  getSpendingCategories,
  getSpendingFilters,
  getSpendingSummary,
  getSpendingTrends,
} from '@/api/spendingApi'
import type {
  CustomerProfile,
  SpendingCategories,
  SpendingFilters,
  SpendingPeriod,
  SpendingSummary,
  SpendingTrends,
} from '@/types/spending'

export const useSpendingStore = defineStore('spending', () => {
  const profile = ref<CustomerProfile | null>(null)
  const filters = ref<SpendingFilters | null>(null)
  const summary = ref<SpendingSummary | null>(null)
  const categories = ref<SpendingCategories | null>(null)
  const trends = ref<SpendingTrends | null>(null)
  const loading = ref(true)
  const periodLoading = ref(false)
  const error = ref('')
  const periodError = ref('')

  async function load(period: SpendingPeriod) {
    loading.value = true
    error.value = ''

    try {
      const [
        customerProfile,
        spendingFilters,
        spendingSummary,
        spendingCategories,
        spendingTrends,
      ] = await Promise.all([
        getCustomerProfile(),
        getSpendingFilters(),
        getSpendingSummary(period),
        getSpendingCategories(period),
        getSpendingTrends(),
      ])
      profile.value = customerProfile
      filters.value = spendingFilters
      summary.value = spendingSummary
      categories.value = spendingCategories
      trends.value = spendingTrends
    } catch {
      error.value = 'Could not load spending insights. Check that the Spring Boot API is running.'
    } finally {
      loading.value = false
    }
  }

  async function loadPeriod(period: SpendingPeriod) {
    periodLoading.value = true
    periodError.value = ''

    try {
      const [spendingSummary, spendingCategories] = await Promise.all([
        getSpendingSummary(period),
        getSpendingCategories(period),
      ])
      summary.value = spendingSummary
      categories.value = spendingCategories
    } catch {
      periodError.value = 'Could not update spending insights for this period. Please try again.'
    } finally {
      periodLoading.value = false
    }
  }

  return {
    profile,
    filters,
    summary,
    categories,
    trends,
    loading,
    periodLoading,
    error,
    periodError,
    load,
    loadPeriod,
  }
})
