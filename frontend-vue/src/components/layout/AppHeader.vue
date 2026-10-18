<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { Menu, X } from '@lucide/vue'
import Button from 'primevue/button'

const route = useRoute()
const menuOpen = ref(false)

const links = [
  { to: '/', label: 'Home' },
  { to: '/branch-locator', label: 'Branch locator' },
  { to: '/loan-eligibility', label: 'Loan eligibility' },
  { to: '/spending-insights', label: 'Spending insights' },
]

function isActive(path: string) {
  return path === '/' ? route.path === '/' : route.path.startsWith(path)
}
</script>

<template>
  <header class="site-header">
    <div class="site-header__content">
      <RouterLink to="/" class="site-brand" aria-label="Capitec home">
         <img src="https://www.capitecbank.co.za/globalassets/approved-images/icons/capitec-logo-small.svg" alt="" aria-hidden="true" />
        <span>Capitec</span>
      </RouterLink>

      <Button
        class="site-menu-toggle"
        text
        rounded
        :aria-label="menuOpen ? 'Close menu' : 'Open menu'"
        :aria-expanded="menuOpen"
        @click="menuOpen = !menuOpen"
      >
        <X v-if="menuOpen" :size="24" aria-hidden="true" />
        <Menu v-else :size="24" aria-hidden="true" />
      </Button>

      <nav class="site-nav" :class="{ 'site-nav--open': menuOpen }" aria-label="Main">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="site-nav__link"
          :class="{ 'site-nav__link--active': isActive(link.to) }"
          @click="menuOpen = false"
        >
          {{ link.label }}
        </RouterLink>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  border-bottom: 1px solid var(--color-border);
  background: #fff;
}

.site-header__content {
  position: relative;
  display: flex;
  max-width: 1280px;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin: 0 auto;
  padding: 1rem 1.5rem;
}

.site-brand {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  color: var(--color-blue-dark);
  font-size: 1.2rem;
  font-weight: 800;
  text-decoration: none;
}

.site-brand svg {
  color: var(--color-blue);
}

.site-nav {
  display: flex;
  align-items: center;
  gap: 1.4rem;
}

.site-nav__link {
  padding: 0.55rem 0;
  border-bottom: 2px solid transparent;
  color: var(--color-muted);
  font-size: 0.875rem;
  font-weight: 650;
  text-decoration: none;
}

.site-nav__link:hover,
.site-nav__link--active {
  border-bottom-color: var(--color-blue);
  color: var(--color-blue-dark);
}

.site-menu-toggle.p-button {
  display: none;
  color: var(--color-blue-dark);
}

@media (max-width: 760px) {
  .site-menu-toggle.p-button {
    display: inline-flex;
  }

  .site-nav {
    position: absolute;
    z-index: 2;
    top: calc(100% - 0.35rem);
    right: 1rem;
    display: none;
    min-width: 230px;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    padding: 0.65rem 1rem;
    border: 1px solid var(--color-border);
    border-radius: 14px;
    background: #fff;
    box-shadow: 0 10px 26px rgb(22 45 80 / 14%);
  }

  .site-nav--open {
    display: flex;
  }

  .site-nav__link {
    padding: 0.8rem 0.45rem;
  }
}
</style>
