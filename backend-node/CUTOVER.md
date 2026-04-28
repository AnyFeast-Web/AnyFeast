# Cutover Runbook — FastAPI/Firestore → Node/Postgres

This is the Phase 6 runbook. It assumes Phases 1–5 have been merged.

## Prerequisites

- [ ] Production Postgres reachable from the deploy target. Confirm `DATABASE_URL` is set in the secret store.
- [ ] Production Redis reachable. Confirm `REDIS_URL`.
- [ ] SendGrid API key, sender identity verified.
- [ ] Twilio Account SID, Auth Token, From Number, Webhook Secret.
- [ ] Supabase Service Role Key + bucket `anyfeast-nutritionist` created.
- [ ] Sentry DSN.
- [ ] Python AI service URL reachable from the new backend (network/firewall).
- [ ] CI green on `backend-node` branch.

## Step 1 — Provision schema in production Postgres

```bash
# from a machine that can reach the prod DB
DATABASE_URL=postgres://... DB_SCHEMA=nutritionist npm run db:migrate
```

Validate:
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'nutritionist';
```
Expect: users, refresh_tokens, clients, client_measurements, tags, client_tags,
ingredients, consultations, audit_log, meal_plans, meal_plan_days, meal_plan_meals, messages.

## Step 2 — Deploy backend-node to staging

- Push the new service to your hosting target (Render/Railway/Fly/etc.) using `npm run build && npm start`.
- Set all env vars from `.env.example`. Generate fresh `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` (>=32 chars random).
- `CORS_ORIGINS` should include the staging frontend URL only.

Smoke checks against the staging API:
- `GET /health` → 200
- `POST /api/v1/auth/register` with a throwaway email → 201
- `POST /api/v1/auth/login` → returns access + refresh tokens
- `GET /api/v1/auth/me` with the access token → 200

## Step 3 — Configure Twilio + n8n inbound webhooks

- Twilio inbound SMS → `https://<staging-host>/api/v1/webhooks/twilio/sms`
- n8n order-status → `https://<staging-host>/api/v1/webhooks/n8n/order-status` with `X-N8N-Signature` HMAC

## Step 4 — Point staging frontend at staging API

In the frontend deploy environment:
- `VITE_API_BASE_URL=https://<staging-host>` (no trailing `/api/v1`; the client appends it)
- Remove `VITE_FIREBASE_*` env vars.

Smoke test the staging frontend:
- [ ] Login with a freshly-registered nutritionist
- [ ] List/create a client, add a measurement
- [ ] Create a consultation
- [ ] Create a meal plan; trigger `/mealplans/:id/email` and verify the SendGrid event log
- [ ] Send an outbound SMS; verify Twilio log
- [ ] Inbound SMS test (text the Twilio number); verify the message lands in `messages`
- [ ] Dashboard `/stats` and `/activity` populate
- [ ] Trigger a 401 (clear access token in localStorage) and verify the refresh interceptor recovers

## Step 5 — Production cutover

1. Take a Postgres backup snapshot.
2. Run migrations against production (Step 1 against the prod URL).
3. Deploy backend-node to production.
4. Update production frontend `VITE_API_BASE_URL` to point at the production backend-node URL.
5. Trigger a frontend redeploy.
6. Watch Sentry + Winston for 30 minutes. Pre-defined alerts to watch:
   - 5xx rate > 1%
   - p95 latency > 500ms
   - Auth failures spike

## Step 6 — Decommission

- [ ] Confirm zero traffic on the FastAPI service for 24h via host metrics.
- [ ] Stop the FastAPI service.
- [ ] Archive `/backend` directory to `archive/backend-fastapi-2026-04` and remove from CI.
- [ ] Disable Firebase project (or delete) once retention period has elapsed.
- [ ] Update `AGENTS.md` rule L: confirm no Firebase imports remain anywhere.

## Rollback plan

If post-cutover errors exceed thresholds within the first 60 minutes:
1. Repoint frontend `VITE_API_BASE_URL` back to the FastAPI host.
2. Trigger frontend redeploy.
3. Investigate Sentry events offline.
4. Postgres state changes from the brief Node-traffic window are kept (no rollback of the DB needed in greenfield).

> [Inference] Greenfield means no data needs migrating, so a rollback only requires repointing the frontend; no schema reverse-migration is required to restore the previous state.
