import { NextFunction, Request, Response } from 'express';
import { unauthorized, forbidden } from './errors';
import { AccessTokenPayload, verifyAccessToken } from '@/lib/jwt';
import { UserRole } from '@/models/User';

declare module 'express-serve-static-core' {
  interface Request {
    user?: AccessTokenPayload;
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.header('authorization');
  if (!header || !header.startsWith('Bearer ')) {
    return next(unauthorized('NO_TOKEN', 'Missing Bearer token'));
  }
  const token = header.slice('Bearer '.length).trim();
  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(unauthorized('INVALID_TOKEN', 'Invalid or expired token'));
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(unauthorized());
    if (!roles.includes(req.user.role)) return next(forbidden('ROLE_REQUIRED', 'Insufficient role'));
    next();
  };
}
