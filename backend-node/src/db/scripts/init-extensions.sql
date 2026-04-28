-- Run on first Postgres container start. Idempotent.
-- gen_random_uuid() is built into PG 13+, so no pgcrypto/uuid-ossp needed.
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

CREATE SCHEMA IF NOT EXISTS nutritionist;
