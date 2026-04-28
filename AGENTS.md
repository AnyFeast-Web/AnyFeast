# AGENTS.md — Working Rules for AI Agents in This Repo

This file applies to any AI agent (Claude Code, Codex, etc.) operating in this repository. Follow these rules in every response and every code change.

---

## Part 1 — AI Response Rules

### 1. Verification
- Do not present guesses or speculation as fact.
- If something cannot be confirmed, say: "I cannot verify this." or "I do not have access to that information."

### 2. Uncertainty Labels
All uncertain or generated content must be labeled:
- `[Inference]` — logically reasoned but not confirmed by source
- `[Speculation]` — possible but unconfirmed scenario
- `[Unverified]` — information without a reliable source

If any part of an answer is unverified, the entire output must be labeled.

### 3. Sources
- Only quote real, verifiable documents.
- No fabricated sources or references.
- When quoting, provide a direct source context (link or excerpt).

### 4. Inference Chaining
- Do not chain inferences — one inference cannot serve as proof for another.
- Each inference or speculation must be separately labeled.

### 5. Restricted Language
Do not use these terms unless directly quoting a source:
- "Prevent", "Guarantee", "Will never", "Fixes", "Eliminates", "Ensures that"

### 6. LLM Behaviour Claims
Any claim about AI behaviour must include `[Unverified]` or `[Inference]` and the disclaimer:
> "AI behaviour is not guaranteed and may vary."

### 7. Error Correction
If any rule above is broken, immediately respond:
> Correction: I made an unverified claim. That was incorrect.

---

## Part 2 — Code Rules

These apply to all code changes in this repo. Where they conflict with personal preference, the rule wins.

### A. Language and types
- TypeScript strict mode is required. `noImplicitAny`, `strictNullChecks`, `noUnusedLocals`, `noUnusedParameters` stay on.
- No `any` without an inline `// reason: ...` comment naming the constraint that forces it.
- DB columns use `snake_case`. TypeScript code uses `camelCase`. Sequelize `underscored: true` handles the boundary.

### B. Validation and input handling
- All HTTP request bodies, query strings, and params pass through a `zod` schema at the route boundary via the `validate()` middleware.
- No reading `process.env.X` outside `src/config/index.ts`. Add the variable to the zod env schema or it does not exist.
- Errors thrown from controllers/services must be either `HttpError` (from `middleware/errors.ts`) or a `ZodError`. Do not throw raw strings or untyped objects.

### C. Error responses
- Single response shape: `{ error: { code: string, message: string, details?: unknown } }`.
- Status codes: 400 validation, 401 missing/invalid auth, 403 role denied, 404 not found, 409 conflict, 500 unhandled.
- Never swallow errors silently. If a catch block returns a default, it must `logger.warn(...)` with context.

### D. Database and migrations
- Every schema change ships as a numbered migration in `src/db/migrations/` with both `up` and `down`.
- Migrations are idempotent (`CREATE ... IF NOT EXISTS`, `DROP ... IF EXISTS`).
- No raw SQL in route handlers. Either go through a Sequelize model or a function in the module's `*.service.ts`.
- All list endpoints must paginate (cursor on `(created_at, id)` by default). No unbounded `findAll` reaching HTTP.
- No denormalized snapshots of mutable parent fields (e.g., do not copy `client.name` into `meal_plans`). Join instead.

### E. Auth and authorization
- All non-`/auth`, non-`/webhooks` routes go through `requireAuth`.
- Role-restricted routes additionally use `requireRole(...)`.
- Tenant scoping (`nutritionist_id = req.user.sub`) is applied in the service layer for every read and write that touches user-owned data. The route layer does not assume the service did it; the service does it.

### F. Auditing
- Every mutating endpoint (create, update, delete) writes one row to `audit_log` (actor_id, action, entity, entity_id, diff). Failure to write the audit row fails the request.

### G. Logging and observability
- No `console.log`, `console.error`, etc. in `src/`. Use `logger` from `@/lib/logger`.
- Every request gets a `req.id` (set by `requestId` middleware). Logs and Sentry events include it.
- Sensitive fields (`password`, `password_hash`, `token`, `tokenHash`, `Authorization` header) must never appear in logs.

### H. Tests
- Every new endpoint ships with at least one Supertest integration test against a Testcontainers Postgres.
- No mocking the database. Real Postgres in tests, full stop.
- Unit tests for pure functions live in `tests/unit/`. Integration tests in `tests/integration/`.
- A test that depends on time uses an injected clock or `vi.useFakeTimers()`. No `Date.now()` in assertions.

### I. Background work
- Long-running or external-service work (email send, SMS send, AI calls > 5s) goes through a BullMQ queue. The HTTP handler enqueues and returns; the worker performs the side effect.

### J. Secrets and config
- Secrets only enter the process via env. No secrets in code, fixtures, or migrations.
- `.env` is gitignored. `.env.example` is the contract; keep it current.

### K. Module structure
Each feature module under `src/modules/<name>/` contains:
- `<name>.dto.ts` — zod schemas + inferred types
- `<name>.service.ts` — business logic, talks to models
- `<name>.controller.ts` — thin Express handlers, no business logic
- `<name>.routes.ts` — router wiring with middleware order

### L. No Firebase
- No imports from `firebase`, `firebase-admin`, `@firebase/*`. Auth is JWT only. Storage is Supabase. The dependency must not appear in `package.json`.

### M. PR / commit hygiene
- One concern per commit. A migration commit and the code that uses it can be the same commit.
- Commit messages follow the style of recent commits in the repo (look at `git log --oneline -20` before writing one).
- Do not skip git hooks (`--no-verify`).

---

## Part 3 — Process Rules

### N. Phased work
- Phase boundaries (Phase 1–6 in `docs/superpowers/specs/2026-04-27-nutritionist-backend-node-postgres-design.md`) are real. Do not start Phase N+1 work in a Phase N commit.

### O. Spec drift
- If implementation diverges from the design doc, update the design doc in the same change set. The doc is the contract, not aspirational.

### P. Self-correction
- When a rule from Part 1 (AI Response Rules) is broken, post the correction line from rule 7 immediately, then continue.
