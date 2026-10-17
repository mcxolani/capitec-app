# Customer Spending Insights Dashboard: Plan

> **Brief:** Build a responsive financial analytics dashboard to display a customer's spending data (mocked data).
>
> **Spec:** [`CustomerSpendingInsightsEndpoints.md`](CustomerSpendingInsightsEndpoints.md): 7 endpoints (profile, summary, categories, trends, transactions, goals, filters).

## Implementation status

Implemented on `customer-spending-insights` using the recommended choices below. The existing loan branch was fast-forwarded into this feature branch to reuse its patterns and styling; `main` was not changed. New spending changes remain uncommitted for review.

The dashboard matches the loan and branch pages: shared layout, buttons and Manrope font, blue controls, white panels, 8px panel corners and the same border colours. Icons use `lucide-react` as requested; charts remain local SVGs.

The implementation was simplified after review: fewer shared types, inferred API responses, validation at the UI boundary, straightforward async loading, and pagination that stores only the extra transaction rows. Styling and dashboard features remain the same.

All 14 implementation steps below are covered. The mock uses 25 calendar months to provide a complete previous-year comparison. Dates affect summary, categories and transactions; trends retain their monthly window and budgets remain month-to-date. Category filters affect every spending section. Zero-baseline percentage changes and an empty top category are represented as `null`. See the README for these documented API extensions.

Verification: 208 tests passed across 28 files with `npm run test:coverage -- --maxWorkers=2` (the unrestricted run hit worker startup timeouts on this host). Production build, TypeScript and formatting checks passed. Lint has no errors; the generated coverage directory produces three existing unused-directive warnings. Chrome checks covered desktop and mobile layouts, 320px overflow, pagination, category selection and URL persistence after reload. The 24-month chart spaces its labels to remain readable on mobile.

## Before starting

- [x] **Bring in the loan prerequisite.** Fast-forwarded `loan-eligiility` into the existing spending feature branch. Kept the loan whole-rand formatter and added a separate cents formatter for spending.
- [x] **Fix the loan README link.** It now points to `docs/LoanEligibilitySimulatorEndpoints.md`.
- [x] **Move the spec** from the repo root to `docs/CustomerSpendingInsightsEndpoints.md`.
- [x] **Branch:** continued on the user's existing `customer-spending-insights` branch.

## What the dashboard shows

| Section            | Endpoint                   | Content                                                                                  |
| ------------------ | -------------------------- | ---------------------------------------------------------------------------------------- |
| Header             | `GET /profile`             | Customer name, account type, member since                                                |
| Filters            | `GET /filters`             | Period presets (7d / 30d / 90d / 1y), custom date range, category                        |
| Summary cards      | `GET /spending/summary`    | Total spent, transactions, average transaction, top category, change vs previous period  |
| Category breakdown | `GET /spending/categories` | Donut chart and a ranked list with amounts and percentages                               |
| Monthly trends     | `GET /spending/trends`     | Bar chart of monthly totals, 12 months by default                                        |
| Budgets            | `GET /goals`               | Progress bar per budget, with an on-track / warning / over-budget status                 |
| Transactions       | `GET /transactions`        | Table (cards on mobile), filtered by category and date, sortable, "Load more" pagination |

**Layout:** a single column on phones; on wide screens, summary cards in a row and charts side by side. Filters are kept in the URL (`?period=90d&category=Dining`), so refresh, back button and shared links keep the view.

## Problems in the spec

The arithmetic within each response checks out (category amounts add up to the total, the percentages and averages are right). The endpoints contradict each other, though:

| #   | Problem                                             | Evidence                                                                                                         |
| --- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 1   | Category transaction counts don't match the summary | Categories add up to **53** transactions; the summary says **47** for the same 30 days                           |
| 2   | Lifetime total is less than six months of spending  | Profile `totalSpent` is **R15,420.50**; the trends show **R24,223.15** over Jan–Jun 2024 alone                   |
| 3   | Dates don't line up                                 | Trends end in **June 2024**; categories cover **Aug 16 – Sep 16 2024**; transactions are from **September 2024** |
| 4   | Month-to-date budget exceeds the 30-day total       | The Groceries goal has spent **R1,450.80** this month; categories show **R1,250.30** for the last 30 days        |
| 5   | Transaction volume is off                           | Pagination says **1,250** transactions in total; at ~45 a month, that's about 2 years of data                    |
| 6   | Categories aren't sorted                            | Shopping (10.6%) comes before Utilities (10.8%)                                                                  |

