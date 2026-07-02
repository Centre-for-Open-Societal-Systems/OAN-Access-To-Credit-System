# Stage 1: Build
FROM node:20 AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.18.3 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --no-frozen-lockfile --ignore-scripts=false
COPY . .
ARG API_BASE_URL
ENV API_BASE_URL=$API_BASE_URL
RUN pnpm build

# Stage 2: Run
FROM node:20-slim AS runner
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.18.3 --activate
COPY --from=builder /app ./
EXPOSE 3000
CMD ["pnpm", "start"]
