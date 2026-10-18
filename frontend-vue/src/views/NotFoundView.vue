<template>
  <section class="not-found-view">
    <h1>Page not found</h1>
    <p>The page you are looking for does not exist.</p>
    <RouterLink to="/" class="not-found-view__link">Back to home</RouterLink>
  </section>
</template>

<style scoped>
.not-found-view {
  max-width: 32rem;
  margin: 3rem auto;
  text-align: center;
}

.not-found-view p {
  margin-bottom: 1.5rem;
  color: var(--color-muted);
}

.not-found-view__link {
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  padding: 0.6rem 1.1rem;
  border-radius: 999px;
  background: var(--color-blue);
  color: #fff;
  font-weight: 700;
  text-decoration: none;
}
</style>
