import { Sequelize } from 'sequelize-typescript';
import { config } from '@/config';
import { logger } from '@/lib/logger';
import { User } from '@/models/User';
import { RefreshToken } from '@/models/RefreshToken';
import { Client } from '@/models/Client';
import { ClientMeasurement } from '@/models/ClientMeasurement';
import { Tag } from '@/models/Tag';
import { ClientTag } from '@/models/ClientTag';
import { Ingredient } from '@/models/Ingredient';
import { Consultation } from '@/models/Consultation';
import { AuditLog } from '@/models/AuditLog';
import { MealPlan } from '@/models/MealPlan';
import { MealPlanDay } from '@/models/MealPlanDay';
import { MealPlanMeal } from '@/models/MealPlanMeal';
import { Message } from '@/models/Message';

export const sequelize = new Sequelize(config.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: config.DB_SSL ? { ssl: { require: true, rejectUnauthorized: false } } : undefined,
  logging: config.isProd ? false : (msg) => logger.debug(msg),
  models: [
    User,
    RefreshToken,
    Client,
    ClientMeasurement,
    Tag,
    ClientTag,
    Ingredient,
    Consultation,
    AuditLog,
    MealPlan,
    MealPlanDay,
    MealPlanMeal,
    Message,
  ],
  define: {
    underscored: true,
    schema: config.DB_SCHEMA,
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30_000,
    idle: 10_000,
  },
});

export async function connectDb(): Promise<void> {
  await sequelize.authenticate();
  logger.info('postgres connected', { schema: config.DB_SCHEMA });
}
