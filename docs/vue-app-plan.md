# Vue 3 frontend plan

This plan describes a separate Vue version of the current Capitec demo app. It keeps the same pages, demo behavior, and API contracts while using Vue 3, the Composition API, and Pinia. The existing React app remains the reference for behavior and styling.

## Keep the first version simple

- Put the app in `frontend-vue/` so it can be developed and run independently of the React app.
- Use Vue 3 with TypeScript and `<script setup>`, scaffolded with the official [`create-vue`](https://vuejs.org/guide/quick-start.html) tool.
- Use [Vue Router](https://router.vuejs.org/guide/) for the current routes and [Pinia](https://pinia.vuejs.org/getting-started) for shared page data.
- Start with the existing deterministic mock data. Keep API functions separate from components so they can later call the Spring Boot or .NET API without rewriting pages.
- Keep the existing Manrope font, color palette, spacing, class-name conventions, and flexbox-only layouts. Do not add CSS Grid.
- Use open-source Vue components and charts instead of building replacements: [PrimeVue](https://primevue.org/) for common controls, [Vue ECharts](https://github.com/ecomfe/vue-echarts) for charts, and the current [Lucide Vue package](https://github.com/lucide-icons/lucide/blob/main/docs/guide/installation.md) for icons.

## Pages and routes

| Route                | Page              | Main behavior                                                                                                             |
| -------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `/`                  | Home              | Match the existing app's simple Capitec-inspired home page, with links to the app's own branch, loan, and spending tools. |
| `/branch-locator`    | Branch locator    | Search an address, use browser location, and show nearby demo branches on the map.                                        |
| `/loan-eligibility`  | Loan simulator    | Load products and validation rules, validate the form, and show eligibility and repayment results.                        |
| `/spending-insights` | Spending insights | Show summary cards, category and trend charts, budget progress, and filterable transactions.                              |
| `/:pathMatch(.*)*`   | Not found         | Show the shared not-found page for unknown routes.                                                                        |

Use a shared header, footer, and page container. Lazy-load the page components through Vue Router; the router supports dynamic imports directly.

## API and mock data

Keep plain API modules in `src/api/`. Page components call these functions through their Pinia stores; they do not call `fetch` or read mock data directly.

- **Branches:** reuse the branch records from `src/api/branchApi.ts`. Keep Google Places autocomplete and distance sorting in the browser. When a backend is available, use the `GET /api/branches` route described in the existing backend plans.
- **Loans:** port the products, validation rules, and calculations from `src/api/loanApi.ts` and `src/utils/loan*.ts`. Keep the documented endpoints in [`LoanEligibilitySimulatorEndpoints.md`](LoanEligibilitySimulatorEndpoints.md). Normalize the mock's bare product array to the documented `{ "products": [...] }` contract in the API module.
- **Spending:** port the deterministic transaction generator and aggregation behavior from `src/api/spendingApi.ts` and `src/api/spendingData.ts`. Keep all seven routes from [`CustomerSpendingInsightsEndpoints.md`](CustomerSpendingInsightsEndpoints.md), along with the current page's category, custom date, URL filter, sorting, and pagination behavior.
- **Backend switch:** when either backend is implemented, replace the mock function bodies with `fetch('/api/...')` while retaining the same function names and response shapes. Use the Vite `/api` proxy in development. Do not build a second data layer or a configurable mock framework for the first version.

## Pinia state

Create three small stores, one for each page that loads API data:

- `useBranchStore`: branches, loading state, and error state.
- `useLoanStore`: products, validation rules, form submission, and the latest result.
- `useSpendingStore`: profile, dashboard results, current filters, and transaction pagination.

Keep temporary UI state in the page or component that uses it: open menus, selected map marker, and form input before submission do not need a global store. Keep spending filters synchronized with Vue Router query parameters so refresh, browser navigation, and shared links preserve the view.

Stores should call API functions and expose the data and actions the page needs. Avoid generic store factories, defensive layers for impossible data shapes, and duplicate copies of API data.

## Components and styling

Use a small structure based on the current app's feature boundaries:

```text
frontend-vue/
  src/
    api/
    components/
      layout/
      branch-locator/
      loan-eligibility/
      spending-insights/
    pages/
    router/
    stores/
    utils/
    App.vue
    main.ts
```

Keep page and feature class names aligned with the existing React pages where practical, so the same visual language is easy to recognize. Use flexbox for page sections and responsive arrangements. Use PrimeVue for controls such as buttons, selects, date inputs, tables, progress bars, and messages, styled to fit the existing blue-and-white theme. Use Lucide icons rather than custom icon SVGs.

For spending charts, use Vue ECharts with only the needed chart modules. Keep the category list and monthly data table as readable alternatives to the donut and trend charts. Use the chart library for visualization, while keeping filtering and aggregation in ordinary TypeScript functions.

Add the Manrope font once in the global stylesheet. Reuse the current spacing, colors, borders, responsive breakpoints, and input treatment to avoid introducing another design system.

## Build steps

1. Scaffold `frontend-vue/` with TypeScript, Vue Router, Pinia, and test support using `npm create vue@latest`.
2. Add the shared global font and styles, app shell, header, footer, and responsive flexbox page container.
3. Add the routes and simple page shells; confirm navigation and the not-found page work.
4. Port the API mock functions, types, deterministic spending data, and shared formatters. Keep the response shapes aligned with the existing API documents.
5. Add the branch store and page, then the loan store and simulator.
6. Add the spending store, URL-backed filters, PrimeVue controls, Vue ECharts views, and transaction pagination.
7. Add a small root error display using Vue's error-capture hook, with a test that confirms a home-page rendering error is shown without a blank screen.
8. Verify the main page flows, responsive layout, `npm run build`, and tests. Record how to run the Vue app and choose mock versus backend API in its README.

## Done when

- The four existing pages and not-found route work in the Vue app with behavior matching the current demo.
- Mocked and backend API implementations use the same endpoint and response contracts.
- Shared data is held in the three focused Pinia stores; component-only state stays local.
- Styling follows the current app, uses flexbox layouts, and has no CSS Grid declarations.
- Icons, common controls, and charts use their Vue-compatible open-source libraries.
- The home page error test, production build, and main page tests pass.

## Out of scope

Rebuilding the backend, adding a database or authentication, porting React-specific libraries directly, changing the current API behavior, and introducing a large design system or abstraction layer.
