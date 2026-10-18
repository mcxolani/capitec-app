<script setup lang="ts">
import Button from 'primevue/button'
import Card from 'primevue/card'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Message from 'primevue/message'
import Select from 'primevue/select'
import type { SpendingSort, SpendingTransactions } from '@/types/spending'
import { formatSpendingCurrency } from '@/utils/currency'

defineProps<{
  transactions: SpendingTransactions['transactions']
  hasMore: boolean
  loading: boolean
  error: string
  sortBy: SpendingSort
}>()

const emit = defineEmits<{
  changeSort: [sortBy: SpendingSort]
  loadMore: []
}>()

const sortOptions: { label: string; value: SpendingSort }[] = [
  { label: 'Newest first', value: 'date_desc' },
  { label: 'Oldest first', value: 'date_asc' },
  { label: 'Highest amount', value: 'amount_desc' },
  { label: 'Lowest amount', value: 'amount_asc' },
]

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-ZA', { dateStyle: 'medium' }).format(new Date(date))
}
</script>

<template>
  <Card class="spending-transactions">
    <template #title>
      <div class="spending-transactions__heading">
        <div>
          <h2>Transactions</h2>
          <p>Review the activity for your selected period.</p>
        </div>
        <Select
          :model-value="sortBy"
          :options="sortOptions"
          option-label="label"
          option-value="value"
          aria-label="Sort transactions"
          @update:model-value="emit('changeSort', $event)"
        />
      </div>
    </template>
    <template #content>
      <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
      <DataTable
        :value="transactions"
        data-key="id"
        size="small"
        striped-rows
        :loading="loading"
        :empty-message="loading ? 'Loading transactions…' : 'No transactions for this period.'"
      >
        <Column header="Date">
          <template #body="{ data }">{{ formatDate(data.date) }}</template>
        </Column>
        <Column field="merchant" header="Merchant" />
        <Column header="Category">
          <template #body="{ data }">
            <span class="spending-transaction-category">
              <span :style="{ backgroundColor: data.categoryColor }"></span>{{ data.category }}
            </span>
          </template>
        </Column>
        <Column header="Amount" class="spending-transactions__amount">
          <template #body="{ data }">{{ formatSpendingCurrency(data.amount) }}</template>
        </Column>
      </DataTable>
      <div v-if="hasMore" class="spending-transactions__more">
        <Button
          label="Load more transactions"
          outlined
          :loading="loading"
          :disabled="loading"
          @click="emit('loadMore')"
        />
      </div>
    </template>
  </Card>
</template>

<style scoped>
.spending-transactions {
  border: 1px solid var(--color-border);
  border-radius: 16px;
  box-shadow: 0 6px 20px rgb(32 49 59 / 5%);
}

.spending-transactions :deep(.p-card-body) {
  padding: 1rem;
}

.spending-transactions :deep(.p-card-title) {
  color: var(--color-blue-dark);
  font-size: 1rem;
}

.spending-transactions :deep(.p-card-content) {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 0;
}

.spending-transactions__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.spending-transactions__heading h2 {
  margin: 0;
  font-size: 1rem;
}

.spending-transactions__heading p {
  margin: 0.35rem 0 0;
  color: var(--color-muted);
  font-size: 0.82rem;
  font-weight: 400;
}

.spending-transaction-category {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.spending-transaction-category span {
  width: 0.6rem;
  height: 0.6rem;
  flex: 0 0 auto;
  border-radius: 50%;
}

.spending-transactions__amount {
  text-align: right;
}

.spending-transactions__more {
  display: flex;
  justify-content: center;
}

@media (max-width: 620px) {
  .spending-transactions__heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .spending-transactions__heading :deep(.p-select) {
    width: 100%;
  }
}
</style>
