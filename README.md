# Movie Mate

[![CI](https://github.com/torstenmaas/movie-mate/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/torstenmaas/movie-mate/actions/workflows/ci.yml)
[![Quality](https://github.com/torstenmaas/movie-mate/actions/workflows/quality.yml/badge.svg)](https://github.com/torstenmaas/movie-mate/actions/workflows/quality.yml)
[![Publish Image (GHCR)](https://github.com/torstenmaas/movie-mate/actions/workflows/publish-image.yml/badge.svg)](https://github.com/torstenmaas/movie-mate/actions/workflows/publish-image.yml)

- API docs (Swagger): when `ENABLE_SWAGGER=true`, visit `/docs`.
- Error codes: see `docs/error-codes.md` for stable codes and response shape.
- Health endpoints: `/health` (liveness) and `/health/ready` (503 until DB is reachable).
 - CI Coverage: erzeugt in CI und Quality als Artefakt (`coverage/lcov.info`, `coverage-summary.json`).

Dev quickstart:

- Install: `pnpm install`
- Test: `pnpm test`
- Typecheck: `pnpm typecheck`
