# Capitec App

A React + TypeScript single-page app built with Vite. It includes a branch locator, a loan eligibility simulator and a spending insights dashboard.

## Features

### Home (`/`)

The home page takes its visual direction from [Capitec’s website](https://www.capitecbank.co.za/): an open hero and three simple cards linking to the app’s tools. The app uses Manrope throughout, including form controls. Font files are bundled locally through `@fontsource-variable/manrope`.

Radix Themes provides buttons, text/date inputs, cards, callouts, loading indicators and badges across the pages. Radix also handles the mobile navigation popover and branch disclosures. Existing page class names style the components, with shared colors and typography in `src/index.css`. Recharts and Lucide remain the chart and icon libraries.

The home photograph is bundled at `public/images/banking-tools.webp`, sourced from [Capitec’s fee-calculator image](https://www.capitecbank.co.za/globalassets/fee_calculator_desktop.jpg).

### Branch locator (`/branch-locator`)

- Search for an address or place (Google Places autocomplete), or use the browser's current location.
- Filter branches within a chosen radius (1, 5, 10, 25 or 50 km), shown as a circle on the map.
- Results are sorted by straight-line distance from the chosen point.
- Branch data loads from the Spring Boot API at `/api/branches`; the Vite dev server proxies `/api` to `http://localhost:8081` by default. Start the backend with the instructions in [`backend/springboot/README.md`](backend/springboot/README.md) before using the branch locator. If the backend runs on another port, set `VITE_API_PROXY_TARGET` when starting Vite, for example `VITE_API_PROXY_TARGET=http://localhost:18081 npm run dev`.

### Loan eligibility simulator (`/loan-eligibility`)

Customers enter their income, expenses and the loan they want, and get an estimate of whether they'd qualify, what they could borrow and what it would cost.

- Loan products, validation rules, eligibility checks and rate calculations load from the Spring Boot API.
- The form validates against the rules the API returns and shows every error at once. Errors and focus are wired up for screen readers.
- Results come in three forms: eligible, over budget (with the largest affordable amount suggested instead), and declined, each with a plain-language reason.
- Every result says it's an estimate from simulated data, not a credit decision or loan offer. The approval likelihood is capped at 95%.

The lending rules live in [`src/utils/loanEligibility.ts`](src/utils/loanEligibility.ts), with every threshold as a named constant. They're illustrative, not a real credit policy:

| Rule                          | Value                                                                                                                                    |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Disposable income             | Income − expenses (expenses include debt repayments, as in the spec's example)                                                           |
| Affordable repayment          | Up to 80% of disposable income                                                                                                           |
| Interest rate by credit score | 750+: 10.5% · 650+: 12.5% · 550+: 15.5% · lower: 18.5% · none given: 15.5%                                                               |
| Declined                      | Under 18 or over 65, unemployed, under 3 months employed, income under R5,000, no disposable income, or existing debt over 40% of income |
| Risk                          | Low: debt ≤ 20% of income and credit score ≥ 650 · High: debt > 35% or score < 550 · otherwise medium                                    |

Where the spec's example numbers are inconsistent, the code follows the standard formulas instead:

- **Monthly payment:** R150,000 at 12.5% over 24 months is R7,096.10 with the standard amortisation formula, not the spec's R7,089.50. The spec's own month 1 interest doesn't match its rate either.
- **Loan-to-income ratio:** loan ÷ annual income, so 50% for the example. The spec's 60% doesn't follow from any standard definition.

### Spending insights (`/spending-insights`)

Explore a fictional customer's spending with summary cards, a category donut, monthly trends, budgets and a sortable transaction list. The dashboard uses the same layout, controls, white panels and responsive styling as the other pages.

- All seven spending endpoints load from the Spring Boot API. The dashboard sends the applicable period, custom dates, category, sort order, page offset or month count; the profile, filter options, budgets and analytics use the same backend dataset. `createSpendingApi` remains available to provide deterministic mock data in tests.
- Period, category, custom dates and transaction sort are stored in the URL. Custom dates override the preset; selecting a preset clears the dates. Dates are inclusive in `Africa/Johannesburg`. Invalid URL dates fall back to the selected preset with a visible explanation.
- Date filters affect the overview, category breakdown and transactions. Trends show 12 months by default, selectable from 6, 12 or 24; budgets always track the current month. Category selection applies to all spending sections. Clicking a category in the breakdown applies that filter.
- Budgets are on track below 80%, near budget from 80% through 100%, and over budget above 100%. Status labels accompany the colours. A comparison with no previous spending shows an unavailable change instead of an infinite percentage.
- Transactions load in pages of 20, with four sort orders and mobile cards. Each section has loading, empty and retry states; failed pagination keeps existing transactions visible.
- Charts use Recharts for the responsive donut and monthly bars, axes, labels and tooltips. The category list and monthly data table provide the same figures as text. Clicking a donut segment filters the dashboard.
- Radix UI provides the period/category toggle groups, budget progress bars and expandable monthly figures, using the app's existing CSS classes. Icons use `lucide-react`. Money includes cents; the existing loan formatter continues to show whole rands.

The mock API uses the browser's current date when the module loads. Tests inject a date and disable the delay with `createSpendingApi(date, 0)`. The mock extends summary/category queries with a category and custom dates, and trends/goals with a category, for coordinated filtering. Comparison percentages and the top category can be `null` when there is no baseline or no spending; the Spring Boot summary uses the same fields.

Input validation lives in the filter controls and URL parser. The local mock API trusts those inputs, with only the specified page-size and history limits applied. Shared types describe the data used by components; API return types are inferred.

## Getting started

### Run the frontend and API together

```sh
cp .env.example .env.local # set VITE_GOOGLE_MAPS_API_KEY in this file
docker compose --env-file .env.local up --build
```

Open the app at `http://localhost:8080`. Spring Boot runs at `http://localhost:8081`, with Swagger UI at `http://localhost:8081/swagger-ui/index.html`. Stop both containers with `docker compose --env-file .env.local down`.

Docker Compose requires Docker Engine and the Compose plugin. The Maps API key is required to use the branch map. To avoid host port conflicts, set `PORT` for the web app or `API_PORT` for Spring Boot, for example `PORT=8082 API_PORT=18082 docker compose --env-file .env.local up --build`.

### Run locally for development

Requirements: Node.js 22+, npm, Java 21 and Maven.

Start the backend in one terminal:

```sh
mvn -f backend/springboot/pom.xml spring-boot:run
```

Then start the frontend in another:

```sh
npm install
cp .env.example .env.local # set VITE_GOOGLE_MAPS_API_KEY in this file
npm run dev
```

Vite runs at `http://localhost:5173` and proxies `/api` to Spring Boot on port `8081`.
If you start Spring Boot on another port, point Vite at it, for example `VITE_API_PROXY_TARGET=http://localhost:18081 npm run dev`.

### Environment variables

| Variable                   | Required | Description                                                                            |
| -------------------------- | -------- | -------------------------------------------------------------------------------------- |
| `VITE_GOOGLE_MAPS_API_KEY` | Yes      | Google Maps API key with the **Maps JavaScript API** and **Places API (New)** enabled. |
| `VITE_GOOGLE_MAP_ID`       | Yes      | Map ID for advanced markers. `DEMO_MAP_ID` works for local development.                |

Vite inlines `VITE_*` variables into the client bundle at build time, so the API key is visible to anyone using the app. Restrict it by HTTP referrer in the Google Cloud console.

## Scripts

| Command                 | Description                                   |
| ----------------------- | --------------------------------------------- |
| `npm run dev`           | Start the dev server with hot reload.         |
| `npm run build`         | Type-check and build to `dist/`.              |
| `npm run preview`       | Serve the production build locally.           |
| `npm run typecheck`     | Run the TypeScript compiler without building. |
| `npm test`              | Run the tests once.                           |
| `npm run test:watch`    | Run the tests in watch mode.                  |
| `npm run test:coverage` | Run the tests with a coverage report.         |
| `npm run lint`          | Run ESLint.                                   |
| `npm run lint:fix`      | Run ESLint and fix what it can.               |
| `npm run format`        | Format all files with Prettier.               |
| `npm run format:check`  | Check formatting without writing changes.     |

## Testing

Tests use [Vitest](https://vitest.dev) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro) in a jsdom environment. Test files sit next to the code they cover (`*.test.ts` / `*.test.tsx`); shared helpers live in `src/test/`.

- **Google Maps:** the map components (`BranchMap`, `RadiusCircle`) need a real browser and API key, so they aren't unit tested. Page and search tests replace `@vis.gl/react-google-maps` with a stub, so the tests never call Google.
- **Geolocation:** `mockGeolocation()` in `src/test/geolocation.ts` stubs `navigator.geolocation` to succeed with a given position or fail with a permission or availability error.

## Project structure

```
src/
  api/          branch, loan and spending API clients and mock spending fixtures
  components/
    layout/     header with responsive menu, footer, page layout
    branch-locator/
    loan-eligibility/
    spending-insights/
  hooks/        location, debouncing, spending filters and resource loading
  pages/        one component per route, lazy-loaded except Home
  test/         test setup, fixtures and stubs
  types/        shared TypeScript types
  utils/        distance, maps, loans, spending aggregation and formatting
```

Imports use the `@/` alias for `src/` (for example `@/hooks/useGeolocation`).

Each page renders inside an error boundary, so a crash on one page shows a "Something went wrong" message instead of a blank screen, and navigating to another page recovers. Unknown URLs show a "Page not found" page.

## Git hooks and CI

Husky installs the hooks on `npm install`. The pre-commit hook runs [lint-staged](https://github.com/lint-staged/lint-staged) on staged files only:

- `.ts`, `.tsx`, `.js`, `.jsx`: `eslint --fix`, `prettier --write`, then the tests related to those files
- `.css`, `.json`, `.md`, `.html`, `.yml`: `prettier --write`

Fixes are added back to the same commit. The commit is blocked if ESLint finds an error it can't fix or a related test fails.

GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs on pull requests and pushes to `main`: format check, lint, type check, tests with coverage, production build, both Docker image builds and a Compose configuration check.

## Docker deployment

The Compose setup builds the React app and Spring Boot API as separate containers. Nginx serves the frontend and proxies `/api` requests to the API container, so the browser uses the same URLs in Docker and local development. The API port is also published directly for Swagger UI.

The frontend build needs the Maps API key because Vite bundles `VITE_*` values into the JavaScript. `.env*` files are excluded from the Docker build context; Compose passes the key as a build argument.

To rebuild and start both services:

```sh
docker compose --env-file .env.local up --build
```

Set `PORT` or `API_PORT` to publish either service on another host port. The API image is built from [`backend/springboot/Dockerfile`](backend/springboot/Dockerfile), runs as an unprivileged user, and exposes port `8081` inside Compose.

The web image builds the app in a Node.js stage and serves it with unprivileged Nginx on port 8080. Nginx:

- falls back to `index.html`, so direct visits to client-side routes work
- caches the fingerprinted files in `/assets/` for a year, and makes browsers revalidate `index.html` so new deploys show up straight away
- gzips text responses and sends security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`)
- answers `GET /healthz` for the container health check

## AI usage disclosure

I wrote the core application myself: the branch locator (place search, map, branch list, geolocation and nearby-branch hooks, distance utilities, Gauteng mock data), routing, page layout, and the lint and Prettier setup.

I used Claude Code (an AI coding assistant) for:

- **Tests:** the full Vitest and React Testing Library suite and test helpers
- **Production hardening:** TypeScript strict mode, error boundary, 404 page, lazy-loaded routes, Nginx caching and security headers, Docker build args and health check, Docker Compose, GitHub Actions CI
- **Smaller additions:** responsive header menu, full-width mobile location button, lint-staged pre-commit hook, Cape Town and Durban mock data, README
- **Fixes:** error message rendered outside the JSX, missing Google Maps types, a distance rounding bug ("1000 m" instead of "1.0 km")
- **Loan eligibility simulator:** built with Claude Code one small commit at a time, with each commit reviewed before it went in. I made the decisions where the spec was ambiguous or inconsistent: how existing debt affects disposable income, the 80% affordability buffer, and the loan-to-income definition. Claude Code wrote the code and tests and flagged where the spec's numbers didn't add up.

The earlier Claude Code changes were reviewed before being committed.

Codex implemented the spending insights dashboard, mock API, aggregation utilities, tests and documentation using the plan's recommended defaults, followed by the home page and global font. These changes are available in the working tree for review.
