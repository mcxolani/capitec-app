# Capitec Vue app

A standalone Vue 3 app built with the Composition API and Pinia. Its views, components, styles, and API modules are organized for Vue. It calls the .NET API through the same `/api/...` routes used by the React app.

## Run the demo with Docker

Requirements: Docker Engine and the Docker Compose plugin.

From the repository root, build and start the Vue app and .NET API:

```sh
docker compose -f frontend-vue/compose.yaml up --build
```

Open the Vue app at `http://localhost:8082`. Nginx forwards `/api` requests to .NET. The API is available at `http://localhost:8084`, with Swagger UI at `http://localhost:8084/swagger`.

Stop the demo with:

```sh
docker compose -f frontend-vue/compose.yaml down
```

If those ports are already in use, choose others when starting it:

```sh
VUE_PORT=8083 DOTNET_API_PORT=18084 docker compose -f frontend-vue/compose.yaml up --build
```

## Run locally

Requirements: Node.js 22.18+, npm, and .NET 8.

```sh
npm install
cp .env.example .env.local
npm run dev
```

The Vite proxy forwards `/api` to `http://localhost:5241` by default. Start the .NET API in another terminal from the repository root with:

```sh
dotnet run --project backend/dotnet/Capitec.Api
```

To use a different API port, set `VITE_API_PROXY_TARGET` in `.env.local`. Vite prints the frontend address when the development server starts. Build the app with:

```sh
npm run build
```

## Vue structure

Views live in `src/views`, shared UI in `src/components`, Pinia stores in `src/stores`, and API requests in `src/api`. The branch locator loads branches from `GET /api/branches`, sorts by distance from a searched address or current location, and shows branch hours, address, phone, and directions. The loan simulator loads products and validation rules, submits eligibility checks, and shows repayment schedules from the .NET endpoints. Spending insights uses the customer profile, filters, summary, category breakdown, trends, monthly budgets, and paginated transactions endpoints. Period, category, custom date range, and transaction sort are reflected in the URL. Trend charts offer 6, 12, and 24 month ranges. Charts use Vue ECharts; PrimeVue renders the transaction table, budget progress, and page controls.

Leaflet and Vue Leaflet render the map with OpenStreetMap tiles. Keep the visible map attribution in place and follow the [tile usage policy](https://operations.osmfoundation.org/policies/tiles/). Address search is submitted by the user without autocomplete. The default Nominatim lookup is rate limited to one request per second in each browser tab; for higher traffic, set `VITE_GEOCODER_URL` to a geocoding endpoint intended for your application and follow its [usage policy](https://operations.osmfoundation.org/policies/nominatim/). Set `VITE_MAP_TILE_URL` and matching `VITE_MAP_TILE_ATTRIBUTION` to change tile providers.

PrimeVue 4 and `@primeuix/themes` provide controls, `@lucide/vue` provides icons, and Manrope is bundled as the global font. An app-level error display handles page errors. Page styling is scoped to Vue components and uses flexbox.
