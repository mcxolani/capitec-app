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
      component: () => import('@/views/FeaturePlaceholderView.vue'),
      props: {
        eyebrow: 'Spending tools',
        title: 'Spending insights',
        description: 'Explore spending patterns and see how your monthly budgets are doing.',
      },
    },
    { path: '/:pathMatch(.*)*', component: () => import('@/views/NotFoundView.vue') },
  ],
})

export default router
