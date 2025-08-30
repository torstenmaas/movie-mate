Sentry (Self-Hosted) Integration — API

Goal

- Capture errors and performance traces from the NestJS API, gated by env vars.
- Exclude health and docs routes from reporting.
- Provide a one-time setup verification toggle.

Prerequisites

- A running self-hosted Sentry instance with an organization and project created for the API.
- DSN copied from Sentry → Project Settings → Client Keys (DSN).

Env Variables

- `SENTRY_DSN`: DSN for the API project. If empty, Sentry stays disabled.
- `SENTRY_TRACES_SAMPLE_RATE`: 0.0–1.0, default `0.1` (10%).
- `SENTRY_PROFILES_SAMPLE_RATE`: 0.0–1.0, default `0` (off).
- `SENTRY_VERIFY_SETUP`: `true|false`, default `false`. When `true`, logs a single `sentry-setup-ok` message at boot.
- `NODE_ENV`: Used as Sentry `environment`.
- `IMAGE_COMMIT` (optional): Full git SHA injected by CI/CD. The integration uses the short SHA as `release`.

Example (.env):

```
SENTRY_DSN=http://<key>@sentry.example.com/1
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_PROFILES_SAMPLE_RATE=0
SENTRY_VERIFY_SETUP=false
```

What’s Implemented

- Sentry initialisation in `apps/api/src/main.ts` when `SENTRY_DSN` is set.
  - `environment` from `NODE_ENV`.
  - `release` from `IMAGE_COMMIT` short SHA if present.
  - `tracesSampleRate` and `profilesSampleRate` from env (defaults 0.1 / 0.0).
- Express request/tracing handlers are attached before Nest is created; error handler after app setup.
- Filters via `beforeSend` and `beforeSendTransaction` drop health (`/api/v1/health*`) and docs (`/api/v1/docs*`).
- One-time verification event on startup when `SENTRY_VERIFY_SETUP=true`.

Self‑Hosted Sentry: Project Setup

1. Create project: Backend → Node.js (Express).
2. Copy DSN: Project Settings → Client Keys (DSN).
3. Configure sampling under Project Settings → Performance → Sampling.
4. Configure alerts/quotas:
   - Alerts for error spikes (Issues → Alerts).
   - Quotas to cap event volume.
5. Optionally set “Environments” to group envs (production, staging, development).

Deployment Notes

- Do not commit secrets. DSN is configured only via env.
- CI/CD should set `IMAGE_COMMIT` to the current git SHA to enable release tagging.
- Health endpoints are excluded from ingestion to keep noise low.

Verification

1. Set envs and start the API with `SENTRY_DSN` configured.
2. Temporarily set `SENTRY_VERIFY_SETUP=true` and restart the API.
3. In Sentry UI → Project → Issues, search for `sentry-setup-ok` or check Performance → Transactions.
4. Disable verification by setting `SENTRY_VERIFY_SETUP=false` and restart. Do not leave verification enabled in production.

Operations Tips

- Tune `SENTRY_TRACES_SAMPLE_RATE` per environment (e.g., higher in staging, lower in production).
- Keep `SENTRY_PROFILES_SAMPLE_RATE=0` unless profiling is needed; it adds overhead.
- Use `x-trace-id` from responses to correlate API errors with clients/logs.
