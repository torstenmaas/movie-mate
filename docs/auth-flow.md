# Auth Flow (API)

## Endpoints (prefix `/api/v1`)

- `POST /api/v1/auth/register` → 201
  - Body: email, password, displayName, preferredLocale? (de|en, default de), acceptTerms (true), marketingOptIn?
  - Errors: 422 GEN_VALIDATION_FAILED, 409 GEN_CONFLICT
- `POST /api/v1/auth/login` → 200 { accessToken, refreshToken, user }
  - Errors: 422 GEN_VALIDATION_FAILED, 401 AUTH_INVALID_CREDENTIALS
- `POST /api/v1/auth/refresh` → 200 { accessToken, refreshToken }
  - Body: refreshToken (stateful rotation)
  - Errors: 422 GEN_VALIDATION_FAILED, 401 AUTH_REFRESH_REVOKED (invalid/rotated)
- `GET /api/v1/auth/me` (Bearer) → 200 { sub, email }
- `POST /api/v1/auth/logout` (Bearer) → 204
  - Optional Body: { refreshToken } → revokes whole token family server-side

## Token Strategy

- Access JWT: short-lived (e.g., 15m), stateless
- Refresh JWT: stateful rotation in Postgres
  - Table `refresh_tokens`: jti, familyId, hashedToken, expiresAt, revokedAt, replacedById, meta (userAgent, ip)
  - On refresh: create new, revoke old; reuse of old triggers family revoke (anti-replay)

## Error Codes

- 422 GEN_VALIDATION_FAILED
- 409 GEN_CONFLICT (duplicate register)
- 401 AUTH_INVALID_CREDENTIALS (login)
- 401 AUTH_REFRESH_REVOKED (refresh invalid/rotated)

## Swagger

- Enable with `ENABLE_SWAGGER=true` → `/docs`
- DTOs documented via classes in `apps/api/src/auth/dto/*.swagger.ts`

## Testing

- Unit: `pnpm test`
- E2E with DB: `RUN_DB_TESTS=true pnpm test:db`
  - Health, Register, Login → /auth/me, Refresh rotation & reuse, Logout
