import { WhereOptions } from 'sequelize';
import { sequelize } from '@/db/sequelize';
import { Consultation } from '@/models/Consultation';
import { Client } from '@/models/Client';
import { recordAudit } from '@/lib/audit';
import { notFound } from '@/middleware/errors';
import { buildPage, clampLimit, cursorWhere } from '@/lib/pagination';
import {
  CreateConsultationDto,
  ListConsultationsQuery,
  UpdateConsultationDto,
} from './consultations.dto';

interface AuditCtx {
  actorId: string;
  ip?: string | null;
  requestId?: string | null;
}

async function assertClientOwned(nutritionistId: string, clientId: string) {
  const c = await Client.findOne({ where: { id: clientId, nutritionistId } });
  if (!c) throw notFound('CLIENT_NOT_FOUND', 'Client not found');
}

export const consultationsService = {
  async list(nutritionistId: string, q: ListConsultationsQuery) {
    const limit = clampLimit(q.limit);
    const where: WhereOptions = { nutritionistId };
    if (q.status) (where as Record<string, unknown>).status = q.status;
    if (q.clientId) (where as Record<string, unknown>).clientId = q.clientId;
    Object.assign(where, cursorWhere(q.cursor));

    const rows = await Consultation.findAll({
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
    const c = await Consultation.findOne({ where: { id, nutritionistId } });
    if (!c) throw notFound('CONSULTATION_NOT_FOUND', 'Consultation not found');
    return c;
  },

  async create(nutritionistId: string, dto: CreateConsultationDto, ctx: AuditCtx) {
    await assertClientOwned(nutritionistId, dto.clientId);

    return sequelize.transaction(async (tx) => {
      const c = await Consultation.create(
        {
          clientId: dto.clientId,
          nutritionistId,
          consultationDate: dto.consultationDate,
          status: dto.status,
          medicalHistory: dto.medicalHistory,
          lifestyle: dto.lifestyle,
          nutritionHistory: dto.nutritionHistory,
          bloodReport: dto.bloodReport,
          goals: dto.goals,
          notes: dto.notes ?? null,
          consentSignedAt: dto.consentSignedAt ? new Date(dto.consentSignedAt) : null,
          consentIp: ctx.ip ?? null,
        },
        { transaction: tx },
      );
      await recordAudit(
        {
          actorId: ctx.actorId,
          action: 'create',
          entity: 'consultation',
          entityId: c.id,
          diff: dto,
          ip: ctx.ip,
          requestId: ctx.requestId,
        },
        tx,
      );
      return c;
    });
  },

  async update(
    nutritionistId: string,
    id: string,
    dto: UpdateConsultationDto,
    ctx: AuditCtx,
  ) {
    return sequelize.transaction(async (tx) => {
      const c = await Consultation.findOne({ where: { id, nutritionistId }, transaction: tx });
      if (!c) throw notFound('CONSULTATION_NOT_FOUND', 'Consultation not found');
      const before = c.toJSON();
      await c.update(
        {
          ...dto,
          consentSignedAt: dto.consentSignedAt ? new Date(dto.consentSignedAt) : c.consentSignedAt,
        },
        { transaction: tx },
      );
      await recordAudit(
        {
          actorId: ctx.actorId,
          action: 'update',
          entity: 'consultation',
          entityId: id,
          diff: { before, after: dto },
          ip: ctx.ip,
          requestId: ctx.requestId,
        },
        tx,
      );
      return c;
    });
  },

  async remove(nutritionistId: string, id: string, ctx: AuditCtx) {
    await sequelize.transaction(async (tx) => {
      const c = await Consultation.findOne({ where: { id, nutritionistId }, transaction: tx });
      if (!c) throw notFound('CONSULTATION_NOT_FOUND', 'Consultation not found');
      await c.destroy({ transaction: tx });
      await recordAudit(
        {
          actorId: ctx.actorId,
          action: 'delete',
          entity: 'consultation',
          entityId: id,
          ip: ctx.ip,
          requestId: ctx.requestId,
        },
        tx,
      );
    });
  },
};
