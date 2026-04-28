import { Op, WhereOptions } from 'sequelize';
import { sequelize } from '@/db/sequelize';
import { Client } from '@/models/Client';
import { Message } from '@/models/Message';
import { recordAudit } from '@/lib/audit';
import { enqueue } from '@/lib/queue';
import { badRequest, notFound } from '@/middleware/errors';
import { buildPage, clampLimit, cursorWhere } from '@/lib/pagination';
import { ListMessagesQuery, MarkReadDto, SendMessageDto } from './messages.dto';

interface AuditCtx {
  actorId: string;
  ip?: string | null;
  requestId?: string | null;
}

export const messagesService = {
  async list(nutritionistId: string, q: ListMessagesQuery) {
    const limit = clampLimit(q.limit);
    const where: WhereOptions = { nutritionistId };
    if (q.clientId) (where as Record<string, unknown>).clientId = q.clientId;
    Object.assign(where, cursorWhere(q.cursor));

    const rows = await Message.findAll({
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

  async send(nutritionistId: string, dto: SendMessageDto, ctx: AuditCtx) {
    const client = await Client.findOne({ where: { id: dto.clientId, nutritionistId } });
    if (!client) throw notFound('CLIENT_NOT_FOUND', 'Client not found');
    const to = dto.to ?? client.phone;
    if (!to) throw badRequest('NO_RECIPIENT', 'Client has no phone number and no override provided');

    return sequelize.transaction(async (tx) => {
      const message = await Message.create(
        {
          nutritionistId,
          clientId: client.id,
          direction: 'outbound',
          toNumber: to,
          body: dto.body,
          status: 'queued',
        },
        { transaction: tx },
      );
      await recordAudit(
        {
          actorId: ctx.actorId,
          action: 'create',
          entity: 'message',
          entityId: message.id,
          diff: { clientId: client.id, to, body_len: dto.body.length },
          ip: ctx.ip,
          requestId: ctx.requestId,
        },
        tx,
      );
      // Enqueue after commit returns the message id; queueing inside the tx is fine
      // because BullMQ uses a different connection (Redis) and won't see the row anyway.
      // The worker re-fetches by id, so we delay enqueue until after the transaction.
      return message;
    }).then(async (message) => {
      await enqueue('sms', 'send', { messageId: message.id });
      return message;
    });
  },

  async markRead(nutritionistId: string, dto: MarkReadDto) {
    const [count] = await Message.update(
      { readAt: new Date() },
      {
        where: {
          nutritionistId,
          id: { [Op.in]: dto.ids },
          readAt: null,
        } as WhereOptions,
      },
    );
    return { updated: count };
  },

  async recordInbound(input: {
    fromNumber: string;
    toNumber: string;
    body: string;
    twilioSid: string;
  }) {
    const client = await Client.findOne({ where: { phone: input.fromNumber } });
    if (!client) {
      // record orphan inbound on a system "unknown" attribution? for now, drop.
      return null;
    }
    const message = await Message.create({
      nutritionistId: client.nutritionistId,
      clientId: client.id,
      direction: 'inbound',
      fromNumber: input.fromNumber,
      toNumber: input.toNumber,
      body: input.body,
      twilioSid: input.twilioSid,
      status: 'received',
    });
    return message;
  },
};
