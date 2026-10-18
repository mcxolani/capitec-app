import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getCustomerProfile, getSpendingFilters, getSpendingSummary } from '@/api/spendingApi'
import type {
  CustomerProfile,
  SpendingFilters,
  SpendingPeriod,
  SpendingSummary,
} from '@/types/spending'

export const useSpendingStore = defineStore('spending', () => {
  const profile = ref<CustomerProfile | null>(null)
  const filters = ref<SpendingFilters | null>(null)
  const summary = ref<SpendingSummary | null>(null)
  const loading = ref(true)
  const summaryLoading = ref(false)
  const error = ref('')
  const summaryError = ref('')

  async function load(period: SpendingPeriod) {
    loading.value = true
    error.value = ''

    try {
      const [customerProfile, spendingFilters, spendingSummary] = await Promise.all([
        getCustomerProfile(),
        getSpendingFilters(),
        getSpendingSummary(period),
      ])
      profile.value = customerProfile
      filters.value = spendingFilters
      summary.value = spendingSummary
    } catch {
      error.value = 'Could not load spending insights. Check that the Spring Boot API is running.'
    } finally {
      loading.value = false
    }
  }

  async function loadSummary(period: SpendingPeriod) {
    summaryLoading.value = true
    summaryError.value = ''

    try {
      summary.value = await getSpendingSummary(period)
    } catch {
      summaryError.value = 'Could not update the spending summary. Please try again.'
    } finally {
      summaryLoading.value = false
    }
  }

  return {
    profile,
    filters,
    summary,
    loading,
    summaryLoading,
    error,
    summaryError,
    load,
    loadSummary,
  }
})
