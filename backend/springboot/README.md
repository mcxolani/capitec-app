# Spring Boot API

From the repository root, run the API on its default port, `8081`:

```sh
mvn -f backend/springboot/pom.xml spring-boot:run
```

If port `8081` is already in use, start it on `18081` instead:

```sh
mvn -f backend/springboot/pom.xml spring-boot:run -Dspring-boot.run.arguments=--server.port=18081
```

Use the port you started the app on for these URLs:

- Branches: `http://localhost:<port>/api/branches`
- Customer profile: `http://localhost:<port>/api/customers/12345/profile`
- Spending summary: `http://localhost:<port>/api/customers/12345/spending/summary?period=30d`
- Spending categories: `http://localhost:<port>/api/customers/12345/spending/categories?period=30d`
- Spending trends: `http://localhost:<port>/api/customers/12345/spending/trends?months=12`
- Transactions: `http://localhost:<port>/api/customers/12345/transactions?limit=20&offset=0`
- Loan products: `http://localhost:<port>/api/loans/products`
- Loan validation rules: `http://localhost:<port>/api/loans/validation-rules`
- Calculate a loan rate: `POST http://localhost:<port>/api/loans/calculate-rate`
- Check loan eligibility: `POST http://localhost:<port>/api/loans/eligibility`
- OpenAPI JSON: `http://localhost:<port>/v3/api-docs`
- Swagger UI: `http://localhost:<port>/swagger-ui/index.html`
