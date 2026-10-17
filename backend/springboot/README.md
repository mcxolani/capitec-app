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
- Loan products: `http://localhost:<port>/api/loans/products`
- Loan validation rules: `http://localhost:<port>/api/loans/validation-rules`
- Calculate a loan rate: `POST http://localhost:<port>/api/loans/calculate-rate`
- Check loan eligibility: `POST http://localhost:<port>/api/loans/eligibility`
- OpenAPI JSON: `http://localhost:<port>/v3/api-docs`
- Swagger UI: `http://localhost:<port>/swagger-ui/index.html`
