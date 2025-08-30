# Movie Mate

[![CI](https://github.com/torstenmaas/movie-mate/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/torstenmaas/movie-mate/actions/workflows/ci.yml)
[![Quality](https://github.com/torstenmaas/movie-mate/actions/workflows/quality.yml/badge.svg)](https://github.com/torstenmaas/movie-mate/actions/workflows/quality.yml)
[![Publish Image (GHCR)](https://github.com/torstenmaas/movie-mate/actions/workflows/publish-image.yml/badge.svg)](https://github.com/torstenmaas/movie-mate/actions/workflows/publish-image.yml)

- API docs (Swagger): when `ENABLE_SWAGGER=true`, visit `/docs`.
- Error codes: see `docs/error-codes.md` for stable codes and response shape.
- Health endpoints: `/api/v1/health` (liveness) and `/api/v1/health/ready` (503 until DB is reachable).
- CI Coverage: erzeugt in CI und Quality als Artefakt (`coverage/lcov.info`, `coverage-summary.json`).
- CI Richtlinien: siehe `docs/ci-guidelines.md` (Required Checks auf PRs, Jobs, Artefakte).

Deploy & Ops Notes

- Deploy-Workflow: Nach dem Coolify-Deploy läuft ein Live-Smoke gegen `/api/v1/health/ready` (mehrfacher Backoff) und verifiziert den Commit (Short-SHA) via `IMAGE_COMMIT` im Image.
- Sicherheits-Guard: In Produktion startet die API nicht mit Dev‑JWT‑Defaults (Fail‑Fast). CI enthält zusätzlich einen non‑blocking Warnstep für Dev‑JWT‑Defaults. Details: `docs/ops-secrets.md`.

Formatting & Quality

- Vor Commits: `pnpm format` ausführen; optional `pnpm lint` und `pnpm typecheck`.
- Tests lokal: `pnpm exec jest --runInBand` (mit DB: `RUN_DB_TESTS=true`)

Dev quickstart:

- Install: `pnpm install`
- Test: `pnpm test`
- Typecheck: `pnpm typecheck`
