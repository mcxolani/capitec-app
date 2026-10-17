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
- Loan products: `http://localhost:<port>/api/loans/products`
- Loan validation rules: `http://localhost:<port>/api/loans/validation-rules`
- OpenAPI JSON: `http://localhost:<port>/v3/api-docs`
- Swagger UI: `http://localhost:<port>/swagger-ui/index.html`
