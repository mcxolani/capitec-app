# Capitec App

A React + TypeScript single-page app built with Vite. It currently includes a branch locator; the loan eligibility and spending insights pages are placeholders.

## Features

### Branch locator (`/branch-locator`)

- Search for an address or place (Google Places autocomplete), or use the browser's current location.
- Filter branches within a chosen radius (1, 5, 10, 25 or 50 km), shown as a circle on the map.
- Results are sorted by straight-line distance from the chosen point.
- Branch data is mocked in [`src/api/branchApi.ts`](src/api/branchApi.ts) (Gauteng branches with a simulated network delay). Replace `fetchBranches()` to connect a real API.

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

| Command                | Description                               |
| ---------------------- | ----------------------------------------- |
| `npm run dev`          | Start the dev server with hot reload.     |
| `npm run build`        | Type-check and build to `dist/`.          |
| `npm run preview`      | Serve the production build locally.       |
| `npm run lint`         | Run ESLint.                               |
| `npm run lint:fix`     | Run ESLint and fix what it can.           |
| `npm run format`       | Format all files with Prettier.           |
| `npm run format:check` | Check formatting without writing changes. |

## Project structure

```
src/
  api/          data fetching (mock branch API)
  components/
    layout/     header with responsive menu, footer, page layout
    branch-locator/
  hooks/        useGeolocation, useNearbyBranches, useDebounce
  pages/        one component per route
  types/        shared TypeScript types
  utils/        distance calculation, map helpers
```

Imports use the `@/` alias for `src/` (for example `@/hooks/useGeolocation`).

## Git hooks

Husky installs the hooks on `npm install`. The pre-commit hook runs [lint-staged](https://github.com/lint-staged/lint-staged) on staged files only:

- `.ts`, `.tsx`, `.js`, `.jsx`: `eslint --fix`, then `prettier --write`
- `.css`, `.json`, `.md`, `.html`, `.yml`: `prettier --write`

Fixes are added back to the same commit. The commit is blocked if ESLint finds an error it can't fix.

## Production Docker image

```sh
docker build -t capitec-app .
docker run --rm -p 8080:8080 capitec-app
```

Open `http://localhost:8080`. The image builds the app in a Node.js stage and serves the static files with unprivileged Nginx. Nginx falls back to `index.html`, so direct visits to client-side routes work.

The environment variables are read at build time, so `.env.local` must exist before running `docker build`.
