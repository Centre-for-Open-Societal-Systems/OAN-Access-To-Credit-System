# Stage 1: Build
FROM node:24 AS builder
WORKDIR /app
ENV CI=true
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack install
RUN pnpm install --frozen-lockfile
COPY . .
# Optional build-time default only. The app reads API_BASE_URL at runtime, so a value set on
# the container (compose .env / Helm env) always wins and the build does not need it.
ARG API_BASE_URL=""
ENV API_BASE_URL=$API_BASE_URL
RUN pnpm build

# Stage 2: Run
FROM node:24-slim AS runner
WORKDIR /app
RUN corepack enable
COPY --from=builder /app ./
RUN corepack install
EXPOSE 3000
CMD ["pnpm", "start"]
