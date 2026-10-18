# Spring Boot backend plan

This is a simple backend option for the existing Capitec demo frontend. It replaces the in-memory API mocks with a small Spring Boot REST app while keeping the documented API shapes and current page behavior.

This plan and [dotnet-backend-plan.md](dotnet-backend-plan.md) are alternatives. Implement one backend, not both.

## Keep the first version small

- One Spring Boot application with Spring MVC.
- No database, authentication, microservices, or real banking connections.
- Keep demo data in memory. Use a fixed branch list, the existing loan rules, and one deterministic spending transaction set generated at startup.
- Use the current TypeScript utilities as the source for loan calculations and spending filters when porting the logic.
- Keep distance calculation in the frontend. The branch API only needs to return branch locations.

## Stack and project shape

Create a Maven project from [Spring Initializr](https://start.spring.io/) with Spring Web and Validation. Add the matching `springdoc-openapi-starter-webmvc-ui` dependency for the selected Spring Boot version. Springdoc exposes Swagger UI and the OpenAPI document from the app with minimal configuration ([springdoc documentation](https://springdoc.org/)).

Keep the code in three controllers, three services, and a small set of request/response records:

```text
backend/springboot/
  src/main/java/.../
    BranchController.java
    LoanController.java
    SpendingController.java
    BranchService.java
    LoanService.java
    SpendingService.java
    dto/
```

Run the API on port `8081` during development. Swagger UI should be available at `/swagger-ui.html` and the generated JSON at `/v3/api-docs`.

## Endpoints

Keep the same routes for both backend options so the React app can use either one without changing its API contract.

| Method | Route                                             | Purpose                                                                                                  |
| ------ | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `GET`  | `/api/branches`                                   | Return the branch list with `id`, `name`, `address`, `position`, optional `phone`, and `hours`.          |
| `GET`  | `/api/loans/products`                             | Return the loan products described in the loan API spec. Use its `{ "products": [...] }` response shape. |
| `GET`  | `/api/loans/validation-rules`                     | Return the form rules used by the loan page.                                                             |
| `POST` | `/api/loans/eligibility`                          | Validate the request and return an eligibility estimate.                                                 |
| `POST` | `/api/loans/calculate-rate`                       | Return the interest rate, repayment totals, and full payment schedule.                                   |
| `GET`  | `/api/customers/{customerId}/profile`             | Return the demo customer profile.                                                                        |
| `GET`  | `/api/customers/{customerId}/spending/summary`    | Return spending totals and comparison with the previous range.                                           |
| `GET`  | `/api/customers/{customerId}/spending/categories` | Return category totals for the selected range.                                                           |
| `GET`  | `/api/customers/{customerId}/spending/trends`     | Return monthly totals.                                                                                   |
| `GET`  | `/api/customers/{customerId}/transactions`        | Return sorted, filtered, paginated transactions.                                                         |
| `GET`  | `/api/customers/{customerId}/goals`               | Return monthly budget progress.                                                                          |
| `GET`  | `/api/customers/{customerId}/filters`             | Return category metadata and date presets.                                                               |

The spending routes follow [CustomerSpendingInsightsEndpoints.md](CustomerSpendingInsightsEndpoints.md), and the loan routes follow [LoanEligibilitySimulatorEndpoints.md](LoanEligibilitySimulatorEndpoints.md). Add the branch route because the current app has a local branch mock but no branch endpoint spec. The current `fetchLoanProducts()` mock returns a bare array, while its API spec wraps that array in `products`; keep the documented wrapper and have the future fetch helper unwrap it.

## Simple data and behavior

- **Branches:** Move the list from `src/api/branchApi.ts` into `BranchService`. Keep the existing shape. The browser continues to use Google Places for address search and calculates distance from each returned latitude/longitude.
- **Loans:** Move the product list, validation rules, rate bands, eligibility calculation, and repayment schedule from `src/api/loanApi.ts`, `src/utils/loanEligibility.ts`, and `src/utils/loanCalculations.ts` into `LoanService`. Return the existing response shapes. Validate again on the server and return `400` for invalid requests.
- **Spending:** Support the single demo customer `12345`. Generate the 25-month transaction history once when the app starts, using a fixed seed so every endpoint agrees and tests are repeatable. Calculate profile lifetime totals, summaries, categories, trends, goals, and transaction pages from the same transactions.
- **Filters:** Accept `period=7d|30d|90d|1y` (default `30d`); accept a complete `startDate`/`endDate` pair, which takes precedence over the preset; and accept `category` where the dashboard uses it. Trends default to 12 months and cap at 24. Transactions default to 20 rows, cap `limit` at 100, accept `offset`, and support `date_desc`, `date_asc`, `amount_desc`, and `amount_asc`. Without a period or date range, return the full generated transaction history.
- **Dates and amounts:** Treat custom date endpoints as inclusive South African dates, consistent with the frontend. Return money in ZAR as JSON numbers and keep the field names and null values in the TypeScript types.
- **Errors:** Return a small, consistent `400` response for invalid query/body values and `404` for unknown customer IDs. Document these responses in Swagger.

The existing spending UI also filters summary, trends, and goals by category and lets custom dates filter summary and categories. Preserve those behaviors even where the original endpoint document lists fewer query parameters; they are noted in the project README.

## Build steps

1. Generate the Maven app, add the web, validation, and springdoc dependencies, and confirm Swagger UI opens.
2. Add `BranchController` and move the existing branch list into `BranchService`.
3. Add the loan endpoints and port the current validation and calculation rules.
4. Add the spending endpoints around one generated in-memory transaction list.
5. Add a few service tests for loan results, date filtering, pagination, and consistent spending totals. Add one HTTP test per endpoint group.
6. Replace the mock implementations in `src/api/branchApi.ts`, `src/api/loanApi.ts`, and `src/api/spendingApi.ts` with `fetch('/api/...')` calls while keeping their current function signatures.
7. Proxy `/api` from Vite to `localhost:8081` for local development. For the existing Nginx/Compose deployment, add one `/api/` reverse-proxy route and one backend service when deployment is needed.

## Done when

- The branch locator, loan simulator, and spending page work against the backend.
- The frontend TypeScript request/response shapes still match the documented JSON.
- Swagger UI can call every endpoint, including example loan request bodies and spending query parameters.
- The API starts and runs without a database or external financial service.

## Out of scope

Real customer accounts, credit bureau checks, saved transactions, database migrations, authentication, and deployment hardening.
