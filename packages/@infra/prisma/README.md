# @infra/prisma

Database client and migrations for Movie Mate platform using Prisma ORM.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Generate Prisma client:
```bash
npm run generate
```

3. Run migrations:
```bash
DATABASE_URL="postgresql://user:pass@localhost:5432/moviemate" npx prisma migrate deploy
```

4. Seed database (optional):
```bash
DATABASE_URL="postgresql://user:pass@localhost:5432/moviemate" npm run seed
```

## Scripts

From the root of the monorepo:

- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Deploy migrations to database
- `npm run prisma:seed` - Seed database with initial data

## Testing

Run integration tests:
```bash
npm test
```

## Models

- **User**: Core user entity with authentication fields
- **Session**: User sessions for authentication
- **EmailVerification**: Email verification tokens
- **PasswordReset**: Password reset tokens

All models use UUID primary keys and include proper indexes for performance.