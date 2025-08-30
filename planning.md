# PLANNING.md - Technical Architecture

## System Overview

```
┌─────────────────────────────────────────────┐
│                 Coolify                      │
│         (Hetzner Cloud Server)               │
├─────────────────────────────────────────────┤
│                                              │
│  ┌──────────────┐      ┌──────────────┐    │
│  │   NestJS     │      │    Redis      │    │
│  │     API      │◄────►│    Cache      │    │
│  │  Port 3000   │      └──────────────┘     │
│  └──────┬───────┘                           │
│         │                                    │
│         ▼                                    │
│  ┌──────────────┐      ┌──────────────┐    │
│  │  PostgreSQL  │      │   Frontend    │    │
│  │   Database   │      │   (Later)     │    │
│  └──────────────┘      └──────────────┘     │
│                                              │
└─────────────────────────────────────────────┘
```

## Tech Stack Decisions

### Backend (apps/api)

- **Framework**: NestJS - Enterprise structure, built-in WebSockets
- **Language**: TypeScript - Type safety, better DX
- **Database**: PostgreSQL (Coolify hosted) - Relational data, ACID
- **ORM**: Prisma - Type-safe, mature ORM with migrations & seeding
- **Auth**: Passport - Battle-tested with NestJS integration
- **Cache**: None initially - Add Redis when needed
- **Validation**: Zod - Universal validation (Backend + Frontend)
- **Testing**: Jest + Supertest
- **Docs**: Swagger/OpenAPI; export OpenAPI JSON for SDKs
- **Email**: React Email + Resend - Modern email stack

### Infrastructure

- **Hosting**: Hetzner Cloud (€5/month)
- **Deployment**: Coolify (self-hosted PaaS)
- **Database**: PostgreSQL in Coolify (Prod), Docker locally (Dev)
- **CI/CD**: GitHub Actions
- **Monitoring**: Coolify built-in + custom health checks
- **SSL**: Let's Encrypt via Coolify

### Frontend (Later)

- **Framework**: Vite + React 18 (stable)
- **UI**: Mantine v7 (latest stable)
- **Routing**: TanStack Router - Type-safe routing
- **State**: TanStack Query - Server state management
- **Forms**: TanStack Form + Zod - Type-safe forms
- **Validation**: Zod - Shared with backend
- **Testing**: Vitest + React Testing Library
- **Storybook**: Later when component library grows

## Data Models (Core)

```typescript
// User
{
  id: uuid
  email: string              // Login identifier
  displayName: string        // Public name
  hashedPassword: string
  emailVerified: boolean
  language: 'de' | 'en'
  createdAt: timestamp
  updatedAt: timestamp
}

// Session (Passport/Express)
{
  id: string
  userId: uuid
  expiresAt: timestamp
  data: json               // Session data
}

// EmailVerification
{
  id: uuid
  userId: uuid
  token: string
  expiresAt: timestamp
}

// PasswordReset
{
  id: uuid
  userId: uuid
  token: string
  expiresAt: timestamp
  usedAt: timestamp?
}
```

## Critical Flows

### 1. Health Check

```
GET /health → { status: 'ok', timestamp, version }
```

### 2. User Registration (Phase 2)

```
POST /auth/register → Validate → Hash Password → Create User → Create Session → Return Token
```

### 3. WebSocket Connection (Phase 3)

```
WS /notifications → Authenticate → Subscribe to User Channel → Emit Events
```

## Performance Requirements

- API Response: < 200ms (p95)
- WebSocket Latency: < 100ms
- Database Queries: < 50ms
- Uptime: 99.9% (43 min/month downtime)

## Security Requirements

- Passwords: Argon2id hashing
- Sessions: 30 day expiry, secure cookies
- Rate Limiting: 100 req/min per IP
- CORS: Whitelist origins
- Headers: Helmet.js defaults
- Validation: Input sanitization

## Deployment Pipeline

```
1. Push to main
2. GitHub Actions triggered
3. Run tests (unit, integration)
4. Build Docker image
5. Push to registry
6. Coolify webhook triggered
7. Deploy to Hetzner
8. Health check
9. Switch traffic

Operational Notes

- Live-Smoke (CI/Deploy): Nach dem Coolify-Deploy prüft ein CI-Job die öffentliche Readiness unter `/api/v1/health/ready` mit Backoff und verifiziert die Short‑SHA (aus `IMAGE_COMMIT`).
- Produktions-Guard: Die API startet in `NODE_ENV=production` nicht mit Dev‑JWT‑Defaults (Fail‑Fast). Siehe `docs/ops-secrets.md`.
```

## Environment Variables

```bash
# Database (Coolify managed)
DATABASE_URL=postgresql://user:pass@localhost:5432/moviemate

# API
PORT=3000
NODE_ENV=production

# Auth
JWT_SECRET=...
JWT_EXPIRES_IN=30d

# OAuth
OAUTH_GOOGLE_ID=...
OAUTH_GOOGLE_SECRET=...
OAUTH_APPLE_ID=...
OAUTH_APPLE_SECRET=...
OAUTH_META_ID=...
OAUTH_META_SECRET=...

# Email (Resend)
RESEND_API_KEY=...
EMAIL_FROM=noreply@moviemate.app

# External APIs
TMDB_API_KEY=...

# Frontend URL (for CORS and redirects)
FRONTEND_URL=https://moviemate.app
```

## Open Questions

- [ ] CDN for static assets?
- [ ] Backup strategy for PostgreSQL?
- [ ] Rate limiting service or in-app?
- [ ] Monitoring service (Sentry, etc.)?

## Decisions Log

- 2025-08-25: Chose NestJS over Express for structure
- 2025-08-25: Passport over Lucia for NestJS integration
- 2025-08-25: No Redis initially - PostgreSQL for sessions
- 2025-08-25: Monorepo structure for future apps
- 2025-08-25: Hetzner + Coolify over Railway for cost
- 2025-08-25: TanStack suite for frontend state management
- 2025-08-25: Zod for universal validation (backend + frontend)
- 2025-08-25: React Email + Resend for transactional emails
- 2025-08-25: Minimal user model (email + displayName only)

## API Versioning

- Expose endpoints under `/api/v1/*` (path versioning) to allow non‑breaking evolution.
- Freeze v1 contract for frontend clients (Web + Mobile). Breaking changes → `/api/v2`.
