import { sequelize } from '@/db/sequelize';

export async function truncateAll(): Promise<void> {
  await sequelize.query(`TRUNCATE TABLE
    "nutritionist"."messages",
    "nutritionist"."meal_plan_meals",
    "nutritionist"."meal_plan_days",
    "nutritionist"."meal_plans",
    "nutritionist"."audit_log",
    "nutritionist"."consultations",
    "nutritionist"."client_tags",
    "nutritionist"."tags",
    "nutritionist"."client_measurements",
    "nutritionist"."clients",
    "nutritionist"."ingredients",
    "nutritionist"."refresh_tokens",
    "nutritionist"."users"
    RESTART IDENTITY CASCADE;`);
}
