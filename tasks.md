# TASKS.md - Development Tasks

## Setup Phase

- [x] Initialize monorepo structure with npm workspaces (2025-08-28)
- [x] Create apps/api directory for NestJS (2025-08-28)
- [x] Initialize NestJS application (manual scaffold; not CLI) (2025-08-28)
- [x] Configure TypeScript for strict mode (2025-08-28)
- [x] Setup ESLint and Prettier (2025-08-28)
- [x] Create .env.example file (2025-08-28)
- [x] Setup .gitignore properly (2025-08-28)
- [x] Initialize git repository (2025-08-28)

## API Foundation

- [x] Install core NestJS dependencies (2025-08-28)
- [x] Create health check module (2025-08-28)
- [x] Implement GET /health endpoint (2025-08-28)
- [x] Add health check tests (unit) (2025-08-28)
- [x] Setup Swagger documentation (flagged via ENABLE_SWAGGER) (2025-08-29)
- [x] Configure CORS properly (allowlist from env) (2025-08-29)
- [x] Add request logging middleware (nestjs-pino) (2025-08-29)
- [x] Setup config module for env vars (2025-08-28)
- [x] Add global exception filter with standardized error shape + traceId (2025-08-29)
- [x] Add traceId middleware + x-trace-id propagation (2025-08-29)

## Testing Setup

- [x] Configure Jest for NestJS (2025-08-28)
- [x] Create test database setup (Testcontainers) (2025-08-28)
- [x] Add Supertest for e2e tests (library added) (2025-08-28)
- [x] Create first integration test for /health (2025-08-29)
- [x] Setup test coverage reporting (2025-08-28)
- [ ] Add pre-commit hooks for tests
- [x] Add e2e test for standardized error shape + traceId (2025-08-29)
- [x] Add unit tests: JwtAuthGuard, LoggingInterceptor, Health ready controller (2025-08-29)
- [x] Extend exception filter tests for mappings and header traceId (2025-08-29)

## CI/CD Pipeline

- [x] Create .github/workflows directory (2025-08-28)
- [x] Setup Node.js CI workflow (2025-08-28)
- [x] Add test job to workflow (2025-08-28)
- [x] Add E2E (DB, Testcontainers) job (2025-08-29)
- [x] Add build job to workflow (2025-08-29)
- [x] Setup Docker build in CI (2025-08-29)
- [x] Configure Dockerfile for NestJS (2025-08-29)
- [x] Add Docker compose for local dev (2025-08-28)
- [ ] Setup webhook for Coolify

### CI Enhancements (2025-08-29)

- [x] Docker liveness smoke test (/health)
- [x] Readiness smoke test with Postgres service container (/health/ready)
- [x] Trivy image scan (non-blocking)
- [x] Upload coverage artifacts (lcov, summary) + HTML report
- [x] Quality workflow: coverage gate ≥ 70% (non-blocking) + pnpm audit (high)
- [x] GHCR publish workflow (manual + tags)

### CI v2 (before Beta)

- [x] CI: Docker build + smoke test (curl /health)
- [ ] CI: Prisma migrate deploy dry-run against ephemeral DB
- [~] CI: Coverage gate ≥ 70% (unit + e2e) — non-blocking in Quality workflow
- [x] CI: Security scans (npm audit high+, Trivy image)
- [ ] CI: Node 18/20 matrix
- [ ] CI: Lint/Typecheck required checks on PRs

## Coolify Deployment

- [x] Install Coolify on Hetzner server
- [x] Configure domain and SSL
- [x] Create new project in Coolify
- [x] Connect GitHub repository
- [x] Configure environment variables
- [x] Setup PostgreSQL in Coolify
- [ ] Setup Redis in Coolify
- [x] Deploy first version
- [x] Verify health endpoint live
- [ ] Setup monitoring

## Database Layer

- [x] Initialize Prisma + seed scripts (2025-08-25)
- [ ] Create database schema module
- [x] Add migration scripts (2025-08-25)
- [x] Create user entity with email/displayName (2025-08-25)
- [x] Create session entity (2025-08-25)
- [x] Create email verification entity (2025-08-25)
- [x] Create password reset entity (2025-08-25)
- [ ] Setup migration CI/CD
- [x] Add database health check (2025-08-29)

## Documentation

- [x] Backend overview: Errors & Tracing section (2025-08-29)
- [x] Health endpoints Swagger + HealthStatusDto (2025-08-29)
- [x] README badges + quickstart + coverage notes (2025-08-29)

## Authentication Module

- [ ] Install Passport and @nestjs/passport
- [ ] Install passport-local strategy
- [x] Create auth module (2025-08-29)
- [x] Implement register endpoint with Zod validation (2025-08-29)
- [x] Implement login endpoint (2025-08-29)
- [x] Implement logout endpoint (stateless + family revoke) (2025-08-29)
- [x] Add JWT token generation (2025-08-29)
- [x] Create auth guards (2025-08-29)
- [x] Add auth tests (register) (2025-08-29)
- [x] Add auth tests (login unit + e2e, refresh rotation/reuse, cookie mode) (2025-08-29)
- [x] Document auth endpoints (Swagger responses + x-error-codes) (2025-08-29)

## Email Module

- [ ] Install React Email and Resend
- [ ] Create email module
- [ ] Design welcome email template
- [ ] Design password reset template
- [ ] Design verification email template
- [ ] Implement email service with Resend
- [ ] Add email preview route (dev only)
- [ ] Test email sending

## OAuth Integration

- [ ] Install passport-google-oauth20
- [ ] Install passport-apple
- [ ] Install passport-facebook
- [ ] Setup Google OAuth with @nestjs/passport
- [ ] Setup Apple OAuth
- [ ] Setup Meta OAuth
- [ ] Create OAuth callback handlers
- [ ] Add OAuth to Swagger docs
- [ ] Test OAuth flows

## WebSocket Foundation

- [ ] Install Socket.io for NestJS
- [ ] Create notifications gateway
- [ ] Add authentication to WebSocket
- [ ] Create basic emit test
- [ ] Add WebSocket tests

## Future Phases

### Frontend App

- [ ] Initialize Vite + React app
- [ ] Setup Mantine UI
- [ ] Create auth pages
- [ ] Connect to API

### Admin Panel

- [ ] TBD after core platform

### B2C Panel

- [ ] TBD after admin panel

---

## Completed Tasks

- [x] Initialize Prisma + seed scripts (2025-08-25)
  - Created packages/@infra/prisma with PostgreSQL 16 configuration
  - Generated initial migration with User, Session, EmailVerification, and PasswordReset models
  - Created seed script with dummy user (preferredLocale='de')
  - Added prisma:generate, prisma:migrate, prisma:seed scripts to root package.json
  - Created integration test for database connection
  - All entities follow the planned data model from PLANNING.md

---

## Notes

- Focus on API first, get it production-ready
- Frontend can be developed separately
- Each task should be atomic and testable
- Update this file after each task completion
