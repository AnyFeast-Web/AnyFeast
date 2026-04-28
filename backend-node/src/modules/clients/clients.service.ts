import { Op, WhereOptions } from 'sequelize';
import { Client } from '@/models/Client';
import { ClientMeasurement } from '@/models/ClientMeasurement';
import { sequelize } from '@/db/sequelize';
import { recordAudit } from '@/lib/audit';
import { notFound } from '@/middleware/errors';
import { buildPage, clampLimit, cursorWhere } from '@/lib/pagination';
import {
  CreateClientDto,
  CreateMeasurementDto,
  ListClientsQuery,
  UpdateClientDto,
} from './clients.dto';

export interface AuditCtx {
  actorId: string;
  ip?: string | null;
  requestId?: string | null;
}

export const clientsService = {
  async list(nutritionistId: string, q: ListClientsQuery) {
    const limit = clampLimit(q.limit);
    const where: WhereOptions = { nutritionistId };
    if (q.status) (where as Record<string, unknown>).status = q.status;
    if (q.search) {
      Object.assign(where, {
        [Op.or]: [
          { firstName: { [Op.iLike]: `%${q.search}%` } },
          { lastName: { [Op.iLike]: `%${q.search}%` } },
          { email: { [Op.iLike]: `%${q.search}%` } },
        ],
      });
    }
    Object.assign(where, cursorWhere(q.cursor));

    const rows = await Client.findAll({
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

  async get(nutritionistId: string, id: string) {
    const client = await Client.findOne({
      where: { id, nutritionistId },
      include: [{ model: ClientMeasurement, as: 'measurements' }],
    });
    if (!client) throw notFound('CLIENT_NOT_FOUND', 'Client not found');
    return client;
  },

  async create(nutritionistId: string, dto: CreateClientDto, ctx: AuditCtx) {
    return sequelize.transaction(async (tx) => {
      const client = await Client.create(
        {
          nutritionistId,
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email ?? null,
          phone: dto.phone ?? null,
          dateOfBirth: dto.dateOfBirth ?? null,
          sex: dto.sex ?? null,
          notes: dto.notes ?? null,
          goals: dto.goals,
        },
        { transaction: tx },
      );
      await recordAudit(
        {
          actorId: ctx.actorId,
          action: 'create',
          entity: 'client',
          entityId: client.id,
          diff: dto,
          ip: ctx.ip,
          requestId: ctx.requestId,
        },
        tx,
      );
      return client;
    });
  },

  async update(nutritionistId: string, id: string, dto: UpdateClientDto, ctx: AuditCtx) {
    return sequelize.transaction(async (tx) => {
      const client = await Client.findOne({ where: { id, nutritionistId }, transaction: tx });
      if (!client) throw notFound('CLIENT_NOT_FOUND', 'Client not found');
      const before = client.toJSON();
      await client.update(dto, { transaction: tx });
      await recordAudit(
        {
          actorId: ctx.actorId,
          action: 'update',
          entity: 'client',
          entityId: client.id,
          diff: { before, after: dto },
          ip: ctx.ip,
          requestId: ctx.requestId,
        },
        tx,
      );
      return client;
    });
  },

  async softDelete(nutritionistId: string, id: string, ctx: AuditCtx) {
    await sequelize.transaction(async (tx) => {
      const client = await Client.findOne({ where: { id, nutritionistId }, transaction: tx });
      if (!client) throw notFound('CLIENT_NOT_FOUND', 'Client not found');
      await client.destroy({ transaction: tx });
      await recordAudit(
        {
          actorId: ctx.actorId,
          action: 'delete',
          entity: 'client',
          entityId: id,
          ip: ctx.ip,
          requestId: ctx.requestId,
        },
        tx,
      );
    });
  },

  async addMeasurement(
    nutritionistId: string,
    clientId: string,
    dto: CreateMeasurementDto,
    ctx: AuditCtx,
  ) {
    return sequelize.transaction(async (tx) => {
      const client = await Client.findOne({ where: { id: clientId, nutritionistId }, transaction: tx });
      if (!client) throw notFound('CLIENT_NOT_FOUND', 'Client not found');

      const measurement = await ClientMeasurement.create(
        {
          clientId,
          recordedAt: dto.recordedAt ? new Date(dto.recordedAt) : new Date(),
          heightCm: dto.heightCm?.toString() ?? null,
          weightKg: dto.weightKg?.toString() ?? null,
          bodyFatPct: dto.bodyFatPct?.toString() ?? null,
          waistCm: dto.waistCm?.toString() ?? null,
          hipCm: dto.hipCm?.toString() ?? null,
          notes: dto.notes ?? null,
        },
        { transaction: tx },
      );
      await recordAudit(
        {
          actorId: ctx.actorId,
          action: 'create',
          entity: 'client_measurement',
          entityId: measurement.id,
          diff: { clientId, ...dto },
          ip: ctx.ip,
          requestId: ctx.requestId,
        },
        tx,
      );
      return measurement;
    });
  },
};
