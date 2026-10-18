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

Views live in `src/views`, shared UI in `src/components`, Pinia stores in `src/stores`, and Spring Boot requests in `src/api`. The branch locator loads branches from `GET /api/branches`, sorts by distance from a searched address or current location, and shows branch hours, address, phone, and directions. The loan simulator loads products and validation rules, submits eligibility checks, and shows repayment schedules from the same Spring Boot endpoints. Spending insights loads the customer profile and selected-period summary from Spring Boot, with the period stored in the URL.

Leaflet and Vue Leaflet render the map with OpenStreetMap tiles. Keep the visible map attribution in place and follow the [tile usage policy](https://operations.osmfoundation.org/policies/tiles/). Address search is submitted by the user without autocomplete. The default Nominatim lookup is rate limited to one request per second in each browser tab; for higher traffic, set `VITE_GEOCODER_URL` to a geocoding endpoint intended for your application and follow its [usage policy](https://operations.osmfoundation.org/policies/nominatim/). Set `VITE_MAP_TILE_URL` and matching `VITE_MAP_TILE_ATTRIBUTION` to change tile providers.

PrimeVue provides controls, `@lucide/vue` provides icons, and Manrope is bundled as the global font. Page styling is scoped to Vue components and uses flexbox.
