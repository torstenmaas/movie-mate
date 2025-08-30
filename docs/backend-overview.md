# Backend Overview

## Scope Implemented

- Health endpoints: `/api/v1/health` (tolerant, includes `db`, `commit`) and `/api/v1/health/ready` (503 if DB down)
- Auth
  - `POST /api/v1/auth/register` (Zod validation, Argon2id hashing)
  - `POST /api/v1/auth/login` → Access + Refresh (JWT)
  - `POST /api/v1/auth/refresh` → Stateful rotation + reuse detection (Postgres)
  - `GET /api/v1/auth/me` (Bearer)
  - `POST /api/v1/auth/logout` → 204, optional server-side family revoke
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
  - Security: In production, when `REFRESH_TOKEN_COOKIE=true`, you must set `COOKIE_SECURE=true` (fail-fast guard). Optionally set `COOKIE_DOMAIN` to your app domain for cross-subdomain cookies.

## Error Codes Alignment

- Validation → `GEN_VALIDATION_FAILED` (422)
- Duplicate register → `GEN_CONFLICT` (409)
- Login invalid → `AUTH_INVALID_CREDENTIALS` (401)
- Refresh invalid/rotated → `AUTH_REFRESH_REVOKED` (401)
- CSRF failed → `GEN_FORBIDDEN` (403)

## Errors & Tracing

- Standardized error shape returned by a global filter:
  - Fields: `statusCode`, `error` (from docs/error-codes.md), `message`, optional `details`, and `traceId`.
  - The same `traceId` is also sent as `x-trace-id` response header. Incoming `x-trace-id`/`x-request-id` is reused if present.
- Swagger documents error responses for auth endpoints and lists possible codes via `x-error-codes`.
- Default mappings by status: 401 → `GEN_UNAUTHORIZED`, 403 → `GEN_FORBIDDEN`, 404 → `GEN_NOT_FOUND`, 409 → `GEN_CONFLICT`, 422 → `GEN_VALIDATION_FAILED`, 429 → `GEN_RATE_LIMITED`, 500 → `GEN_INTERNAL`.

Observability

## IDs

- Neue Entitäten verwenden UUIDv7 (zeitlich sortierbar). Der DB-Typ bleibt Postgres `uuid`.
- Vorteile: stabile zeitliche Ordnung ohne Zusatzfelder; gute Index-Lokalität.
- Hinweis: Ältere/Testdaten können noch UUIDv4 sein; Sortierung/Cursor berücksichtigen beide.

## Pagination

- Stil: Cursor-basiert mit opaken Cursorn.
- Query-Params: `limit` (1–100; Default 20), `cursor` (optional).
- Sortierung: `createdAt DESC, id DESC` (UUIDv7 erlaubt Ordnung über `id`; `createdAt` dient als Tie-Breaker und für v4-Kompatibilität).
- Response-Shape:
  - `items`: Ergebnisliste
  - `pageInfo`: `{ nextCursor?: string, prevCursor?: string, hasNextPage: boolean, hasPrevPage: boolean }`
- Header: Zusätzlich `Link`-Header (`rel="next"|"prev"`) setzen.
- Cursor: Opaque, URL-sicher Base64 von `{ id, createdAt }`. Ungültig → 422 `GEN_VALIDATION_FAILED`.
- Fehler: `limit` außerhalb Range → 422.

## Time Format

- Alle Zeitstempel sind ISO-8601 UTC mit Millisekunden und `Z`-Suffix (z. B. `2025-08-30T18:24:15.123Z`).
- Einheitliche Feldnamen: `createdAt`, `updatedAt`, `expiresAt`, `revokedAt`.
- Eingaben (Filter) akzeptieren ISO-8601 UTC und werden serverseitig nach UTC normalisiert.

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
- Docker-Build + Smoke: Workflow baut das Image und pingt `/health/ready` bis es 200 liefert.