**Proposed fix:** don't hard-code the spec's JSON. Generate one consistent set of mock transactions (deterministic, so tests are stable) and calculate every endpoint from it. That makes problems 1–5 impossible, and the filters genuinely work, because they filter real data instead of returning fixed responses. The response shapes, field names, categories, colours and icons still follow the spec exactly.

## Decisions implemented

Used generated transactions, the current date, local SVG charts, Lucide icons, fixed percentage budget thresholds, and custom dates overriding presets. The alternatives are retained as planning context.

1. **Mock data source:**
   - _(recommended)_ generate transactions and calculate every endpoint from them;
   - or hard-code the spec's example responses, which is faster, but the filters then do nothing and the contradictions above show on screen.
2. **"Today" for the mock data:**
   - _(recommended)_ relative to the real current date, so the demo always looks current; tests pass in a fixed date;
   - or fixed at the spec's date of 2024-09-16.
3. **Charts:**
   - _(recommended)_ hand-built SVG: no dependency, small bundle, and full control over accessibility. A donut and a bar chart are about 100 lines each;
   - or Recharts: quicker to build, but adds roughly 100 kB gzipped to this page.
4. **Icons:** the spec's names (`shopping-cart`, `film`, `car`, `utensils`, `shopping-bag`, `zap`) are Lucide icon names.
   - use `lucide-react` with direct imports for the six category icons and spending-change arrows, as requested;
   - replaced the original hand-written SVG paths.
5. **Budget status thresholds:** the spec only shows `on_track` (65%) and `warning` (97%).
   - _(proposed)_ on track below 80%, warning from 80% to 100%, over budget above 100%;
   - **or:** pace-based, comparing spending against how far through the month we are.
6. **Custom date range vs period:** the spec allows both and doesn't say which wins.
   - _(proposed)_ a custom range overrides the period, and choosing a preset clears the custom range.

## Accessibility and responsible display

- **Charts aren't the only source:** every chart has the same data in a table or list, readable by screen readers, so nothing is shown only as a chart.
- **Colour isn't the only signal:** categories also have a name and icon; budget status also has a text label.
- **Contrast:** the spec's Dining yellow (`#F7DC6F`) is too faint against white for text, so the colours are used for chart areas and swatches only, never for text.
- **Money:** amounts show cents (R1,250.30), unlike the loan page's whole rands. Dates display in South African time (`Africa/Johannesburg`), although the API sends UTC.
- **Mock customer data:** the customer is obviously fictional ("John Doe", per the spec). No real-looking personal data.
- **Every section has its own loading, empty and error state with a retry,** so one failing endpoint doesn't blank the dashboard.

## Commit plan

These are the original suggested review units. Implementation is complete in the working tree; no new commits have been created.

| #   | Commit                                      | Contents                                                                                                        |
| --- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 1   | `add spending insights types from API spec` | Types for all 7 endpoints; move the spec into `docs/`                                                           |
| 2   | `add mock transaction generator`            | Deterministic transactions across the 6 categories, ~45 a month for 2 years, realistic South African merchants  |
| 3   | `add spending aggregation utils`            | Summary, category breakdown, monthly trends, period comparison, budget status, all calculated from transactions |
| 4   | `add mocked spending API`                   | The 7 endpoints with the spec's query parameters, defaults and limits (`limit` ≤ 100, `months` ≤ 24)            |
| 5   | `add money, percentage and date formatters` | Rands with cents, signed % change ("+12.5%"), dates in SA time                                                  |
| 6   | `add dashboard data hooks`                  | Loading / error / retry per endpoint (the `useNearbyBranches` pattern); filters kept in the URL                 |
| 7   | `add dashboard layout and filters`          | Page shell, profile header, period / date-range / category controls                                             |
| 8   | `add spending summary cards`                | The 5 KPI cards, with up/down change indicators                                                                 |
| 9   | `add category breakdown chart`              | Donut chart and ranked list; clicking a category filters the transactions                                       |
| 10  | `add monthly trends chart`                  | Bar chart with a data table for screen readers                                                                  |
| 11  | `add budget goals`                          | Progress bars and status labels                                                                                 |
| 12  | `add transactions list`                     | Table on desktop, cards on mobile; sort; "Load more"                                                            |
| 13  | `add spending insights page tests`          | End-to-end page tests: filters update every section, and the error states                                       |
| 14  | `document spending insights dashboard`      | README section, decisions, and an AI disclosure update                                                          |

Commits 8–12 can be done in a different order, because each section only depends on commits 1–7.
