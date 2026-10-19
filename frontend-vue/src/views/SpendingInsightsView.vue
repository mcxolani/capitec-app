<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Clock3, CreditCard, Info, Wallet } from '@lucide/vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Message from 'primevue/message'
import ProgressBar from 'primevue/progressbar'
import ProgressSpinner from 'primevue/progressspinner'
import Select from 'primevue/select'
import SpendingTransactions from '@/components/spending-insights/SpendingTransactions.vue'
import { useSpendingStore } from '@/stores/spendingStore'
import type { SpendingDateRange, SpendingPeriod, SpendingSort } from '@/types/spending'
import { formatSpendingCurrency } from '@/utils/currency'

const spendingStore = useSpendingStore()
const route = useRoute()
const router = useRouter()
const SpendingCharts = defineAsyncComponent(
  () => import('@/components/spending-insights/SpendingCharts.vue'),
)
const periods: SpendingPeriod[] = ['7d', '30d', '90d', '1y']
const months = ref(12)
const draftStartDate = ref(typeof route.query.startDate === 'string' ? route.query.startDate : '')
const draftEndDate = ref(typeof route.query.endDate === 'string' ? route.query.endDate : '')

const startDate = computed(() =>
  typeof route.query.startDate === 'string' ? route.query.startDate : '',
)
const endDate = computed(() => (typeof route.query.endDate === 'string' ? route.query.endDate : ''))
const dateRange = computed<SpendingDateRange | undefined>(() =>
  startDate.value && endDate.value
    ? { startDate: startDate.value, endDate: endDate.value }
    : undefined,
)
const canApplyDateRange = computed(() =>
  Boolean(draftStartDate.value && draftEndDate.value && draftStartDate.value <= draftEndDate.value),
)

const period = computed<SpendingPeriod>({
  get: () => periods.find((value) => value === route.query.period) ?? '30d',
  set: (value) => {
    draftStartDate.value = ''
    draftEndDate.value = ''
    void router.replace({
      query: {
        ...route.query,
        period: value === '30d' ? undefined : value,
        startDate: undefined,
        endDate: undefined,
      },
    })
  },
})

const category = computed<string>({
  get: () =>
    spendingStore.filters?.categories.find((option) => option.name === route.query.category)
      ?.name ?? '',
  set: (value) => {
    void router.replace({
      query: { ...route.query, category: value || undefined },
    })
  },
})

const sortBy = computed<SpendingSort>({
  get: () =>
    (['date_desc', 'date_asc', 'amount_desc', 'amount_asc'] as const).find(
      (value) => value === route.query.sortBy,
    ) ?? 'date_desc',
  set: (value) => {
    void router.replace({
      query: { ...route.query, sortBy: value === 'date_desc' ? undefined : value },
    })
  },
})

const categoryOptions = computed(() => [
  { label: 'All categories', value: '' },
  ...(spendingStore.filters?.categories.map((option) => ({
    label: option.name,
    value: option.name,
  })) ?? []),
])

const metrics = computed(() => {
  const summary = spendingStore.summary
  if (!summary) return []

  return [
    {
      label: 'Total spent',
      value: formatSpendingCurrency(summary.totalSpent),
      detail: changeText(summary.comparedToPrevious.spentChange),
      icon: Wallet,
    },
    {
      label: 'Transactions',
      value: summary.transactionCount.toLocaleString('en-ZA'),
      detail: changeText(summary.comparedToPrevious.transactionChange),
      icon: CreditCard,
    },
    {
      label: 'Average transaction',
      value: formatSpendingCurrency(summary.averageTransaction),
      icon: Clock3,
    },
    {
      label: 'Top category',
      value: summary.topCategory ?? 'No spending yet',
      icon: Info,
    },
  ]
})

function changeText(change: number | null) {
  if (change === null) return 'No previous period to compare'
  if (change === 0) return 'Same as the previous period'
  return `${Math.abs(change)}% ${change > 0 ? 'more' : 'less'} than the previous period`
}

function loadPeriod() {
  void spendingStore.loadPeriod(
    period.value,
    category.value || undefined,
    dateRange.value,
    months.value,
    sortBy.value,
  )
}

function applyDateRange() {
  if (!canApplyDateRange.value) return
  void router.replace({
    query: {
      ...route.query,
      startDate: draftStartDate.value,
      endDate: draftEndDate.value,
    },
  })
}

function clearDateRange() {
  draftStartDate.value = ''
  draftEndDate.value = ''
  void router.replace({ query: { ...route.query, startDate: undefined, endDate: undefined } })
}

function loadMoreTransactions() {
  void spendingStore.loadTransactions(
    period.value,
    category.value || undefined,
    dateRange.value,
    sortBy.value,
    true,
  )
}

