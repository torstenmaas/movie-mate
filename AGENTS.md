# AGENTS.md — Codex CLI Development Guide (Movie Mate)

This document defines how we (you + Codex CLI assistant) work on Movie Mate without Claude. It aligns with CLAUDE.md, PRD, planning, and tasks, but uses this assistant’s tools and safeguards.

## Purpose

- Establish a clear, repeatable workflow for implementation, testing, and documentation.
- Minimize churn with small, focused changes and fast feedback.
- Keep changes consistent with repo conventions and your priorities.

## Principles

- Single-responsibility changes: one feature/fix per iteration.
- Minimal diffs: modify existing code; avoid unrelated refactors.
- Tests first when feasible; otherwise add tests alongside changes.
- No secrets committed; use `.env` and `.env.example`.
- Never write outside workspace; follow repo layout conventions.
- Ask when scope is ambiguous; don’t guess.

## Roles

- You: set priorities, approve plans, run deployments, and provide product direction.
- Assistant: propose plans, edit files via patches, run safe local commands, and validate with tests/lints.

## Orchestration Model (Queen + Swarm)

- Queen (Controller):
  - Loads context (tasks.md, planning.md, CI/Deploy workflows, docs/\*).
  - Plans and decomposes work into atomic, testable Work‑Packages.
  - Produces precise Swarm prompts (one per PR), with DoD and acceptance criteria.
  - Aggregates Swarm status (STATUS, SUMMARY, PR, CI, NEXT) and updates tasks.md (with Milestones).
  - Never writes code; only planning, coordination, and tasks/docs updates.

- Swarm (Implementors):
  - Takes exactly one Queen prompt, implements an atomic change, opens a PR.
  - Guarantees local quality gates (typecheck, lint, test, format) before PR.
  - Returns a concise status to Queen (STATUS, SUMMARY, PR, CI, NEXT).

### Queen Loop

1. Load context (recent tasks, milestones, CI state).
2. Propose PLAN (serial/parallel), create per‑package Swarm prompts.
3. Collect Swarm status; review DoD; request fixes if needed.
4. Update tasks.md (and docs) and propose the next batch.

### Swarm PR Policy

- 1 PR = 1 focused change (no umbrella PRs).
- Follow conventional commits (feat|fix|chore|docs(scope): …).
- Update docs (.md) and .env.example as needed.
- No secrets; no manual deploy; no changes outside scope.

### Quality Gates (for every PR)

- `pnpm typecheck`, `pnpm lint`, `pnpm test` locally green.
- `pnpm format` before commit.
- Tests include only what the PR touches (unit/integration/e2e where applicable).

### Deploy & Migrations

- CI (ci.yml) runs tests, coverage, smoke; Deploy (deploy.yml) runs only after CI success.
- Images are pushed to GHCR; Coolify is triggered via webhook.
- DB migrations run in the container entrypoint on startup in Coolify, not from GitHub runners.

## Environment & Safety

- Filesystem: workspace-write (only within repo).
- Network: restricted (no installs/downloads unless approved).
- Approvals: on-request.
- Assistant does not commit or push unless explicitly asked.

When assistant will request approval:

- Commands needing network (package installs, fetching images).
- Potentially destructive actions (e.g., `rm -rf`, resets).
- Writing outside workspace or running long external tools.

## Repository Conventions

- Apps: `apps/{api,web,admin,worker}`
- Packages: `packages/@{infra,domain,repos,shared,contracts}`
- Docs: `docs/`, root product docs: `prd-movie-mate.md`, `planning.md`, `tasks.md`
- Tests: colocated `__tests__` or `*.spec.ts` near `src`
- DB/Prisma: `packages/@infra/prisma`

## Tooling & Commands

- Test: `pnpm test` (Jest; passes with no tests allowed)
- Lint: `pnpm lint`
- Format: `pnpm format` / `pnpm format:check`
- Types: `pnpm typecheck`
- Prisma: `pnpm prisma:generate`, `pnpm prisma:migrate:dev`, `pnpm prisma:migrate:deploy`, `pnpm prisma:reset`, `pnpm prisma:seed`
- Search: `rg` (ripgrep) preferred for speed

## Working Loop

1. Load context

- Review `planning.md`, `tasks.md`, recent changes.
- Confirm target task and scope.

2. Propose plan

- Small step list with expected edits/tests.
- Call out risks and open questions.

3. Implement

- Use patch-based edits; keep diffs small and focused.
- Follow TS/NestJS conventions in CLAUDE.md and repo.
- Before committing any changes, run `pnpm format` and ensure a clean `pnpm lint`/`pnpm typecheck` state.

4. Validate

- Run targeted tests first, then broader ones if helpful.
- Run `lint` and `typecheck` if code surfaces TS/ES issues.

5. Summarize

- Describe what changed, where, and why.
- Note follow-ups or decisions needed.

6. Update tasks

- If agreed, reflect progress in `tasks.md` (with timestamps if desired).

## Definition of Done

- Code compiles (`pnpm typecheck`) and lints (`pnpm lint`).
- Tests added/updated and pass locally (`pnpm test`).
- Relevant docs updated (`README.md`, `docs/*`, or comments).
- No secrets; `.env.example` updated if new env vars.
- Changes align with PRD, planning, and conventions.
- Code formatted (`pnpm format`) before commit.

## Requesting Work (Examples)

- “Bootstrap NestJS API with `GET /health` and tests.”
- “Add Prisma model X with migration + seed + tests.”
- “Implement login with JWT + guards, document errors via error-codes.”
- “Set up CI workflow for lint/test/build.”

## Code Style & Structure

- TypeScript strict; avoid `any`.
- File naming: NestJS `*.controller.ts`, `*.service.ts`, `*.module.ts`, `*.dto.ts`, `*.entity.ts`.
- Tests: `*.spec.ts` or colocated `__tests__`.
- Logging: structured logs; prepare for correlation IDs (see planning).
- Error handling: map to `docs/error-codes.md`; include `traceId` where applicable.

## Typical Implementation Template

- For a new API endpoint:
  - Add module/controller/service.
  - Wire to main bootstrap (NestFactory) if needed.
  - Add DTOs with Zod or class-validator (per decisions).
  - Add unit tests for service + integration test with Supertest.
  - Document in Swagger and note possible `x-error-codes`.

- For DB changes:
  - Update `schema.prisma`; run generate/migrate (with approval if needed).
  - Add seeds if useful; update tests for CRUD and transactions.

## Collaboration Etiquette

- Keep iterations small; ask for confirmation on non-trivial design choices.
- Prefer explicit acceptance criteria before coding.
- Surface trade-offs succinctly; propose default, list alternatives.

## What the Assistant Won’t Do Automatically

- Commit/push, change branches, or tag releases.
- Install new packages or fetch remote resources without approval.
- Modify unrelated files just for cleanup.

## Next Suggested Steps (if you want the assistant to proceed)

- Initialize NestJS API scaffold in `apps/api` with a health endpoint and tests aligned to `tasks.md`.
- Or, finalize DB workflows: run `prisma:generate` and add minimal CRUD service tests in `@infra` consumers.

## Formatting & Commits

- Always run `pnpm format` before committing. When in doubt, also run `pnpm lint` and `pnpm typecheck` to avoid CI churn.

---

This guide is additive to CLAUDE.md and project docs. If preferences change (e.g., commit policy, test strategy), we can update this file to match.
