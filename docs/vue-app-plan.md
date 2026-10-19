# Vue 3 frontend plan

This plan describes an independent Vue application for the Capitec demo. It uses Vue 3, the Composition API, and Pinia, with its own views, components, styling, and API modules. It shares the Spring Boot API contract with the React app, but does not port React components, CSS, mocks, or folder conventions.

## Keep the first version simple

- Put the app in `frontend-vue/` so it can be developed and run independently of the React app.
- Use Vue 3 with TypeScript and `<script setup>`, scaffolded with the official [`create-vue`](https://vuejs.org/guide/quick-start.html) tool.
- Use [Vue Router](https://router.vuejs.org/guide/) for the current routes and [Pinia](https://pinia.vuejs.org/getting-started) for shared page data.
- Call the Spring Boot API from the start. Keep endpoint functions in Vue API modules and call them from Pinia stores; do not copy the React mocks or create a second mock layer.
- Give Vue components their own scoped styles and class names. Use the Capitec blue-and-white visual direction, PrimeVue controls, and flexbox layouts. Do not add CSS Grid.
- Use open-source Vue components and charts instead of building replacements: [PrimeVue](https://primevue.org/) for common controls, [Vue ECharts](https://github.com/ecomfe/vue-echarts) for charts, and the current [Lucide Vue package](https://github.com/lucide-icons/lucide/blob/main/docs/guide/installation.md) for icons.

## Pages and routes

| Route                | Page              | Main behavior                                                                                                             |
| -------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `/`                  | Home              | Match the existing app's simple Capitec-inspired home page, with links to the app's own branch, loan, and spending tools. |
| `/branch-locator`    | Branch locator    | Search an address, use browser location, and show nearby demo branches on the map.                                        |
| `/loan-eligibility`  | Loan simulator    | Load products and validation rules, validate the form, and show eligibility and repayment results.                        |
| `/spending-insights` | Spending insights | Show summary cards, category and trend charts, budget progress, and filterable transactions.                              |
| `/:pathMatch(.*)*`   | Not found         | Show the shared not-found page for unknown routes.                                                                        |

Use a shared header and footer. Lazy-load views through Vue Router; the router supports dynamic imports directly.

## API and mock data

Keep API modules in `src/api/`. Views call Pinia stores, and stores call these modules; components do not call `fetch` directly.

- **Branches:** load `GET /api/branches`. Keep Google Places autocomplete and distance sorting in the Vue app.
- **Loans:** call the four documented loan endpoints in [`LoanEligibilitySimulatorEndpoints.md`](LoanEligibilitySimulatorEndpoints.md). The API returns the documented `{ "products": [...] }` wrapper.
- **Spending:** call all seven endpoints in [`CustomerSpendingInsightsEndpoints.md`](CustomerSpendingInsightsEndpoints.md), including the current API's category, custom date, sorting, and pagination query parameters.
- Use same-origin paths such as `/api/branches`; configure Vite to proxy `/api` to the Spring Boot port during development. Do not add mock fallbacks or a backend-switch abstraction.

## Pinia state

Create three small stores, one for each page that loads API data:

- `useBranchStore`: branches, loading state, and error state.
- `useLoanStore`: products, validation rules, form submission, and the latest result.
- `useSpendingStore`: profile, dashboard results, current filters, and transaction pagination.

Keep temporary UI state in the page or component that uses it: open menus, selected map marker, and form input before submission do not need a global store. Keep spending filters synchronized with Vue Router query parameters so refresh, browser navigation, and shared links preserve the view.

Stores should call API functions and expose the data and actions the page needs. Avoid generic store factories, defensive layers for impossible data shapes, and duplicate copies of API data.

## Components and styling

Use a Vue-oriented structure with views, stores, API modules, and reusable components:

```text
frontend-vue/
  src/
    api/
    components/
      layout/
      branch-locator/
      loan-eligibility/
      spending-insights/
    views/
    router/
    stores/
    utils/
    types/
    App.vue
    main.ts
```

Use `<script setup>` and Composition API in components, `defineStore` for shared page data, and component-scoped styles where possible. Use flexbox for page sections and responsive arrangements. Use PrimeVue for controls such as buttons, selects, date inputs, tables, progress bars, and messages, styled to fit the Capitec blue-and-white visual direction. Use Lucide icons rather than custom icon SVGs.

For spending charts, use Vue ECharts with only the needed chart modules. Keep the category list and monthly data table as readable alternatives to the donut and trend charts. Use the chart library for visualization, while keeping filtering and aggregation in ordinary TypeScript functions.

Add the Manrope font once in the global stylesheet. Reuse the current spacing, colors, borders, responsive breakpoints, and input treatment to avoid introducing another design system.

## Build steps

1. Scaffold `frontend-vue/` with TypeScript, Vue Router, and Pinia using `npm create vue@latest`.
2. Add the Vue app shell, original header/footer, global font and theme, and responsive flexbox layout.
3. Add a small API client and Vite proxy, then load branches through a Pinia store from `GET /api/branches`.
4. Add the loan API module and store, then build the loan simulator with Vue components and the documented Spring routes.
5. Add the spending API module and store, then build the dashboard with Vue ECharts, URL-backed filters, and transaction pagination.
6. Add a small error display using Vue's error-capture hook.
7. Verify the main flows manually, run `npm run build` and `npm run lint`, and document how to start the Vue app and Spring Boot API.

## Done when

- The four app views and not-found route work in the Vue app.
- The Vue app calls the same Spring Boot endpoint and response contracts as the React app.
- Shared data is held in the three focused Pinia stores; component-only state stays local.
- Styling follows the current app, uses flexbox layouts, and has no CSS Grid declarations.
- Icons, common controls, and charts use their Vue-compatible open-source libraries.
- The production build and lint checks pass.

## Out of scope

Rebuilding the backend, adding a database or authentication, porting React-specific libraries directly, changing the current API behavior, and introducing a large design system or abstraction layer.
