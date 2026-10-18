<script setup lang="ts">
import { computed } from 'vue'
import type { EChartsOption } from 'echarts'
import { BarChart, PieChart } from 'echarts/charts'
import { AriaComponent, GridComponent, TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import Card from 'primevue/card'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Message from 'primevue/message'
import Select from 'primevue/select'
import VChart from 'vue-echarts'
import type { SpendingCategories, SpendingTrends } from '@/types/spending'
import { formatSpendingCurrency } from '@/utils/currency'

use([CanvasRenderer, PieChart, BarChart, AriaComponent, GridComponent, TooltipComponent])

const props = defineProps<{
  categories: SpendingCategories['categories']
  totalAmount: number
  trends: SpendingTrends['trends']
  selectedCategory: string
  loading: boolean
  months: number
}>()

const emit = defineEmits<{
  selectCategory: [category: string]
  selectMonths: [months: number]
}>()

const monthOptions = [
  { label: '6 months', value: 6 },
  { label: '12 months', value: 12 },
  { label: '24 months', value: 24 },
]

const categoryOption = computed<EChartsOption>(() => ({
  aria: {
    enabled: true,
    description: `Spending by category: ${props.categories
      .map((category) => `${category.name}, ${formatSpendingCurrency(category.amount)}`)
      .join('; ')}.`,
  },
  tooltip: { trigger: 'item', formatter: '{b}: R{c} ({d}%)' },
  series: [
    {
      type: 'pie',
      radius: ['52%', '76%'],
      center: ['50%', '48%'],
      itemStyle: { borderColor: '#fff', borderWidth: 3 },
      label: { show: false },
      data: props.categories.map((category) => ({
        name: category.name,
        value: category.amount,
        itemStyle: { color: category.color },
      })),
    },
  ],
}))

const trendOption = computed<EChartsOption>(() => ({
  aria: {
    enabled: true,
    description: `Monthly spending for ${props.trends.length} months, from ${props.trends[0]?.month} to ${props.trends.at(-1)?.month}.`,
  },
  tooltip: { trigger: 'axis', valueFormatter: (value) => formatSpendingCurrency(Number(value)) },
  grid: { left: 12, right: 16, top: 18, bottom: 46, containLabel: true },
  xAxis: {
    type: 'category',
    data: props.trends.map((trend) => formatMonth(trend.month)),
    axisTick: { show: false },
    axisLine: { lineStyle: { color: '#dfe5ec' } },
    axisLabel: { color: '#5e6b73', rotate: 25 },
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      color: '#5e6b73',
      formatter: (value) =>
        `R${new Intl.NumberFormat('en-ZA', { notation: 'compact' }).format(Number(value))}`,
    },
    splitLine: { lineStyle: { color: '#edf0f4' } },
  },
  series: [
    {
      type: 'bar',
      data: props.trends.map((trend) => trend.totalSpent),
      barMaxWidth: 28,
      itemStyle: { color: '#2463eb', borderRadius: [6, 6, 0, 0] },
    },
  ],
}))

function formatMonth(value: string) {
  const [year, month] = value.split('-').map(Number)
  return new Intl.DateTimeFormat('en-ZA', { month: 'short', year: '2-digit' }).format(
    new Date(year, month - 1, 1),
  )
}
</script>

<template>
  <section class="spending-charts" aria-label="Spending charts">
    <Card class="spending-chart-card">
      <template #title>Spending by category</template>
      <template #content>
        <p class="spending-chart-card__description">
          {{ formatSpendingCurrency(totalAmount) }} across {{ categories.length }} categories
        </p>
        <VChart
          v-if="categories.length"
          class="spending-chart"
          :option="categoryOption"
          :loading="loading"
          autoresize
          role="img"
          aria-label="Spending by category donut chart"
        />
        <Message v-else severity="info" :closable="false"
          >No category spending for this period.</Message
        >
        <ul v-if="categories.length" class="spending-category-list" aria-label="Category totals">
          <li v-for="category in categories" :key="category.name">
            <button
              type="button"
              class="spending-category-list__button"
              :aria-pressed="selectedCategory === category.name"
              @click="
                emit('selectCategory', selectedCategory === category.name ? '' : category.name)
              "
            >
              <span class="spending-category-list__name">
                <span
                  class="spending-category-list__dot"
                  :style="{ backgroundColor: category.color }"
                ></span>
                {{ category.name }}
              </span>
              <span>{{ category.percentage }}%</span>
              <strong>{{ formatSpendingCurrency(category.amount) }}</strong>
            </button>
          </li>
        </ul>
      </template>
    </Card>

    <Card class="spending-chart-card">
      <template #title>
        <div class="spending-chart-card__title">
          <span>Monthly spending</span>
          <Select
            :model-value="months"
            :options="monthOptions"
            option-label="label"
            option-value="value"
            aria-label="Trend range"
            @update:model-value="emit('selectMonths', $event)"
          />
        </div>
      </template>
      <template #content>
        <p class="spending-chart-card__description">See how your spending has changed over time.</p>
        <VChart
          class="spending-chart spending-chart--trend"
          :option="trendOption"
          autoresize
          role="img"
          aria-label="Monthly spending bar chart"
        />
        <DataTable :value="trends" size="small" striped-rows scrollable scroll-height="14rem">
          <Column field="month" header="Month" />
          <Column header="Spent">
            <template #body="{ data }">{{ formatSpendingCurrency(data.totalSpent) }}</template>
          </Column>
          <Column field="transactionCount" header="Transactions" />
        </DataTable>
      </template>
    </Card>
  </section>
</template>

<style scoped>
.spending-charts {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 1rem;
}

.spending-chart-card {
  min-width: 0;
  flex: 1 1 24rem;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  box-shadow: 0 6px 20px rgb(32 49 59 / 5%);
}

.spending-chart-card :deep(.p-card-body) {
  padding: 1rem;
}

.spending-chart-card :deep(.p-card-title) {
  color: var(--color-blue-dark);
  font-size: 1rem;
}

.spending-chart-card :deep(.p-card-content) {
  padding: 0;
}

.spending-chart-card__description {
  margin: 0 0 0.5rem;
  color: var(--color-muted);
  font-size: 0.82rem;
}

.spending-chart-card__title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.spending-chart-card__title :deep(.p-select) {
  width: 9rem;
  font-size: 0.8rem;
  font-weight: 400;
}

.spending-chart {
  width: 100%;
  height: 17rem;
}

.spending-chart--trend {
  height: 17rem;
  margin-bottom: 0.75rem;
}

.spending-category-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin: 0.5rem 0 0;
  padding: 0;
  list-style: none;
}

.spending-category-list__button {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.8rem;
  padding: 0.35rem 0.45rem;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--color-muted);
  font: inherit;
  font-size: 0.8rem;
  text-align: left;
  cursor: pointer;
}

.spending-category-list__button:hover,
.spending-category-list__button[aria-pressed='true'] {
  background: #f1f5ff;
}

.spending-category-list__name {
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  gap: 0.45rem;
  color: var(--color-ink);
}

.spending-category-list__dot {
  width: 0.65rem;
  height: 0.65rem;
  flex: 0 0 auto;
  border-radius: 50%;
}

.spending-category-list strong {
  color: var(--color-blue-dark);
  text-align: right;
}

@media (max-width: 620px) {
  .spending-chart-card {
    flex-basis: 100%;
  }

  .spending-chart-card__title {
    align-items: flex-start;
    flex-direction: column;
  }

  .spending-chart-card__title :deep(.p-select) {
    width: 100%;
  }
}
</style>
