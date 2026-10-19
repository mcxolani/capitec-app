# .NET API

The API is an ASP.NET Core Minimal API targeting .NET 8. From the repository root, start it with:

```sh
dotnet run --project backend/dotnet/Capitec.Api
```

The local development profile listens on `http://localhost:5241`. The health endpoint is `http://localhost:5241/api/health`, Swagger UI is at `http://localhost:5241/swagger`, and the OpenAPI document is at `http://localhost:5241/openapi/v1.json`.

Swagger UI and the OpenAPI document are enabled in the Development environment only.
