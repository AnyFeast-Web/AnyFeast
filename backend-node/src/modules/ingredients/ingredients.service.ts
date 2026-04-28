import { QueryTypes, Op, WhereOptions } from 'sequelize';
import { sequelize } from '@/db/sequelize';
import { Ingredient, normalize } from '@/models/Ingredient';
import { recordAudit } from '@/lib/audit';
import { conflict, notFound } from '@/middleware/errors';
import { buildPage, clampLimit, cursorWhere } from '@/lib/pagination';
import {
  CreateIngredientDto,
  ListIngredientsQuery,
  UpdateIngredientDto,
} from './ingredients.dto';

interface AuditCtx {
  actorId: string;
  ip?: string | null;
  requestId?: string | null;
}

export const ingredientsService = {
  async list(q: ListIngredientsQuery) {
    const limit = clampLimit(q.limit);

    if (q.search) {
      // Full-text + trigram fallback. Ranks by ts_rank then trigram similarity.
      const rows = await sequelize.query<{
        id: string;
        name: string;
        normalized_name: string;
        category: string | null;
        unit: string;
        nutrition: Record<string, unknown>;
        aliases: string[];
        created_by: string | null;
        created_at: Date;
        updated_at: Date;
        rank: number;
      }>(
        `SELECT i.*,
                ts_rank(search_vector, plainto_tsquery('simple', :q))
                  + similarity(normalized_name, :nq) AS rank
         FROM "${sequelize.options.define?.schema}"."ingredients" i
         WHERE search_vector @@ plainto_tsquery('simple', :q)
            OR normalized_name % :nq
            ${q.category ? 'AND category = :category' : ''}
         ORDER BY rank DESC, i.created_at DESC, i.id DESC
         LIMIT :limit`,
        {
          replacements: {
            q: q.search,
            nq: normalize(q.search),
            category: q.category,
            limit: limit + 1,
          },
          type: QueryTypes.SELECT,
        },
      );
      const items = rows.slice(0, limit).map((r) => ({
        id: r.id,
        name: r.name,
        normalizedName: r.normalized_name,
        category: r.category,
        unit: r.unit,
        nutrition: r.nutrition,
        aliases: r.aliases,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));
      // search results don't paginate by cursor; nextCursor null
      return { items, nextCursor: null as string | null };
    }

    const where: WhereOptions = {};
    if (q.category) (where as Record<string, unknown>).category = q.category;
    Object.assign(where, cursorWhere(q.cursor));

    const rows = await Ingredient.findAll({
      where,
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

  async create(actorId: string, dto: CreateIngredientDto, ctx: AuditCtx) {
    const normalizedName = normalize(dto.name);
    const existing = await Ingredient.findOne({ where: { normalizedName } });
    if (existing) throw conflict('INGREDIENT_EXISTS', 'Ingredient already exists');

    return sequelize.transaction(async (tx) => {
      const ing = await Ingredient.create(
        {
          name: dto.name.trim(),
          normalizedName,
          category: dto.category ?? null,
          unit: dto.unit,
          nutrition: dto.nutrition,
          aliases: dto.aliases.map((a) => a.trim()).filter(Boolean),
          createdBy: actorId,
        },
        { transaction: tx },
      );
      await recordAudit(
        {
          actorId,
          action: 'create',
          entity: 'ingredient',
          entityId: ing.id,
          diff: dto,
          ip: ctx.ip,
          requestId: ctx.requestId,
        },
        tx,
      );
      return ing;
    });
  },

  async update(actorId: string, id: string, dto: UpdateIngredientDto, ctx: AuditCtx) {
    return sequelize.transaction(async (tx) => {
      const ing = await Ingredient.findByPk(id, { transaction: tx });
      if (!ing) throw notFound('INGREDIENT_NOT_FOUND', 'Ingredient not found');
      const before = ing.toJSON();
      if (dto.name) {
        ing.name = dto.name.trim();
        ing.normalizedName = normalize(dto.name);
      }
      if (dto.category !== undefined) ing.category = dto.category ?? null;
      if (dto.unit) ing.unit = dto.unit;
      if (dto.nutrition) ing.nutrition = dto.nutrition;
      if (dto.aliases) ing.aliases = dto.aliases.map((a) => a.trim()).filter(Boolean);
      await ing.save({ transaction: tx });
      await recordAudit(
        {
          actorId,
          action: 'update',
          entity: 'ingredient',
          entityId: id,
          diff: { before, after: dto },
          ip: ctx.ip,
          requestId: ctx.requestId,
        },
        tx,
      );
      return ing;
    });
  },

  async remove(actorId: string, id: string, ctx: AuditCtx) {
    await sequelize.transaction(async (tx) => {
      const n = await Ingredient.destroy({ where: { id }, transaction: tx });
      if (n === 0) throw notFound('INGREDIENT_NOT_FOUND', 'Ingredient not found');
      await recordAudit(
        {
          actorId,
          action: 'delete',
          entity: 'ingredient',
          entityId: id,
          ip: ctx.ip,
          requestId: ctx.requestId,
        },
        tx,
      );
    });
  },

  async get(id: string) {
    const ing = await Ingredient.findByPk(id);
    if (!ing) throw notFound('INGREDIENT_NOT_FOUND', 'Ingredient not found');
    return ing;
  },

  // Op kept exported for tests that want to assert clauses.
  _opSentinel: Op.or,
};
