# Run the applications

Requirements: Docker Engine and the Docker Compose plugin.

## React with Spring Boot

```sh
cp .env.example .env.local
# Add your Google Maps API key to VITE_GOOGLE_MAPS_API_KEY in .env.local
docker compose --env-file .env.local up --build
```

Open <http://localhost:8080>. Stop with:

```sh
docker compose --env-file .env.local down
```

## Vue with .NET

```sh
docker compose -f frontend-vue/compose.yaml up --build
```

Open <http://localhost:8082>. Stop with:

```sh
docker compose -f frontend-vue/compose.yaml down
```
