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
 && pnpm -C apps/api build \
 && chown -R node:node /app

EXPOSE 3000
ENV PORT=3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 CMD node -e "http=require('http');req=http.get({host:'127.0.0.1',port:process.env.PORT||3000,path:'/api/v1/health'},r=>process.exit(r.statusCode===200?0:1));req.on('error',()=>process.exit(1));"
USER node
CMD ["node","apps/api/dist/src/main.js"]
