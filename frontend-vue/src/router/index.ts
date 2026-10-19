import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: () => import('@/views/HomeView.vue') },
    { path: '/branch-locator', component: () => import('@/views/BranchLocatorView.vue') },
    {
      path: '/loan-eligibility',
      component: () => import('@/views/LoanEligibilityView.vue'),
    },
    {
      path: '/spending-insights',
      component: () => import('@/views/SpendingInsightsView.vue'),
    },
    { path: '/:pathMatch(.*)*', component: () => import('@/views/NotFoundView.vue') },
  ],
})

export default router
