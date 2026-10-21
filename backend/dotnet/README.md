# .NET API

The ASP.NET Core Minimal API targets .NET 8 and returns the same routes and JSON shapes as the Spring Boot API.

## Run locally

From the repository root, start the API with:

```sh
dotnet run --project backend/dotnet/Capitec.Api
```

The development profile listens on `http://localhost:5241`. Swagger UI is at `http://localhost:5241/swagger`, and the OpenAPI document is at `http://localhost:5241/openapi/v1.json`.

To try either existing frontend against this API, start its Vite server with the proxy pointed at port 5241:

```sh
VITE_API_PROXY_TARGET=http://localhost:5241 npm run dev
```

Run that command from the repository root for React, or from `frontend-vue` for Vue.

## Run with Docker

Docker Compose builds and starts the API on port 8084:

```sh
docker compose -f backend/dotnet/compose.yaml up --build
```

Open Swagger UI at `http://localhost:8084/swagger` and the OpenAPI document at `http://localhost:8084/openapi/v1.json`. Stop the API with:

```sh
docker compose -f backend/dotnet/compose.yaml down
```

To use a different host port, set `DOTNET_API_PORT`, for example `DOTNET_API_PORT=18084 docker compose -f backend/dotnet/compose.yaml up --build`.

To use a local React or Vue development server with the containerized API, set its proxy target to `http://localhost:8084` instead of `5241`.

## Routes

| Method | Route                                             | Purpose                              |
| ------ | ------------------------------------------------- | ------------------------------------ |
| `GET`  | `/api/health`                                     | Container and API health             |
| `GET`  | `/api/branches`                                   | Branch locations and contact details |
| `GET`  | `/api/loans/products`                             | Loan products                        |
| `GET`  | `/api/loans/validation-rules`                     | Loan form rules                      |
| `POST` | `/api/loans/eligibility`                          | Loan eligibility estimate            |
| `POST` | `/api/loans/calculate-rate`                       | Repayment schedule and totals        |
| `GET`  | `/api/customers/{customerId}/profile`             | Demo customer profile                |
| `GET`  | `/api/customers/{customerId}/spending/summary`    | Spending totals and comparison       |
| `GET`  | `/api/customers/{customerId}/spending/categories` | Spending by category                 |
| `GET`  | `/api/customers/{customerId}/spending/trends`     | Monthly spending history             |
| `GET`  | `/api/customers/{customerId}/transactions`        | Filtered, sorted transaction pages   |
| `GET`  | `/api/customers/{customerId}/goals`               | Current-month budget progress        |
| `GET`  | `/api/customers/{customerId}/filters`             | Spending filter options              |

Spending data is generated once at startup for demo customer `12345`. Swagger UI and the OpenAPI document are enabled in Development only.
