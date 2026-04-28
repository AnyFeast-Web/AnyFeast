import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '@/config';
import { UserRole } from '@/models/User';

export interface AccessTokenPayload {
  sub: string;
  role: UserRole;
  email: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  const opts: SignOptions = { expiresIn: config.JWT_ACCESS_TTL as SignOptions['expiresIn'] };
  return jwt.sign(payload, config.JWT_ACCESS_SECRET, opts);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, config.JWT_ACCESS_SECRET) as AccessTokenPayload;
}
