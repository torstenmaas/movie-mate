# Error Code Catalog (as of 2025-08-25)

**Format:** `DOMAIN_REASON` with stable HTTP status and developer-friendly messages.  
**Response shape:**

```json
{
  "error": "FRIEND_REQUEST_DUPLICATE",
  "message": "Friendship already exists.",
  "status": 409,
  "details": { "userId": "..." }
}
```

## General (GEN\_\*)

- `GEN_UNAUTHORIZED` — 401 — Missing/invalid credentials.
- `GEN_FORBIDDEN` — 403 — Lacking permissions/scope.
- `GEN_NOT_FOUND` — 404 — Resource not found.
- `GEN_RATE_LIMITED` — 429 — Too many requests.
- `GEN_CONFLICT` — 409 — State conflict.
- `GEN_VALIDATION_FAILED` — 422 — Input validation failed.
- `GEN_INTERNAL` — 500 — Unexpected server error.
- `GEN_IDEMPOTENCY_REPLAY` — 409 — Idempotency key replayed.

## Auth (AUTH\_\*)

- `AUTH_INVALID_CREDENTIALS` — 401 — Email/password incorrect.
- `AUTH_TOKEN_EXPIRED` — 401 — Access token expired.
- `AUTH_REFRESH_REVOKED` — 401 — Refresh token invalid/rotated.
- `AUTH_SCOPE_MISSING` — 403 — Required scope missing.

## Friendships (FRIEND\_\*)

- `FRIEND_REQUEST_DUPLICATE` — 409 — Friendship already exists or pending.
- `FRIEND_REQUEST_NOT_FOUND` — 404 — Invitation not found or expired.
- `FRIEND_FORBIDDEN` — 403 — Not allowed to modify this friendship.
- `FRIEND_BLOCKED` — 409 — User is blocked.

## Watchlists (WATCHLIST\_\*)

- `WATCHLIST_ITEM_NOT_FOUND` — 404 — Item not found on watchlist.
- `WATCHLIST_DUPLICATE_ITEM` — 409 — Title already present.
- `WATCHLIST_FORBIDDEN` — 403 — Not allowed (visibility/private).

## Suggestions (SUGGEST\_\*)

- `SUGGEST_ALREADY_ACCEPTED` — 409 — Suggestion already accepted/closed.
- `SUGGEST_TARGET_INVALID` — 422 — Invalid target users.
- `SUGGEST_NOT_FOUND` — 404 — Suggestion not found.
- `SUGGEST_FORBIDDEN` — 403 — Not allowed to view/modify.

## Viewings (VIEW\_\*)

- `VIEW_DUPLICATE_ENTRY` — 409 — Duplicate viewing record.
- `VIEW_INVALID_GROUP` — 422 — Group reference invalid.
- `VIEW_FORBIDDEN` — 403 — Not allowed to record/view.

## Notifications (NOTIF\_\*)

- `NOTIF_NOT_FOUND` — 404 — Notification not found.
- `NOTIF_ALREADY_ACKED` — 409 — Already acknowledged.

---

### Conventions

- **Stability:** Codes are stable once released; deprecations listed in a table with replacement codes.
- **Docs:** Each endpoint documents possible codes in OpenAPI via `x-error-codes` extension.
- **Tracing:** Error responses include a `traceId`; the same value is sent as an `x-trace-id` header for correlation.
- **Localization:** `message` is developer-facing English; client UIs localize by code.
