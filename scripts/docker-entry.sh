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
# Use absolute paths from /app (WORKDIR) to be robust
exec node \
  -r /app/apps/api/node_modules/@sentry/node/preload \
  -r /app/apps/api/dist/src/instrument.js \
  /app/apps/api/dist/src/main.js
