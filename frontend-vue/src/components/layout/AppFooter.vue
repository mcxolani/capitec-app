<template>
  <footer class="site-footer">
    <div class="site-footer__content">
      <div class="site-footer__brand">
        <strong>Capitec</strong>
        <p>Tools for everyday money decisions.</p>
      </div>
      <nav class="site-footer__links" aria-label="Footer">
        <RouterLink to="/branch-locator">Branches</RouterLink>
        <RouterLink to="/loan-eligibility">Loans</RouterLink>
        <RouterLink to="/spending-insights">Spending insights</RouterLink>
      </nav>
      <small>Demo application. Loan estimates and spending figures are illustrative.</small>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  border-top: 1px solid var(--color-border);
  background: #f6f8fb;
  color: var(--color-muted);
}

.site-footer__content {
  display: flex;
  max-width: 1180px;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 2rem;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 1.5rem;
}

.site-footer__brand {
  flex: 1 1 14rem;
}

.site-footer strong {
  color: var(--color-ink);
  font-size: 1.1rem;
}

.site-footer p,
.site-footer__links {
  font-size: 0.85rem;
}

.site-footer__links {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.site-footer a {
  color: inherit;
  text-decoration: none;
}

.site-footer a:hover {
  color: var(--color-blue-dark);
  text-decoration: underline;
}

.site-footer small {
  flex: 1 0 100%;
  padding-top: 1.2rem;
  border-top: 1px solid var(--color-border);
  font-size: 0.75rem;
}

@media (max-width: 720px) {
  .site-footer__content {
    padding: 2rem 1rem 1rem;
  }
}
</style>
