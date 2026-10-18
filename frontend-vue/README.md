# Capitec Vue app

A standalone Vue 3 app built with the Composition API and Pinia. Its views, components, styles, and API modules are organized for Vue. It calls the Spring Boot API through the same `/api/...` routes used by the other frontend.

## Run locally

Requirements: Node.js 22.18+, npm, and the Spring Boot API.

```sh
npm install
cp .env.example .env.local
npm run dev
```

The Vite proxy forwards `/api` to `http://localhost:8081` by default. Start Spring Boot in another terminal from this folder with:

```sh
mvn -f ../backend/springboot/pom.xml spring-boot:run
```

To use a different API port, set `VITE_API_PROXY_TARGET` in `.env.local`. Vite prints the frontend address when the development server starts. Build the app with:

```sh
npm run build
```

## Vue structure

Views live in `src/views`, shared UI in `src/components`, Pinia stores in `src/stores`, and Spring Boot requests in `src/api`. The branch locator currently loads its branch list from `GET /api/branches`; the loan and spending views are next to be implemented.

PrimeVue provides controls, `@lucide/vue` provides icons, and Manrope is bundled as the global font. Page styling is scoped to Vue components and uses flexbox.
