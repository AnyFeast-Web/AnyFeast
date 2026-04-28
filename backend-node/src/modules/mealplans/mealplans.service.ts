import { Transaction, WhereOptions } from 'sequelize';
import { sequelize } from '@/db/sequelize';
import { MealPlan } from '@/models/MealPlan';
import { MealPlanDay } from '@/models/MealPlanDay';
import { MealPlanMeal } from '@/models/MealPlanMeal';
import { Client } from '@/models/Client';
import { User } from '@/models/User';
import { recordAudit } from '@/lib/audit';
import { aiClient } from '@/lib/aiClient';
import { enqueue } from '@/lib/queue';
import { badRequest, notFound } from '@/middleware/errors';
import { buildPage, clampLimit, cursorWhere } from '@/lib/pagination';
import {
  CreateMealPlanDto,
  GenerateMealPlanDto,
  ListMealPlansQuery,
  UpdateMealPlanDto,
} from './mealplans.dto';

interface AuditCtx {
  actorId: string;
  ip?: string | null;
  requestId?: string | null;
}

async function assertClientOwned(nutritionistId: string, clientId: string, tx?: Transaction) {
  const c = await Client.findOne({ where: { id: clientId, nutritionistId }, transaction: tx });
  if (!c) throw notFound('CLIENT_NOT_FOUND', 'Client not found');
  return c;
}

async function persistDays(
  planId: string,
  days: NonNullable<CreateMealPlanDto['days']>,
  tx: Transaction,
) {
  for (const day of days) {
    const created = await MealPlanDay.create(
      { mealPlanId: planId, dayIndex: day.dayIndex, date: day.date ?? null, notes: day.notes ?? null },
      { transaction: tx },
    );
    if (day.meals?.length) {
      await MealPlanMeal.bulkCreate(
        day.meals.map((m) => ({
          dayId: created.id,
          mealType: m.mealType,
          position: m.position,
          title: m.title,
          ingredients: m.ingredients,
          macros: m.macros,
          instructions: m.instructions ?? null,
        })),
        { transaction: tx },
      );
    }
  }
}

