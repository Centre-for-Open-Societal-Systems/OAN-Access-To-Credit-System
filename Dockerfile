# Stage 1: Build
FROM node:20 AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
ARG API_BASE_URL
ENV API_BASE_URL=$API_BASE_URL
RUN npm run build

# Stage 2: Run
FROM node:20-slim
WORKDIR /app
COPY --from=builder /app ./
EXPOSE 3000
CMD ["npm", "run", "start"]