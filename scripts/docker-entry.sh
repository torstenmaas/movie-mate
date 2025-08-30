#!/bin/sh
set -e

echo "🔄 Running prisma migrate deploy..."
pnpm -s prisma:migrate:deploy

echo "🚀 Starting API..."
exec node apps/api/dist/src/main.js

