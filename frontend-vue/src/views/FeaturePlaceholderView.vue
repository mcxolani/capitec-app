<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  description: string
}>()
</script>

<template>
  <section class="feature-placeholder">
    <p class="feature-placeholder__eyebrow">{{ eyebrow }}</p>
    <h1>{{ title }}</h1>
    <p>{{ description }}</p>
  </section>
</template>

<style scoped>
.feature-placeholder {
  max-width: 44rem;
  margin: 2rem auto;
  text-align: center;
}

.feature-placeholder__eyebrow {
  color: var(--color-blue);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.feature-placeholder h1 {
  margin: 0 0 0.75rem;
}

.feature-placeholder > p:last-child {
  color: var(--color-muted);
}
</style>
