import { Transaction } from 'sequelize';
import { AuditLog } from '@/models/AuditLog';

export interface AuditEntry {
  actorId: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  diff?: unknown;
  ip?: string | null;
  requestId?: string | null;
}

export async function recordAudit(entry: AuditEntry, tx?: Transaction): Promise<void> {
  await AuditLog.create(
    {
      actorId: entry.actorId,
      action: entry.action,
      entity: entry.entity,
      entityId: entry.entityId ?? null,
      diff: entry.diff ?? null,
      ip: entry.ip ?? null,
      requestId: entry.requestId ?? null,
    },
    { transaction: tx },
  );
}
