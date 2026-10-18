<script setup lang="ts">
import { ArrowRight, Calculator, ChartPie, Landmark, MapPin } from '@lucide/vue'
import Button from 'primevue/button'
import Card from 'primevue/card'

const tools = [
  {
    path: '/branch-locator',
    title: 'Find a branch',
    description: 'See branch locations, opening hours and contact details.',
    action: 'Explore branches',
    icon: MapPin,
  },
  {
    path: '/loan-eligibility',
    title: 'Plan a loan',
    description: 'Estimate a loan amount and what the monthly repayments could be.',
    action: 'Try the calculator',
    icon: Calculator,
  },
  {
    path: '/spending-insights',
    title: 'Understand your spending',
    description: 'Explore spending trends, categories and monthly budgets.',
    action: 'View spending',
    icon: ChartPie,
  },
]
</script>

<template>
  <div class="home-view">
    <section class="welcome-banner" aria-labelledby="welcome-title">
      <div class="welcome-banner__copy">
        <p class="welcome-banner__eyebrow">Everyday banking, made clearer</p>
        <h1 id="welcome-title">Banking tools for your next move.</h1>
        <p class="welcome-banner__description">
          Find a branch, estimate a loan or get a better view of where your money goes.
        </p>
        <Button as="a" href="#tool-options" class="welcome-banner__action">
          Explore your tools <ArrowRight :size="18" aria-hidden="true" />
        </Button>
      </div>

      <div class="welcome-art" aria-hidden="true">
        <span class="welcome-art__mark"><Landmark :size="32" aria-hidden="true" /></span>
        <p class="welcome-art__label">Your next step</p>
        <strong>starts with a clearer picture.</strong>
        <span class="welcome-art__dot welcome-art__dot--one" aria-hidden="true"></span>
        <span class="welcome-art__dot welcome-art__dot--two" aria-hidden="true"></span>
      </div>
    </section>

    <section id="tool-options" class="tool-section" aria-labelledby="tools-title">
      <div class="tool-section__heading">
        <p class="tool-section__eyebrow">Choose a tool</p>
        <h2 id="tools-title">What would you like to do?</h2>
      </div>

      <div class="tool-list">
        <Card v-for="tool in tools" :key="tool.path" class="tool-card">
          <template #content>
            <article class="tool-card__content">
              <span class="tool-card__icon">
                <component :is="tool.icon" :size="24" aria-hidden="true" />
              </span>
              <h3>{{ tool.title }}</h3>
              <p>{{ tool.description }}</p>
              <RouterLink :to="tool.path" class="tool-card__link">
                {{ tool.action }} <ArrowRight :size="16" aria-hidden="true" />
              </RouterLink>
            </article>
          </template>
        </Card>
      </div>
      <p class="tool-section__note">Loan estimates and spending figures use demo data.</p>
    </section>
  </div>
</template>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  gap: 3.5rem;
}

.welcome-banner {
  display: flex;
  min-height: 330px;
  align-items: center;
  gap: 3rem;
  padding: 2.5rem;
  border-radius: 28px;
  background: var(--color-canvas);
}

.welcome-banner__copy,
.welcome-art {
  min-width: 0;
  flex: 1 1 0;
}

.welcome-banner__eyebrow,
.tool-section__eyebrow {
  margin: 0 0 0.85rem;
  color: var(--color-blue);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.welcome-banner h1 {
  max-width: 14ch;
  margin: 0;
  color: var(--color-blue-dark);
  font-size: clamp(2.3rem, 4vw, 3.65rem);
  line-height: 1.08;
  letter-spacing: -0.045em;
}

.welcome-banner__description {
  max-width: 42ch;
  margin: 1.25rem 0 1.75rem;
  color: var(--color-muted);
  line-height: 1.75;
}

.welcome-banner__action {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  gap: 0.6rem;
  padding: 0.7rem 1.25rem;
  border-radius: 999px;
  background: var(--color-blue);
  color: #fff;
  font-weight: 700;
  text-decoration: none;
}

.welcome-banner__action:hover {
  background: var(--color-blue-dark);
}

.welcome-art {
  position: relative;
  display: flex;
  min-height: 250px;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  overflow: hidden;
  gap: 0.5rem;
  padding: 2rem;
  border-radius: 110px 24px 24px 24px;
  background: var(--color-blue-dark);
  color: #fff;
}

.welcome-art__mark {
  display: flex;
  width: 58px;
  height: 58px;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  border-radius: 50%;
  background: #fff;
  color: var(--color-blue-dark);
  position: relative;
  z-index: 1;
}

.welcome-art__label {
  position: relative;
  z-index: 1;
  margin: 0;
  color: #c9d9ff;
  font-size: 0.9rem;
}

.welcome-art strong {
  position: relative;
  z-index: 1;
  max-width: 18ch;
  font-size: clamp(1.45rem, 2.3vw, 2rem);
  line-height: 1.25;
}

.welcome-art__dot {
  position: absolute;
  display: block;
  border-radius: 50%;
  background: #6fa0ff;
  z-index: 0;
}

.welcome-art__dot--one {
  top: -3.5rem;
  right: -2rem;
  width: 10rem;
  height: 10rem;
  opacity: 0.7;
}

.welcome-art__dot--two {
  right: 5rem;
  bottom: -5.5rem;
  width: 11rem;
  height: 11rem;
  background: #e5232d;
}

.tool-section__heading {
  margin-bottom: 1.5rem;
}

.tool-section__heading h2 {
  margin: 0;
  color: var(--color-ink);
  font-size: clamp(1.55rem, 2.8vw, 2rem);
}

.tool-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.tool-card.p-card {
  min-width: 15rem;
  flex: 1 1 15rem;
  border: 1px solid var(--color-border);
  border-radius: 18px;
  box-shadow: 0 8px 24px rgb(32 49 59 / 5%);
}

.tool-card :deep(.p-card-body) {
  display: flex;
  height: 100%;
  padding: 1.35rem;
}

.tool-card :deep(.p-card-content) {
  display: flex;
  flex: 1;
  padding: 0;
}

.tool-card__content {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.9rem;
}

.tool-card__icon {
  display: flex;
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: #e8f0ff;
  color: var(--color-blue-dark);
}

.tool-card h3 {
  margin: 0;
  font-size: 1.12rem;
}

.tool-card p {
  flex: 1;
  margin: 0;
  color: var(--color-muted);
  font-size: 0.9rem;
  line-height: 1.65;
}

.tool-card__link {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--color-blue-dark);
  font-size: 0.9rem;
  font-weight: 800;
  text-decoration: none;
}

.tool-card__link:hover {
  color: var(--color-blue);
}

.tool-section__note {
  margin: 1rem 0 0;
  color: var(--color-muted);
  font-size: 0.8rem;
}

@media (max-width: 760px) {
  .welcome-banner {
    flex-direction: column;
    align-items: stretch;
    gap: 2rem;
    padding: 1.5rem;
  }

  .welcome-art {
    min-height: 220px;
    border-top-left-radius: 70px;
  }
}
</style>