watch([period, category, startDate, endDate], loadPeriod)
watch(
  sortBy,
  () =>
    void spendingStore.loadTransactions(
      period.value,
      category.value || undefined,
      dateRange.value,
      sortBy.value,
    ),
)
watch(months, (value) => void spendingStore.loadTrends(value, category.value || undefined))
watch([startDate, endDate], ([start, end]) => {
  draftStartDate.value = start
  draftEndDate.value = end
})
onMounted(() =>
  spendingStore.load(
    period.value,
    category.value || undefined,
    dateRange.value,
    months.value,
    sortBy.value,
  ),
)
</script>

<template>
  <section class="spending-view" aria-labelledby="spending-title">
    <header class="spending-view__heading">
      <p class="spending-view__eyebrow">Spending tools</p>
      <h1 id="spending-title">Spending insights</h1>
      <p v-if="spendingStore.profile">
        Welcome back, {{ spendingStore.profile.name }}. Here’s a look at your spending.
      </p>
      <p v-else>See where your money goes and how your spending changes over time.</p>
    </header>

    <div v-if="spendingStore.loading" class="spending-view__loading" role="status">
      <ProgressSpinner aria-label="Loading spending insights" />
      <span>Loading your spending summary…</span>
    </div>

    <div v-else-if="spendingStore.error" class="spending-view__error">
      <Message severity="error" :closable="false">{{ spendingStore.error }}</Message>
      <Button
        label="Try again"
        outlined
        @click="spendingStore.load(period, category || undefined, dateRange, months, sortBy)"
      />
    </div>

    <template v-else>
      <section class="spending-overview" aria-labelledby="spending-overview-title">
        <div class="spending-overview__heading">
          <div>
            <h2 id="spending-overview-title">Your overview</h2>
            <p>Figures for the selected period, compared with the previous one.</p>
          </div>
          <div class="spending-overview__filters">
            <Select
              v-model="period"
              class="spending-overview__filter"
              :options="spendingStore.filters?.dateRangePresets"
              option-label="label"
              option-value="value"
              aria-label="Spending period"
            />
            <Select
              v-model="category"
              class="spending-overview__filter"
              :options="categoryOptions"
              option-label="label"
              option-value="value"
              aria-label="Spending category"
            />
          </div>
        </div>

        <form class="spending-date-range" @submit.prevent="applyDateRange">
          <div class="spending-date-range__fields">
            <label>
              <span>From</span>
              <input v-model="draftStartDate" type="date" aria-label="Start date" />
            </label>
            <label>
              <span>To</span>
              <input v-model="draftEndDate" type="date" aria-label="End date" />
            </label>
            <Button label="Apply dates" type="submit" :disabled="!canApplyDateRange" />
            <Button v-if="dateRange" label="Clear" type="button" text @click="clearDateRange" />
          </div>
          <small>Choose a complete date range to use it instead of the selected preset.</small>
        </form>

        <Message v-if="spendingStore.periodError" severity="warn" :closable="false">
          {{ spendingStore.periodError }}
        </Message>

        <div class="spending-metrics" :aria-busy="spendingStore.periodLoading">
          <Card v-for="metric in metrics" :key="metric.label" class="spending-metric">
            <template #content>
              <div class="spending-metric__topline">
                <span class="spending-metric__icon">
                  <component :is="metric.icon" :size="19" aria-hidden="true" />
                </span>
                <span>{{ metric.label }}</span>
              </div>
              <strong>{{ metric.value }}</strong>
              <small v-if="metric.detail">{{ metric.detail }}</small>
            </template>
          </Card>
        </div>
      </section>

      <SpendingCharts
        v-if="spendingStore.categories && spendingStore.trends"
        :categories="spendingStore.categories.categories"
        :total-amount="spendingStore.categories.totalAmount"
        :trends="spendingStore.trends.trends"
        :selected-category="category"
        :loading="spendingStore.periodLoading"
        :months="months"
        @select-category="category = $event"
        @select-months="months = $event"
      />

      <section class="spending-goals" aria-labelledby="spending-goals-title">
        <div class="spending-section-heading">
          <div>
            <h2 id="spending-goals-title">Monthly budgets</h2>
            <p>Track how much of each category budget you have used.</p>
          </div>
        </div>
        <div v-if="spendingStore.goals?.goals.length" class="spending-goals__list">
          <Card v-for="goal in spendingStore.goals.goals" :key="goal.id" class="spending-goal">
            <template #content>
              <div class="spending-goal__heading">
                <strong>{{ goal.category }}</strong>
                <span :class="['spending-goal__status', `is-${goal.status.replace('_', '-')}`]">
                  {{ goal.status.replace('_', ' ') }}
                </span>
              </div>
              <ProgressBar :value="Math.min(goal.percentageUsed, 100)" />
              <div class="spending-goal__details">
                <span>{{ formatSpendingCurrency(goal.currentSpent) }} spent</span>
                <span
                  >{{ Math.round(goal.percentageUsed) }}% of
                  {{ formatSpendingCurrency(goal.monthlyBudget) }}</span
                >
              </div>
              <small>{{ goal.daysRemaining }} days remaining</small>
            </template>
          </Card>
        </div>
        <Message v-else severity="info" :closable="false"
          >No budget goals for this category.</Message
        >
      </section>

      <SpendingTransactions
        :transactions="spendingStore.transactions"
        :has-more="spendingStore.hasMoreTransactions"
        :loading="spendingStore.transactionLoading"
        :error="spendingStore.transactionError"
        :sort-by="sortBy"
        @change-sort="sortBy = $event"
        @load-more="loadMoreTransactions"
      />
    </template>
  </section>
