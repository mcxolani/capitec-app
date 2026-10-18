<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Clock3, CreditCard, Info, Wallet } from '@lucide/vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import Select from 'primevue/select'
import SpendingCharts from '@/components/spending-insights/SpendingCharts.vue'
import { useSpendingStore } from '@/stores/spendingStore'
import type { SpendingPeriod } from '@/types/spending'
import { formatSpendingCurrency } from '@/utils/currency'

const spendingStore = useSpendingStore()
const route = useRoute()
const router = useRouter()
const periods: SpendingPeriod[] = ['7d', '30d', '90d', '1y']

const period = computed<SpendingPeriod>({
  get: () => periods.find((value) => value === route.query.period) ?? '30d',
  set: (value) => {
    void router.replace({
      query: { ...route.query, period: value === '30d' ? undefined : value },
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

watch(
  [period, category],
  ([selectedPeriod, selectedCategory]) =>
    void spendingStore.loadPeriod(selectedPeriod, selectedCategory || undefined),
)
onMounted(() => spendingStore.load(period.value, category.value || undefined))
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
        @click="spendingStore.load(period, category || undefined)"
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
        @select-category="category = $event"
      />

      <p class="spending-view__disclaimer">
        These figures use demo data and are for illustration only.
      </p>
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

.spending-view__disclaimer {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.76rem;
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
}
</style>
