<script setup lang="ts">
import { onMounted } from 'vue'
import { Clock3, MapPin, Phone } from '@lucide/vue'
import Card from 'primevue/card'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import { useBranchStore } from '@/stores/branchStore'

const branchStore = useBranchStore()

onMounted(() => branchStore.loadBranches())
</script>

<template>
  <section class="branch-view" aria-labelledby="branch-title">
    <header class="branch-view__heading">
      <p class="branch-view__eyebrow">Branch finder</p>
      <h1 id="branch-title">Find a branch</h1>
      <p>Browse branch locations and check their opening hours and contact details.</p>
    </header>

    <Message v-if="branchStore.error" severity="error" :closable="false">
      {{ branchStore.error }}
    </Message>

    <div v-else-if="branchStore.loading" class="branch-view__loading" role="status">
      <ProgressSpinner aria-label="Loading branches" />
      <span>Loading branches…</span>
    </div>

    <div v-else class="branch-list">
      <Card v-for="branch in branchStore.branches" :key="branch.id" class="branch-card">
        <template #title>{{ branch.name }}</template>
        <template #content>
          <div class="branch-card__details">
            <p><MapPin :size="17" aria-hidden="true" /> {{ branch.address }}</p>
            <p><Clock3 :size="17" aria-hidden="true" /> {{ branch.hours }}</p>
            <a :href="`tel:${branch.phone}`"
              ><Phone :size="17" aria-hidden="true" /> {{ branch.phone }}</a
            >
          </div>
        </template>
      </Card>
    </div>
  </section>
</template>

<style scoped>
.branch-view__heading {
  max-width: 46rem;
  margin: 0 auto 1.75rem;
  text-align: center;
}

.branch-view__eyebrow {
  margin: 0 0 0.65rem;
  color: var(--color-blue);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.branch-view h1 {
  margin: 0;
  color: var(--color-blue-dark);
  font-size: clamp(2rem, 3.5vw, 2.8rem);
}

.branch-view__heading > p:last-child {
  margin: 0.75rem 0 0;
  color: var(--color-muted);
}

.branch-view__loading {
  display: flex;
  min-height: 12rem;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: var(--color-muted);
}

.branch-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.branch-card.p-card {
  min-width: 17rem;
  flex: 1 1 17rem;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  box-shadow: 0 6px 20px rgb(32 49 59 / 5%);
}

.branch-card :deep(.p-card-body) {
  height: 100%;
  padding: 1.25rem;
}

.branch-card :deep(.p-card-title) {
  color: var(--color-blue-dark);
  font-size: 1.05rem;
}

.branch-card :deep(.p-card-content) {
  padding: 0;
}

.branch-card__details {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  color: var(--color-muted);
  font-size: 0.9rem;
}

.branch-card__details p,
.branch-card__details a {
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  margin: 0;
}

.branch-card__details svg {
  flex: 0 0 auto;
  margin-top: 0.15rem;
  color: var(--color-blue);
}

.branch-card__details a {
  color: var(--color-blue-dark);
  font-weight: 700;
  text-decoration: none;
}
</style>