</template>

<style scoped>
.spending-view {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.spending-view__heading {
  max-width: 48rem;
  margin: 0 auto 0.5rem;
  text-align: center;
}

.spending-view__eyebrow {
  margin: 0 0 0.45rem;
  color: var(--color-blue);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.spending-view__heading h1,
.spending-overview__heading h2 {
  margin: 0;
  color: var(--color-blue-dark);
}

.spending-view__heading > p:last-child,
.spending-overview__heading p {
  margin: 0.65rem 0 0;
  color: var(--color-muted);
}

.spending-view__loading {
  display: flex;
  min-height: 20rem;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: var(--color-muted);
}

.spending-view__error {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
}

.spending-overview {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.spending-overview__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.spending-overview__heading h2 {
  font-size: 1.2rem;
}

.spending-overview__heading p {
  margin-top: 0.25rem;
  font-size: 0.88rem;
}

.spending-overview__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.spending-overview__filter {
  width: 12rem;
  flex: 0 1 12rem;
}

.spending-date-range {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.85rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: #fafbfd;
}

.spending-date-range__fields {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.65rem;
}

.spending-date-range label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  color: var(--color-muted);
  font-size: 0.75rem;
  font-weight: 700;
}

.spending-date-range input {
  min-height: 2.65rem;
  padding: 0.45rem 0.65rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: #fff;
  color: var(--color-ink);
}

.spending-date-range input:focus {
  border-color: var(--color-blue);
  outline: 2px solid rgb(36 99 235 / 16%);
}

.spending-date-range small {
  color: var(--color-muted);
  font-size: 0.75rem;
}

.spending-section-heading h2 {
  margin: 0;
  color: var(--color-blue-dark);
  font-size: 1.2rem;
}

.spending-section-heading p {
  margin: 0.25rem 0 0;
  color: var(--color-muted);
  font-size: 0.88rem;
}

.spending-goals {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.spending-goals__list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.spending-goal {
  min-width: 0;
  flex: 1 1 17rem;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  box-shadow: 0 6px 20px rgb(32 49 59 / 5%);
}

.spending-goal :deep(.p-card-body) {
  padding: 1rem;
}

.spending-goal :deep(.p-card-content) {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  padding: 0;
}

.spending-goal__heading,
.spending-goal__details {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
}

.spending-goal__heading strong {
  color: var(--color-blue-dark);
}

.spending-goal__status {
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  background: #eaf7ef;
  color: #267346;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: capitalize;
}

.spending-goal__status.is-warning {
  background: #fff4dc;
  color: #8a5a00;
}

.spending-goal__status.is-over-budget {
  background: #ffebeb;
  color: #a12c2c;
}

.spending-goal__details,
.spending-goal small {
  color: var(--color-muted);
  font-size: 0.76rem;
}

.spending-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.spending-metric {
  min-width: 0;
  flex: 1 1 14rem;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  box-shadow: 0 6px 20px rgb(32 49 59 / 5%);
}

.spending-metric :deep(.p-card-body) {
  padding: 1rem;
}

.spending-metric :deep(.p-card-content) {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  padding: 0;
}

.spending-metric__topline {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  color: var(--color-muted);
  font-size: 0.82rem;
}

.spending-metric__icon {
  display: flex;
  width: 2.25rem;
  height: 2.25rem;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #edf3ff;
  color: var(--color-blue);
}

.spending-metric strong {
  color: var(--color-blue-dark);
  font-size: 1.25rem;
}

.spending-metric small {
  color: var(--color-muted);
  font-size: 0.73rem;
}

@media (max-width: 620px) {
  .spending-overview__heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .spending-overview__filters {
    width: 100%;
  }

  .spending-overview__filter {
    width: 100%;
    flex-basis: auto;
  }

  .spending-date-range__fields {
    align-items: stretch;
    flex-direction: column;
  }

  .spending-date-range label,
  .spending-date-range input {
    width: 100%;
  }

  .spending-goal {
    flex-basis: 100%;
  }
}
</style>
