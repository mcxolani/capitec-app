# .NET backend plan

This is a simple C# backend option for the existing Capitec demo frontend. It replaces the in-memory API mocks with one ASP.NET Core API and keeps the same routes and JSON as the Spring Boot option.

This plan and [springboot-backend-plan.md](springboot-backend-plan.md) are alternatives. Choose one backend to implement.

## Keep the first version small

- One ASP.NET Core Minimal API project.
- No database, authentication, microservices, or real banking connections.
- Keep demo data in memory. Use the existing branch list, current loan rules, and a deterministic spending history generated once at startup.
- Port the current TypeScript loan and spending calculations instead of adding a larger business-rules framework.
- Leave branch address search and distance calculations in the browser.

## Stack and project shape

Create a Minimal API with the installed, supported .NET SDK. Use C# records for the request/response models and register three small services for branches, loans, and spending.

Use ASP.NET Core's built-in OpenAPI generation and add Swagger UI for interactive local testing. The OpenAPI document is available at `/openapi/v1.json`; enable the UI at `/swagger` in Development only. Microsoft's setup uses `Microsoft.AspNetCore.OpenApi` with the `Swashbuckle.AspNetCore.SwaggerUI` assets ([Microsoft Learn: OpenAPI documents and Swagger UI](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/openapi/using-openapi-documents)).

```text
backend/dotnet/Capitec.Api/
  Program.cs                 # route groups, OpenAPI and service registration
  Models/                    # small request/response records
  Services/
    BranchService.cs
    LoanService.cs
    SpendingService.cs
```

Group routes under `/api` in `Program.cs`, then delegate each handler to its service. Keep Swagger UI enabled only in Development.

## Endpoints

Keep the route contract identical to the Spring Boot plan and the current frontend.

| Method | Route                                             | Purpose                                                               |
| ------ | ------------------------------------------------- | --------------------------------------------------------------------- |
| `GET`  | `/api/branches`                                   | Return branches with coordinates, address, hours, and optional phone. |
| `GET`  | `/api/loans/products`                             | Return products in the documented `{ "products": [...] }` shape.      |
| `GET`  | `/api/loans/validation-rules`                     | Return the simulator's form rules.                                    |
| `POST` | `/api/loans/eligibility`                          | Validate the request and calculate an eligibility estimate.           |
| `POST` | `/api/loans/calculate-rate`                       | Calculate the rate, repayment totals, and payment schedule.           |
| `GET`  | `/api/customers/{customerId}/profile`             | Return the demo customer profile.                                     |
| `GET`  | `/api/customers/{customerId}/spending/summary`    | Return spending totals and previous-range changes.                    |
| `GET`  | `/api/customers/{customerId}/spending/categories` | Return category totals.                                               |
| `GET`  | `/api/customers/{customerId}/spending/trends`     | Return monthly totals.                                                |
| `GET`  | `/api/customers/{customerId}/transactions`        | Return filtered, sorted, paginated transactions.                      |
| `GET`  | `/api/customers/{customerId}/goals`               | Return budget progress.                                               |
| `GET`  | `/api/customers/{customerId}/filters`             | Return categories and period presets.                                 |

The contracts are in [LoanEligibilitySimulatorEndpoints.md](LoanEligibilitySimulatorEndpoints.md) and [CustomerSpendingInsightsEndpoints.md](CustomerSpendingInsightsEndpoints.md). The branch list needs a new `GET /api/branches` contract because it is currently hard-coded in the frontend. The current `fetchLoanProducts()` mock returns a bare array, while its API spec wraps that array in `products`; keep the documented wrapper and have the future fetch helper unwrap it.

## Simple data and behavior

- **Branches:** Copy the data from `src/api/branchApi.ts` into `BranchService`. Return the existing `Branch` fields. Keep Google Places lookup and nearby-distance sorting in the frontend.
- **Loans:** Port the thresholds, product list, validation rules, eligibility logic, and repayment schedule from `src/api/loanApi.ts` and `src/utils/loan*.ts`. Use the same enums and response property names. Return `400` for invalid loan requests.
- **Spending:** Support demo customer `12345`. Generate a deterministic 25-month transaction list once when the app starts; calculate every spending response from that same list so totals stay consistent. No repository or database is needed.
- **Filters:** Accept `period=7d|30d|90d|1y` (default `30d`), a complete `startDate`/`endDate` pair that overrides the period, and `category` for dashboard filtering. Trends default to 12 months and cap at 24. Transactions default to `limit=20`, cap at 100, accept `offset`, and allow `date_desc`, `date_asc`, `amount_desc`, or `amount_asc`. Without a period or date range, return the full generated transaction history.
- **Dates and amounts:** Treat custom date values as inclusive `Africa/Johannesburg` dates. Return the existing JSON field names, ZAR amounts, and nullable comparison values.
- **Errors:** Use the built-in `Results.Problem`/`ProblemDetails` response for invalid input (`400`) and an unknown customer (`404`). Add those responses to the generated OpenAPI document.

The UI passes category filters to summary, trends, and goals, and lets custom dates filter summary and categories. Keep those extensions from the current app even though its original spending endpoint document is shorter.

## Build steps

1. Create the Minimal API project. Add OpenAPI generation and Swagger UI, then verify `/swagger` and `/openapi/v1.json` work locally.
2. Add the branch route and load the current branch list from `BranchService`.
3. Add the four loan routes and port the existing validation and calculator behavior.
4. Add the seven spending routes using one in-memory generated transaction set.
5. Add service tests for loan outcomes, date ranges, pagination, and reconciled spending totals. Add a small HTTP test for each route group.
6. Replace mock functions in `src/api/branchApi.ts`, `src/api/loanApi.ts`, and `src/api/spendingApi.ts` with `fetch('/api/...')` while preserving their current signatures.
7. Add a Vite `/api` development proxy to the backend port. When deploying with the existing Nginx/Compose setup, route `/api/` to one backend service to keep the browser on the same origin.

## Done when

- The existing pages work with the .NET API and need no framework-specific frontend changes.
- Swagger UI lists the routes, request bodies, query parameters, and simple error responses.
- The generated OpenAPI JSON matches the API responses used by the frontend.
- The app runs with in-memory demo data and no external finance services.

## Out of scope

Real account data, credit checks, database storage, authentication, microservices, and production financial decisions.
