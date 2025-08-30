# Deploy Guide (GHCR → Coolify)

This guide describes how to deploy the API via GitHub Actions using a container image in GHCR and triggering a Coolify redeploy webhook. It assumes you already have a Coolify server and a PostgreSQL database.

## Overview

- CI builds and pushes image to GHCR on every push to `main`.
- CI runs `prisma migrate deploy` against your prod database.
- CI triggers Coolify via the per‑app Deploy Webhook to pull the new image and restart.

## Prerequisites

- Coolify app created (project/environment), currently running either from repo or an image.
- Production database reachable from CI (for migrate deploy) or you will switch that step off initially.
- Domain + SSL managed by Coolify (optional but recommended).

## GitHub configuration

1. Secrets (Repository or Environment `PROD`)

- `DATABASE_URL`: Prod Postgres URL (e.g., `postgresql://user:pass@host:5432/db`)
- `COOLIFY_WEBHOOK_URL`: Coolify → App → Configuration → Webhooks → “Deploy Webhook (auth required)” → copy URL with `uuid=...`
- `COOLIFY_API_TOKEN` (optional but recommended): Coolify → Keys & Tokens → API tokens → create token (Team must match app team)

2. Nothing else required for GHCR push

- The default `GITHUB_TOKEN` has `packages:write` and is used by our workflow.
- The workflow builds and pushes tags `:sha7` and `:main` to `ghcr.io/<owner>/<repo>`.

## Coolify configuration

1. Switch app to pull from GHCR

- App → Configuration → Git Source: change to “Image from registry”.
- Image: `ghcr.io/<owner>/<repo>:main`
- If the package is private: add registry credentials in Coolify (username = your GitHub user, password = a GitHub PAT with `read:packages`). If the package is public, no auth is needed.

2. Healthcheck

- Path: `/api/v1/health`
- Make sure container port is `3000` (Dockerfile exposes 3000).

3. Environment variables

- Set app environment (from `.env.example`): `NODE_ENV`, `PORT`, `CORS_ALLOWLIST`, `JWT_*`, optional cookie flags, etc.

4. Deploy Webhook (auth required)

- App → Configuration → Webhooks → copy the “Deploy Webhook (auth required)” URL.
- Test locally (replace placeholders):

```
TOKEN=... # from Coolify Keys & Tokens (optional if webhook allows unauthenticated)
curl -i -X POST \
  -H "Authorization: Bearer $TOKEN" \
  "http://<coolify-host>:8000/api/v1/deploy?uuid=<UUID>&force=false"
```

## Workflows used

- `.github/workflows/deploy.yml`
  - `build-push`: build + push image to GHCR (läuft automatisch nur, wenn CI grün ist; sonst nur manuell).
  - `coolify-deploy`: POST to `COOLIFY_WEBHOOK_URL` (adds `Authorization: Bearer` if token provided).
  - Hinweis: DB‑Migrationen laufen im Container‑Entrypoint (siehe Dockerfile `ENTRYPOINT scripts/docker-entry.sh`), daher ist kein DB‑Zugriff vom GitHub Runner nötig.

- `.github/workflows/backup-db.yml` (optional)
  - Nightly `pg_dump` using `DATABASE_URL`. Stores dumps as artifacts (14 days).

## Rollback

- Coolify → Deployments: select a previous image/tag and redeploy.
- Or tag/push a previous SHA as `:main` and let the workflow redeploy.
- Database migrations: prefer forward‑only. For irreversible failures, restore from backup (pg_dump/Hetzner snapshot).

## Troubleshooting

- `401 Unauthenticated` on webhook: token missing/invalid → include `Authorization: Bearer <token>`.
- `404 No resources found` on webhook: wrong `uuid` (copy from the app’s Webhooks section) or token scope/team mismatch.
- Coolify can’t pull image: if GHCR package is private, add registry credentials to Coolify or make package public.
- `migrate deploy` fails: verify `DATABASE_URL` and that the DB is reachable from GitHub runners. If private network only, disable the step and run migrations during deploy inside Coolify.

## Notes

- Swagger docs under `/api/v1/docs` (enable with `ENABLE_SWAGGER=true`).
- Error responses include a `traceId` and set `x-trace-id` header for correlation.
- The app uses Helmet; CSP is disabled only for the Swagger route.
