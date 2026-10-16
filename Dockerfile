FROM node:22-alpine AS build

WORKDIR /app

# skip installing git hooks; there is no .git in the build context
ENV HUSKY=0

COPY package*.json ./
RUN npm ci

COPY . .

# Vite inlines VITE_* variables at build time, so they are build args, not runtime env
ARG VITE_GOOGLE_MAPS_API_KEY
ARG VITE_GOOGLE_MAP_ID=DEMO_MAP_ID
RUN test -n "$VITE_GOOGLE_MAPS_API_KEY" || \
    (echo "Build arg VITE_GOOGLE_MAPS_API_KEY is required" && exit 1)
RUN npm run build

FROM nginxinc/nginx-unprivileged:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
