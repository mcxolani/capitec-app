# Capitec App

A React + TypeScript single-page app built with Vite. It currently includes a branch locator; the loan eligibility and spending insights pages are placeholders.

## Features

### Branch locator (`/branch-locator`)

- Search for an address or place (Google Places autocomplete), or use the browser's current location.
- Filter branches within a chosen radius (1, 5, 10, 25 or 50 km), shown as a circle on the map.
- Results are sorted by straight-line distance from the chosen point.
- Branch data is mocked in [`src/api/branchApi.ts`](src/api/branchApi.ts) (branches in Gauteng, Cape Town and Durban, with a simulated network delay). Replace `fetchBranches()` to connect a real API.

### Coming soon

- Loan eligibility (`/loan-eligibility`)
- Spending insights (`/spending-insights`)

## Getting started

Requirements: Node.js 22+ and npm.

```sh
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev
```

The dev server runs at `http://localhost:5173`.

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
  api/          data fetching (mock branch API)
  components/
    layout/     header with responsive menu, footer, page layout
    branch-locator/
  hooks/        useGeolocation, useNearbyBranches, useDebounce
  pages/        one component per route, lazy-loaded except Home
  test/         test setup, fixtures and stubs
  types/        shared TypeScript types
  utils/        distance calculation, map helpers
```

Imports use the `@/` alias for `src/` (for example `@/hooks/useGeolocation`).

Each page renders inside an error boundary, so a crash on one page shows a "Something went wrong" message instead of a blank screen, and navigating to another page recovers. Unknown URLs show a "Page not found" page.

## Git hooks and CI

Husky installs the hooks on `npm install`. The pre-commit hook runs [lint-staged](https://github.com/lint-staged/lint-staged) on staged files only:

- `.ts`, `.tsx`, `.js`, `.jsx`: `eslint --fix`, `prettier --write`, then the tests related to those files
- `.css`, `.json`, `.md`, `.html`, `.yml`: `prettier --write`

Fixes are added back to the same commit. The commit is blocked if ESLint finds an error it can't fix or a related test fails.

GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs on pull requests and pushes to `main`: format check, lint, type check, tests with coverage, production build, and a Docker image build.

## Production Docker image

The API key is passed as a build argument, because Vite builds it into the JavaScript. `.env*` files are excluded from the Docker build context. The build stops if the key is missing.

With Docker Compose, reading the values from `.env.local`:

```sh
docker compose --env-file .env.local up --build
```

Or with plain Docker:

```sh
docker build \
  --build-arg VITE_GOOGLE_MAPS_API_KEY=your-key \
  --build-arg VITE_GOOGLE_MAP_ID=your-map-id \
  -t capitec-app .
docker run --rm -p 8080:8080 capitec-app
```

Open `http://localhost:8080`. Set `PORT` to publish on a different host port with Compose (for example `PORT=8081 docker compose --env-file .env.local up --build`).

The image builds the app in a Node.js stage and serves it with unprivileged Nginx on port 8080. Nginx:

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

I reviewed every AI-generated change, and all of it passes lint, type checks and tests.
