> # SPARC-Kompatibilität (Claude-Flow)
>
> **Nur für Agent-Ausführung – ergänzt die Regeln unten, ohne sie zu ersetzen.**
>
> - **Golden Rule:** _1 Message = alle zusammengehörigen Operationen._ Dateizugriffe, Bash-Befehle, Todos in **einem** Schritt bündeln.
> - **Nie ins Repo-Root schreiben.** Verwende unser Monorepo-Mapping:
>   - Code: `apps/<app>/src`, `packages/<scope>/<pkg>/src`
>   - Tests: `__tests__` neben `src`
>   - Docs: `docs/`, Config: `config/`, Skripte: `scripts/`
> - **Keine Secrets in Dateien.** Nur ENV/Secrets-Manager verwenden.
> - **Kleine Diffs, eindeutige Commits, PR-Modus an.** (Squash-Merge)
> - **Vor jedem Schritt:** `PLANNING.md`, `TASKS.md` lesen; **nur ungebockte** Tasks anfassen.
>
> Diese Regeln sind **additiv** zu den Projekt-Konventionen unten (Namensregeln, Reviews, A11y, Tests, Observability, Security, etc.).

# CLAUDE.md - Claude Development Instructions

## Purpose

Defines workflow, coding standards, and development conventions for the Movie Mate platform.

## Session Loop

1. **Load Context**
   - Read PLANNING.md for architecture
   - Check current branch/environment
   - Review recent commits if needed

2. **Check Tasks**
   - Read TASKS.md
   - Identify next unchecked atomic task
   - Verify dependencies are complete

3. **Propose Implementation**
   - State which task will be tackled
   - Outline approach
   - Wait for confirmation before proceeding

4. **Implement**
   - Write code incrementally
   - Include tests with implementation
   - Follow style guide below

5. **Update Progress**
   - Mark task complete in TASKS.md with timestamp
   - Add any discovered subtasks
   - Note any blockers or decisions needed

6. **Session Summary**
   - List completed tasks
   - Note any pending decisions
   - Suggest next priorities

## Coding Standards

### General Principles

- **Incremental Changes**: Modify existing code rather than rewriting
- **Test Coverage**: Minimum 80% for API endpoints
- **Type Safety**: Strict TypeScript, no `any` types
- **Error Handling**: Every async operation must have error handling
- **Logging**: Structured logs with correlation IDs

### NestJS API Standards

```typescript
// File naming
*.controller.ts    // Controllers
*.service.ts       // Business logic
*.module.ts        // Module definition
*.dto.ts          // DTOs
*.entity.ts       // Database entities
*.spec.ts         // Tests
```

### Naming Conventions

- **Variables/Functions**: camelCase
- **Classes/Interfaces**: PascalCase
- **Constants**: UPPER_SNAKE_CASE
- **Files**: kebab-case
- **Database**: snake_case

### Git Commit Format

```
type(scope): description

- feat(api): add user authentication
- fix(websocket): resolve connection timeout
- test(auth): add integration tests
- docs(readme): update deployment steps
```

### Testing Requirements

- Unit tests for all services
- Integration tests for all endpoints
- E2E tests for critical flows
- Mocks for external services (TMDB, etc.)

### Documentation

- JSDoc for all public methods
- README in each app directory
- API endpoints documented with Swagger
- Environment variables documented

## Development Workflow

1. **Feature Branch**: `feature/task-description`
2. **Commits**: Atomic, tested, passing CI
3. **PR**: Must pass all checks, have tests
4. **Review**: At least manual testing
5. **Merge**: Squash and merge to main

## Environment Management

- `.env.example` always updated
- Secrets in Hetzner/Coolify
- Local dev uses `.env.local`
- Never commit secrets

## Session Rules

- Always acknowledge task before starting
- Show incremental progress
- Ask for clarification if requirements unclear
- Suggest improvements but stay focused
- Complete one task fully before moving to next
- Before committing, run `pnpm format` and ensure `pnpm lint`/`pnpm typecheck` are clean to minimize CI churn.

## Priority Order

1. Blocking bugs
2. Security issues
3. Test failures
4. Feature tasks (per TASKS.md order)
5. Refactoring
6. Documentation

---

**Remember**: Read PLANNING.md at session start, check TASKS.md for next task, update progress immediately.
