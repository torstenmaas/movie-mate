#!/usr/bin/env bash
set -euo pipefail

# Local CI-like smoke test for the Docker image.
# - Builds the image
# - Runs liveness check without DB
# - Runs readiness check with Postgres via docker network

TAG="${1:-movie-mate:local}"
PORT="${PORT:-3000}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:${PORT}/api/v1/health}"
READY_URL="${READY_URL:-http://127.0.0.1:${PORT}/api/v1/health/ready}"
RETRIES_LIVE="${RETRIES_LIVE:-30}"
RETRIES_READY="${RETRIES_READY:-60}"
SLEEP_SECS="${SLEEP_SECS:-1}"

echo "[smoke] Building image: ${TAG}"
docker build -t "${TAG}" -f Dockerfile .

cleanup() {
  docker stop mm-test >/dev/null 2>&1 || true
  docker stop mm-db >/dev/null 2>&1 || true
  docker network rm mm-net >/dev/null 2>&1 || true
}
trap cleanup EXIT

# Pre-clean from any previous failed runs
cleanup || true

wait_url() {
  local url="$1"; shift
  local attempts="$1"; shift
  local sleep_s="$1"; shift
  for i in $(seq 1 "${attempts}"); do
    if curl -fsS "$url" >/dev/null; then
      echo "[smoke] OK: ${url} (attempt ${i}/${attempts})"
      return 0
    fi
    sleep "${sleep_s}"
  done
  return 1
}

echo "[smoke] Phase 1: Liveness without DB"
docker run -d -p ${PORT}:3000 --name mm-test \
  -e JWT_SECRET=test-secret-ci-access-1234567890 \
  -e JWT_REFRESH_SECRET=test-secret-ci-refresh-1234567890 \
  "${TAG}"

if ! wait_url "${HEALTH_URL}" "${RETRIES_LIVE}" "${SLEEP_SECS}"; then
  echo "[smoke] Service did not become healthy (liveness). Container logs:" >&2
  docker logs mm-test || true
  exit 1
fi

docker stop mm-test >/dev/null 2>&1 || true

echo "[smoke] Phase 2: Readiness with Postgres"
docker network create mm-net >/dev/null 2>&1 || true
docker run -d --name mm-db --network mm-net -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=app postgres:16-alpine
docker run -d --network mm-net -p ${PORT}:3000 --name mm-test \
  -e DATABASE_URL=postgresql://postgres:postgres@mm-db:5432/app \
  -e JWT_SECRET=test-secret-ci-access-1234567890 \
  -e JWT_REFRESH_SECRET=test-secret-ci-refresh-1234567890 \
  "${TAG}"

if ! wait_url "${READY_URL}" "${RETRIES_READY}" "${SLEEP_SECS}"; then
  echo "[smoke] Service did not become ready. Container logs (api):" >&2
  docker logs mm-test || true
  echo "[smoke] Container logs (db):" >&2
  docker logs mm-db || true
  exit 1
fi

echo "[smoke] Success: liveness and readiness checks passed"
