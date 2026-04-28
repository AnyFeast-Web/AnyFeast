import { Op, WhereOptions } from 'sequelize';

export interface CursorInput {
  cursor?: string;
  limit?: number;
}

export interface DecodedCursor {
  createdAt: string;
  id: string;
}

export function encodeCursor(c: DecodedCursor): string {
  return Buffer.from(JSON.stringify(c), 'utf8').toString('base64url');
}

export function decodeCursor(raw: string | undefined): DecodedCursor | null {
  if (!raw) return null;
  try {
    const json = Buffer.from(raw, 'base64url').toString('utf8');
    const parsed = JSON.parse(json);
    if (typeof parsed.createdAt === 'string' && typeof parsed.id === 'string') {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function cursorWhere<T extends { createdAt: string | Date; id: string }>(
  raw: string | undefined,
): WhereOptions<T> {
  const c = decodeCursor(raw);
  if (!c) return {} as WhereOptions<T>;
  return {
    [Op.or]: [
      { createdAt: { [Op.lt]: new Date(c.createdAt) } },
      {
        createdAt: new Date(c.createdAt),
        id: { [Op.lt]: c.id },
      },
    ],
  } as unknown as WhereOptions<T>;
}

export function clampLimit(n: number | undefined, max = 100, dflt = 25): number {
  if (!n || n < 1) return dflt;
  return Math.min(n, max);
}

export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
}

export function buildPage<T extends { createdAt: Date; id: string }>(
  rows: T[],
  limit: number,
): CursorPage<T> {
  if (rows.length <= limit) return { items: rows, nextCursor: null };
  const items = rows.slice(0, limit);
  const last = items[items.length - 1];
  return {
    items,
    nextCursor: encodeCursor({ createdAt: last.createdAt.toISOString(), id: last.id }),
  };
}
