# Nutritionist Backend — Node.js + Postgres Rewrite

**Status:** approved 2026-04-27
**Replaces:** FastAPI + Firestore backend at `/backend`
**New location:** `/backend-node`

## Goal

Replace the FastAPI + Firestore nutritionist backend with a Node.js + Postgres backend that matches the existing production Node stack (Express + sequelize-typescript + JWT + Sentry + Winston + SendGrid/MJML/Twilio/Supabase Storage), removes Firebase entirely, and fixes structural issues found during audit.

## Scope

**In scope**
- All seven existing routers: clients, mealplans, consultations, dashboard, ingredients, webhooks, messages
- New native auth (replaces Firebase Auth)
- Real email send (replaces mocked webhooks)
- Real Twilio SMS (replaces mock messages)
- Supabase Storage uploads (replaces Firebase Storage)
- Integration with existing Python AI services for meal-plan generation
- Frontend rework to drop Firebase SDK

**Out of scope**
- Flutter app changes
- Migration of existing Firestore data (greenfield — confirmed by user)

## Stack

| Concern | Choice |
|---|---|
| Runtime | Node 20 |
| Framework | Express 4 + TypeScript 5 |
| ORM | sequelize + sequelize-typescript |
| Validation | zod |
| Auth | JWT (access + refresh) + bcrypt |
| Email | SendGrid + MJML + Handlebars |
| SMS | Twilio |
| Storage | Supabase Storage |
| Jobs | BullMQ + Redis |
| Logging | Winston + pino-http request logs |
| Errors | Sentry |
| Tests | Vitest + Supertest + Testcontainers |
| Docs | OpenAPI from zod via zod-to-openapi |

## Database

Single Postgres instance (production), dedicated `nutritionist` schema. Tables:

- `users` — nutritionists + admins, password_hash, role, status
- `refresh_tokens` — hashed token, user_id, expires_at, revoked_at
- `clients` — nutritionist_id FK, soft-delete via deleted_at
- `client_measurements` — historical measurements per client
- `client_goals` — many-to-one to clients
- `tags`, `client_tags` — normalized tags
- `meal_plans` — client_id FK (no denormalized name), nutrition_targets jsonb
- `meal_plan_days`, `meal_plan_meals` — normalized 7-day grid
- `consultations` — payload jsonb (medical, lifestyle, nutrition, blood)
- `ingredients` — name, normalized_name, nutrition jsonb, **GIN tsvector + pg_trgm index**
- `messages` — client_id FK, direction enum, twilio_sid, read_at
- `audit_log` — actor_id, action, entity, entity_id, diff jsonb

## API surface

`/api/v1` prefix. JWT-protected except auth endpoints and webhooks.

| Group | Endpoints |
|---|---|
| /auth | register, login, refresh, logout, me, forgot-password, reset-password, change-password |
| /clients | list (paginated), create, get, update, soft-delete |
| /mealplans | CRUD, POST /:id/email, POST /generate (calls AI service) |
| /consultations | CRUD |
| /dashboard | /stats, /activity |
| /ingredients | list (server-side search), CRUD |
| /messages | list, send (Twilio), Twilio inbound webhook |
| /webhooks | /n8n/order-status (signature-verified) |
| /uploads | /sign-url (Supabase signed upload URL) |

## Auth design

- Access JWT 15m, refresh 30d (opaque, hashed in DB, rotate-on-use)
- bcrypt cost 12
- Email verification via SendGrid
- Roles: nutritionist | admin (middleware-enforced)
- Rate-limit auth endpoints

## Improvements baked in (vs FastAPI backend audit findings)

1. Env-allowlist CORS (replaces `allow_origins=["*"]`)
2. No mock-token bypass
3. Test coverage from day one (Vitest + Supertest + Testcontainers, CI gate)
4. Cursor pagination on every list endpoint
5. FK joins instead of denormalized client_name
6. tsvector + pg_trgm ingredient search instead of in-memory filter
7. Real email send for meal plans, real SMS via Twilio
8. Proper SQL aggregations for dashboard (no silent index-missing fallback)
9. audit_log table for compliance
10. Rate limiting on auth + write paths
11. zod request validation at route boundary
12. Auto-generated OpenAPI docs at /docs
13. Structured logging + Sentry with request IDs and user IDs
14. Versioned migrations checked into git

## Repo layout

```
backend-node/
├── src/
│   ├── index.ts, app.ts
│   ├── config/
│   ├── db/{sequelize.ts, migrations/}
│   ├── models/
│   ├── modules/{auth,clients,mealplans,consultations,dashboard,ingredients,messages,webhooks,uploads}/
│   ├── middleware/
│   ├── lib/{mailer,sms,ai-client,storage,queue}/
│   ├── jobs/
│   └── openapi/
├── tests/{unit,integration}/
├── docker-compose.yml
├── package.json, tsconfig.json, .env.example
```

## Phased rollout

1. **Foundation** — scaffold, config, Postgres connection, auth module, middleware, logging, Sentry, tests infra, CI
2. **Core CRUD** — clients, ingredients (with tsvector search), consultations
3. **Meal plans + Dashboard** — meal-plan CRUD, dashboard SQL, AI service client, real email send
4. **Messaging + Webhooks + Uploads** — Twilio send/receive, n8n webhooks, Supabase signed URLs
5. **Frontend swap** — drop Firebase SDK in React app, wire to JWT, refresh-token flow
6. **Cutover** — deploy alongside, smoke test, point production frontend, decommission FastAPI + Firestore

## Open items

- Confirm Postgres connection string and `nutritionist` schema creation permissions in production DB
- Confirm Sentry DSN, Twilio credentials, SendGrid API key are available
- Confirm Python AI service URL and contract for `/generate-meal-plan`
