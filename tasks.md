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

## Testing Setup

- [x] Configure Jest for NestJS (2025-08-28)
- [x] Create test database setup (Testcontainers) (2025-08-28)
- [x] Add Supertest for e2e tests (library added) (2025-08-28)
- [ ] Create first integration test for /health
- [x] Setup test coverage reporting (2025-08-28)
- [ ] Add pre-commit hooks for tests

## CI/CD Pipeline

- [x] Create .github/workflows directory (2025-08-28)
- [x] Setup Node.js CI workflow (2025-08-28)
- [x] Add test job to workflow (2025-08-28)
- [ ] Add build job to workflow
- [ ] Setup Docker build in CI
- [ ] Configure Dockerfile for NestJS
- [x] Add Docker compose for local dev (2025-08-28)
- [ ] Setup webhook for Coolify

## Coolify Deployment

- [ ] Install Coolify on Hetzner server
- [ ] Configure domain and SSL
- [ ] Create new project in Coolify
- [ ] Connect GitHub repository
- [ ] Configure environment variables
- [ ] Setup PostgreSQL in Coolify
- [ ] Setup Redis in Coolify
- [ ] Deploy first version
- [ ] Verify health endpoint live
- [ ] Setup monitoring

## Database Layer

- [x] Initialize Prisma + seed scripts (2025-08-25)
- [ ] Configure Drizzle with PostgreSQL (Note: Using Prisma instead)
- [ ] Create database schema module
- [x] Add migration scripts (2025-08-25)
- [x] Create user entity with email/displayName (2025-08-25)
- [x] Create session entity (2025-08-25)
- [x] Create email verification entity (2025-08-25)
- [x] Create password reset entity (2025-08-25)
- [ ] Setup migration CI/CD
- [ ] Add database health check

## Authentication Module

- [ ] Install Passport and @nestjs/passport
- [ ] Install passport-local strategy
- [x] Create auth module (2025-08-29)
- [x] Implement register endpoint with Zod validation (2025-08-29)
- [ ] Implement login endpoint
- [ ] Implement logout endpoint
- [ ] Add JWT token generation
- [ ] Create auth guards
- [x] Add auth tests (register) (2025-08-29)
- [ ] Document auth endpoints

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
