# Movie Mate

- API docs (Swagger): when `ENABLE_SWAGGER=true`, visit `/docs`.
- Error codes: see `docs/error-codes.md` for stable codes and response shape.
- Health endpoints: `/health` (liveness) and `/health/ready` (503 until DB is reachable).

Dev quickstart:

- Install: `pnpm install`
- Test: `pnpm test`
- Typecheck: `pnpm typecheck`
