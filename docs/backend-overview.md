# Backend Overview

## Scope Implemented

- Health endpoints: `/health` (tolerant, includes `db`, `commit`) and `/health/ready` (503 if DB down)
- Auth
  - `POST /auth/register` (Zod validation, Argon2id hashing)
  - `POST /auth/login` → Access + Refresh (JWT)
  - `POST /auth/refresh` → Stateful rotation + reuse detection (Postgres)
  - `GET /auth/me` (Bearer)
  - `POST /auth/logout` → 204, optional server-side family revoke
- Config: `@nestjs/config` + Zod validation
- CORS: Allowlist via `CORS_ALLOWLIST`
- Logging: `nestjs-pino` JSON logs
- Swagger: `/docs` (enable via `ENABLE_SWAGGER=true`)

## Refresh Rotation (Stateful)

- Table: `refresh_tokens` (jti, familyId, hashedToken, expiresAt, revokedAt, replacedById, meta)
- Rotation: On refresh, old is revoked and linked to new; reuse revokes family

## Cookie Mode (optional)

- `REFRESH_TOKEN_COOKIE=true` enables httpOnly refresh cookie + CSRF cookie
- CSRF header: `x-csrf-token` must match `csrfToken` cookie
- `COOKIE_SECURE`, `COOKIE_DOMAIN`, `REFRESH_COOKIE_NAME`, `CSRF_COOKIE_NAME`, `CSRF_HEADER_NAME`

## Error Codes Alignment

- Validation → `GEN_VALIDATION_FAILED` (422)
- Duplicate register → `GEN_CONFLICT` (409)
- Login invalid → `AUTH_INVALID_CREDENTIALS` (401)
- Refresh invalid/rotated → `AUTH_REFRESH_REVOKED` (401)
- CSRF failed → `GEN_FORBIDDEN` (403)

## ENV (excerpt)

- JWT_SECRET, JWT_EXPIRES_IN
- JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRES_IN
- REFRESH_PEPPER (optional)
- REFRESH_TOKEN_COOKIE, COOKIE_SECURE, COOKIE_DOMAIN

## Testing

- Unit: `pnpm test`
- E2E (DB): `RUN_DB_TESTS=true pnpm test:db`

### CI Hints

- Testcontainers benötigt Docker im CI Runner. Alternativ E2E in einer Stufe mit `services: postgres` laufen lassen und die Tests gegen diese DB richten.
- Für reine Unit-Pipelines genügt `pnpm test` (keine Container nötig).
- Prisma Migrations in CI/Prod: `pnpm prisma:migrate:deploy` (nicht `migrate:dev`).
