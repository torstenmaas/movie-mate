# TASKS.md - Development Tasks

## Setup Phase

- [ ] Initialize monorepo structure with npm workspaces
- [ ] Create apps/api directory for NestJS
- [ ] Initialize NestJS application with CLI
- [ ] Configure TypeScript for strict mode
- [ ] Setup ESLint and Prettier
- [ ] Create .env.example file
- [ ] Setup .gitignore properly
- [ ] Initialize git repository

## API Foundation

- [ ] Install core NestJS dependencies
- [ ] Create health check module
- [ ] Implement GET /health endpoint
- [ ] Add health check tests
- [ ] Setup Swagger documentation
- [ ] Configure CORS properly
- [ ] Add request logging middleware
- [ ] Setup config module for env vars

## Testing Setup

- [ ] Configure Jest for NestJS
- [ ] Create test database setup
- [ ] Add Supertest for e2e tests
- [ ] Create first integration test for /health
- [ ] Setup test coverage reporting
- [ ] Add pre-commit hooks for tests

## CI/CD Pipeline

- [ ] Create .github/workflows directory
- [ ] Setup Node.js CI workflow
- [ ] Add test job to workflow
- [ ] Add build job to workflow
- [ ] Setup Docker build in CI
- [ ] Configure Dockerfile for NestJS
- [ ] Add Docker compose for local dev
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
- [ ] Add migration scripts
- [x] Create user entity with email/displayName (2025-08-25)
- [x] Create session entity (2025-08-25)
- [x] Create email verification entity (2025-08-25)
- [x] Create password reset entity (2025-08-25)
- [ ] Setup migration CI/CD
- [ ] Add database health check

## Authentication Module

- [ ] Install Passport and @nestjs/passport
- [ ] Install passport-local strategy
- [ ] Create auth module
- [ ] Implement register endpoint with Zod validation
- [ ] Implement login endpoint
- [ ] Implement logout endpoint
- [ ] Add JWT token generation
- [ ] Create auth guards
- [ ] Add auth tests
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
