#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ]; then
  echo "🔄 Running prisma migrate deploy..."
  pnpm -s prisma:migrate:deploy
else
  echo "⚠️  DATABASE_URL not set. Skipping migrations (starting API without DB)."
fi

echo "🚀 Starting API..."
# Preload Sentry's own patcher and our instrumentation before any module can load Express
# Use the app-local node_modules path to resolve @sentry/node in a workspace layout
exec node \
  -r ./apps/api/node_modules/@sentry/node/preload \
  -r ./apps/api/dist/src/instrument.js \
  apps/api/dist/src/main.js
