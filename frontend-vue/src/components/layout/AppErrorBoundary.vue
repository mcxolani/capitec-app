<script setup lang="ts">
import { onErrorCaptured, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Button from 'primevue/button'

const hasError = ref(false)
const route = useRoute()

watch(
  () => route.fullPath,
  () => {
    hasError.value = false
  },
)

onErrorCaptured(() => {
  hasError.value = true
  return false
})
</script>

<template>
  <slot v-if="!hasError" />

  <section v-else class="app-error" role="alert">
    <div class="app-error__content">
      <p class="app-error__eyebrow">Page error</p>
      <h1>We couldn’t load this page.</h1>
      <p>Try again. If the problem continues, return to the home page and try another tool.</p>
      <div class="app-error__actions">
        <Button label="Try again" @click="hasError = false" />
        <Button as="a" href="/" label="Go to home" outlined />
      </div>
    </div>
  </section>
</template>

<style scoped>
.app-error {
  display: flex;
  min-height: 24rem;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.app-error__content {
  display: flex;
  max-width: 34rem;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.8rem;
}

.app-error__eyebrow {
  margin: 0;
  color: var(--color-blue);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.app-error h1 {
  margin: 0;
}

.app-error__content > p:not(.app-error__eyebrow) {
  margin: 0;
  color: var(--color-muted);
}

.app-error__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  margin-top: 0.5rem;
}
</style>
