<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppFooter from '@/components/layout/AppFooter.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
</script>

<template>
  <div class="app-shell">
    <AppHeader />
    <main class="app-shell__content">
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>

<style>
.app-shell {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
}

.app-shell__content {
  width: 100%;
  max-width: 1180px;
  flex: 1;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
}

@media (max-width: 720px) {
  .app-shell__content {
    padding: 1.5rem 1rem 3rem;
  }
}
</style>
