# anyfeast-nutritionist-backend

Node.js + Postgres backend for the AnyFeast nutritionist product. Replaces the FastAPI + Firestore backend at `/backend`.

See `docs/superpowers/specs/2026-04-27-nutritionist-backend-node-postgres-design.md` for the design and `AGENTS.md` for the working rules.

## Stack

Express 4, TypeScript 5, sequelize-typescript on Postgres, JWT auth, BullMQ + Redis, SendGrid + MJML, Twilio, Supabase Storage, Sentry, Winston, Vitest + Supertest + Testcontainers.

## Local development

```bash
cp .env.example .env
# fill in JWT_ACCESS_SECRET / JWT_REFRESH_SECRET (>=32 chars each)

docker compose up -d
npm install
npm run db:migrate
npm run dev
```

The server boots on `http://localhost:8000`. Health check: `GET /health`.

## Tests

```bash
npm test
```

Tests spin up an ephemeral Postgres via Testcontainers and run real migrations. Docker must be available locally and in CI.

## Migrations

```bash
npm run db:migrate          # apply
npm run db:migrate:undo     # roll back the latest
```

Migration files live in `src/db/migrations/`. Both `up` and `down` are required and should be idempotent.

## Layout

```
src/
  config/        env loading + zod validation
  db/            sequelize setup, migrations, scripts
  models/        sequelize-typescript models
  modules/<n>/   feature modules (dto, service, controller, routes)
  middleware/    request-id, auth, errors, validate, rate-limit
  lib/           logger, sentry, jwt, password, future mailer/sms/storage
  jobs/          bullmq processors (Phase 3+)
tests/
  helpers/       testcontainers + db utilities
  integration/   supertest specs
  unit/          pure-function tests
```

## Phase status

- [x] Phase 1 — Foundation + auth
- [x] Phase 2 — Clients, ingredients, consultations
- [x] Phase 3 — Meal plans, dashboard, AI client, real email
- [x] Phase 4 — Messaging, webhooks, uploads
- [x] Phase 5 — Frontend swap off Firebase
- [ ] Phase 6 — Cutover (runbook at `CUTOVER.md`)

> [Inference] All four backend phases compile cleanly with `tsc --noEmit`. Integration tests are written but have not yet been executed in this environment (Testcontainers requires a Docker daemon).