export const mealPlansService = {
  async list(nutritionistId: string, q: ListMealPlansQuery) {
    const limit = clampLimit(q.limit);
    const where: WhereOptions = { nutritionistId };
    if (q.status) (where as Record<string, unknown>).status = q.status;
    if (q.clientId) (where as Record<string, unknown>).clientId = q.clientId;
    Object.assign(where, cursorWhere(q.cursor));

    const rows = await MealPlan.findAll({
      where,
      include: [{ model: Client, as: 'client', attributes: ['id', 'firstName', 'lastName'] }],
      order: [
        ['createdAt', 'DESC'],
        ['id', 'DESC'],
      ],
      limit: limit + 1,
    });
    return buildPage(
      rows.map((r) => ({ ...r.toJSON(), createdAt: r.get('createdAt') as Date, id: r.id })),
      limit,
    );
  },

  async get(nutritionistId: string, id: string) {
    const plan = await MealPlan.findOne({
      where: { id, nutritionistId },
      include: [
        { model: Client, as: 'client', attributes: ['id', 'firstName', 'lastName', 'email'] },
        {
          model: MealPlanDay,
          as: 'days',
          include: [{ model: MealPlanMeal, as: 'meals' }],
        },
      ],
      order: [
        [{ model: MealPlanDay, as: 'days' }, 'dayIndex', 'ASC'],
        [{ model: MealPlanDay, as: 'days' }, { model: MealPlanMeal, as: 'meals' }, 'position', 'ASC'],
      ],
    });
    if (!plan) throw notFound('MEAL_PLAN_NOT_FOUND', 'Meal plan not found');
    return plan;
  },

  async create(nutritionistId: string, dto: CreateMealPlanDto, ctx: AuditCtx) {
    return sequelize.transaction(async (tx) => {
      await assertClientOwned(nutritionistId, dto.clientId, tx);
      const plan = await MealPlan.create(
        {
          nutritionistId,
          clientId: dto.clientId,
          title: dto.title,
          startDate: dto.startDate,
          endDate: dto.endDate,
          status: dto.status,
          nutritionTargets: dto.nutritionTargets,
          guidelines: dto.guidelines ?? null,
          groceryList: dto.groceryList,
        },
        { transaction: tx },
      );
      if (dto.days.length) await persistDays(plan.id, dto.days, tx);
      await recordAudit(
        {
          actorId: ctx.actorId,
          action: 'create',
          entity: 'meal_plan',
          entityId: plan.id,
          diff: { ...dto, days: `${dto.days.length} days` },
          ip: ctx.ip,
          requestId: ctx.requestId,
        },
        tx,
      );
      return plan;
    });
  },

  async update(nutritionistId: string, id: string, dto: UpdateMealPlanDto, ctx: AuditCtx) {
    return sequelize.transaction(async (tx) => {
      const plan = await MealPlan.findOne({ where: { id, nutritionistId }, transaction: tx });
      if (!plan) throw notFound('MEAL_PLAN_NOT_FOUND', 'Meal plan not found');
      const before = plan.toJSON();
      await plan.update(dto, { transaction: tx });

      if (dto.days) {
        // wholesale replace days+meals when provided
        await MealPlanDay.destroy({ where: { mealPlanId: id }, transaction: tx });
        await persistDays(id, dto.days, tx);
      }

      await recordAudit(
        {
          actorId: ctx.actorId,
          action: 'update',
          entity: 'meal_plan',
          entityId: id,
          diff: { before, after: { ...dto, days: dto.days ? `${dto.days.length} days` : undefined } },
          ip: ctx.ip,
          requestId: ctx.requestId,
        },
        tx,
      );
      return plan;
    });
  },

  async remove(nutritionistId: string, id: string, ctx: AuditCtx) {
    await sequelize.transaction(async (tx) => {
      const plan = await MealPlan.findOne({ where: { id, nutritionistId }, transaction: tx });
      if (!plan) throw notFound('MEAL_PLAN_NOT_FOUND', 'Meal plan not found');
      await plan.destroy({ transaction: tx });
      await recordAudit(
        {
          actorId: ctx.actorId,
          action: 'delete',
          entity: 'meal_plan',
          entityId: id,
          ip: ctx.ip,
          requestId: ctx.requestId,
        },
        tx,
      );
    });
  },

  async generate(nutritionistId: string, dto: GenerateMealPlanDto, ctx: AuditCtx) {
    await assertClientOwned(nutritionistId, dto.clientId);
    const generated = await aiClient.generateMealPlan(dto);
    return mealPlansService.create(
      nutritionistId,
      {
        clientId: dto.clientId,
        title: generated.title,
        startDate: generated.startDate,
        endDate: generated.endDate,
        status: 'draft',
        nutritionTargets: generated.nutritionTargets,
        guidelines: generated.guidelines,
        groceryList: generated.groceryList,
        days: generated.days.map((d) => ({
          dayIndex: d.dayIndex,
          date: d.date,
          meals: d.meals.map((m) => ({
            mealType: m.mealType,
            position: m.position,
            title: m.title,
            ingredients: m.ingredients,
            macros: m.macros,
            instructions: m.instructions,
          })),
        })),
      },
      ctx,
    );
  },

  async enqueueEmail(nutritionistId: string, id: string, overrideTo: string | undefined, ctx: AuditCtx) {
    const plan = await mealPlansService.get(nutritionistId, id);
    const client = plan.client;
    const nutritionist = await User.findByPk(nutritionistId);
    if (!nutritionist) throw notFound('USER_NOT_FOUND', 'User not found');

    const to = overrideTo ?? client?.email ?? null;
    if (!to) throw badRequest('NO_RECIPIENT', 'Client has no email and no override provided');

    const days = (plan.days ?? []).map((d) => ({
      dayIndex: d.dayIndex,
      date: d.date,
      meals: (d.meals ?? []).map((m) => ({ mealType: m.mealType, title: m.title })),
    }));

    const jobId = await enqueue('email', 'send-meal-plan', {
      mealPlanId: plan.id,
      to,
      data: {
        subject: `Your meal plan: ${plan.title}`,
        title: plan.title,
        clientName: client ? `${client.firstName} ${client.lastName}` : 'there',
        nutritionistName: nutritionist.name,
        startDate: plan.startDate,
        endDate: plan.endDate,
        guidelines: plan.guidelines ?? undefined,
        days,
      },
    });

    plan.sentAt = new Date();
    await plan.save();

    await recordAudit({
      actorId: ctx.actorId,
      action: 'email_enqueue',
      entity: 'meal_plan',
      entityId: plan.id,
      diff: { to, jobId },
      ip: ctx.ip,
      requestId: ctx.requestId,
    });

    return { jobId, to };
  },
};
