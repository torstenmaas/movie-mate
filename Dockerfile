# syntax=docker/dockerfile:1
FROM node:20-bullseye-slim AS base
ENV NODE_ENV=production
RUN corepack enable
WORKDIR /app

# Install deps in a clean layer
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps ./apps
COPY packages ./packages

# Install and build
RUN pnpm install --frozen-lockfile=false \
 && pnpm -C apps/api build

EXPOSE 3000
ENV PORT=3000
CMD ["node","apps/api/dist/src/main.js"]

