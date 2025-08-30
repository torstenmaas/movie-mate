# CI Guidelines (GitHub Actions)

This doc summarizes the practical setup we use and how to enforce quality on Pull Requests without blocking velocity.

## Required Checks on PRs (Branch Protection)

Enable on `main` with the following stable job names:

- CI / Build & Test
- CI / E2E (DB, Testcontainers)
- CI / Release Check (Docker build + smoke)
- CI / Prisma Migrate Dry Run
- CodeQL / Analyze (optional, recommended)

Notes:

- Lint and typecheck run within “Build & Test”; making that job required is sufficient.
- If you rename workflow jobs, update Branch Protection required checks accordingly.

How to configure (GitHub UI):

1. GitHub → Settings → Branches → Branch protection rules → Add rule.
2. Protect matching branch: `main`.
3. Enable:
   - Require a pull request before merging.
   - Require status checks to pass before merging.
   - Search and select checks (exact names):
     - CI / Build & Test
     - CI / E2E (DB, Testcontainers)
     - CI / Release Check (Docker build + smoke)
     - CI / Prisma Migrate Dry Run
     - CodeQL / Analyze (optional)
   - Optionally: Require branches to be up to date before merging.
4. Save.

gh CLI (optional — informational only, not for CI):

```
# Requires: repo admin, gh auth with admin:repo_hook + repo scope
OWNER="your-org-or-user"
REPO="movie-mate"
BRANCH="main"

gh api -X PUT \
  repos/$OWNER/$REPO/branches/$BRANCH/protection \
  -H "Accept: application/vnd.github+json" \
  -F enforce_admins=true \
  -F required_pull_request_reviews.dismiss_stale_reviews=true \
  -F required_pull_request_reviews.required_approving_review_count=1 \
  -F required_status_checks.strict=true \
  -F required_status_checks.contexts[]='CI / Build & Test' \
  -F required_status_checks.contexts[]='CI / E2E (DB, Testcontainers)' \
  -F required_status_checks.contexts[]='CI / Release Check (Docker build + smoke)' \
  -F required_status_checks.contexts[]='CI / Prisma Migrate Dry Run' \
  -F required_status_checks.contexts[]='CodeQL / Analyze' \
  -F restrictions=
```

## What Each Job Covers

- Build & Test
  - pnpm install, format check (`pnpm format:check` fail-fast), lint, typecheck
  - jest with coverage (uploads lcov + summary + HTML)
- E2E (DB)
  - Runs e2e tests that need a database (Testcontainers)
- Release Check
  - Docker build
  - Trivy image scan (blocking on CRITICAL; report uploaded as artifact)
  - Liveness smoke: `GET /health`
  - Readiness smoke with Postgres container: `GET /health/ready`
- Prisma Migrate Dry Run
  - führt `prisma migrate deploy` gegen eine ephemere Postgres-Instanz aus; fängt Migrationsfehler früh ab; nutzt keine Secrets.
- Quality (optional)
  - Coverage gate ≥ 70% (non-blocking)
  - pnpm audit (high)
  - Uploads coverage artifacts again (HTML + lcov)

## When to Add More Checks

- Security: Trivy is now blocking on CRITICAL; consider adding HIGH later if signal remains good.
- Coverage gate (blocking): after the team is comfortable with baseline.
- Node matrix: introduce Node 18/20 to catch runtime differences.

## Local Parity Quick Reference

- Install: `pnpm install`
- Typecheck: `pnpm typecheck`
- Lint: `pnpm lint`
- Unit tests: `pnpm exec jest --runInBand`
- With DB e2e: `RUN_DB_TESTS=true pnpm exec jest --runInBand`
- Coverage HTML: `pnpm exec jest --coverage --coverageReporters=html --runInBand`

## Artifacts You Can Download From CI

- Coverage (lcov.info, coverage-summary.json, HTML report)
- Trivy image scan report (text)
  - Note: even though Trivy is blocking on CRITICAL, the full report remains available as an artifact.

## Next Steps (optional)

- Switch Coolify to deploy from GHCR images built by CI.
- Add a `deploy` workflow that triggers Coolify after migrations (`prisma migrate deploy`).
- Add a smoke test against the live environment after deploy (curl `/health/ready`).
