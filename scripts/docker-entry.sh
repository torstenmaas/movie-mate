#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ]; then
  echo "🔄 Running prisma migrate deploy..."
  pnpm -s prisma:migrate:deploy
else
  echo "⚠️  DATABASE_URL not set. Skipping migrations (starting API without DB)."
fi

echo "🚀 Starting API..."
exec node /app/apps/api/dist/src/main.js
