FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine AS build

WORKDIR /source
COPY Capitec.Api/Capitec.Api.csproj Capitec.Api/
RUN dotnet restore Capitec.Api/Capitec.Api.csproj

COPY Capitec.Api/ Capitec.Api/
RUN dotnet publish Capitec.Api/Capitec.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine

RUN apk add --no-cache curl icu-libs
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8081
COPY --from=build --chown=app:app /app/publish .
USER app

EXPOSE 8081

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -fsS http://127.0.0.1:8081/api/health >/dev/null || exit 1

ENTRYPOINT ["dotnet", "Capitec.Api.dll"]
