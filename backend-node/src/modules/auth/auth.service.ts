import crypto from 'crypto';
import { Op } from 'sequelize';
import { config } from '@/config';
import { User, UserRole } from '@/models/User';
import { RefreshToken } from '@/models/RefreshToken';
import { hashPassword, verifyPassword } from '@/lib/password';
import { signAccessToken } from '@/lib/jwt';
import { conflict, notFound, unauthorized, badRequest } from '@/middleware/errors';
import { logger } from '@/lib/logger';

const REFRESH_BYTES = 48;

function parseTtl(spec: string): number {
  const m = /^(\d+)([smhd])$/.exec(spec);
  if (!m) throw new Error(`invalid ttl: ${spec}`);
  const n = Number(m[1]);
  const unit = m[2];
  const mult = unit === 's' ? 1_000 : unit === 'm' ? 60_000 : unit === 'h' ? 3_600_000 : 86_400_000;
  return n * mult;
}

function newRefreshToken(): { raw: string; hash: string; expiresAt: Date } {
  const raw = crypto.randomBytes(REFRESH_BYTES).toString('base64url');
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  const ttl = parseTtl(config.JWT_REFRESH_TTL);
  return { raw, hash, expiresAt: new Date(Date.now() + ttl) };
}

function hashOf(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export interface AuthContext {
  ip?: string | null;
  userAgent?: string | null;
}

export const authService = {
  async register(input: { email: string; password: string; name: string }, _ctx: AuthContext) {
    const existing = await User.findOne({ where: { email: input.email } });
    if (existing) throw conflict('EMAIL_TAKEN', 'Email already registered');

    const passwordHash = await hashPassword(input.password);
    const verificationToken = crypto.randomBytes(32).toString('base64url');

    const user = await User.create({
      email: input.email,
      passwordHash,
      name: input.name,
      role: 'nutritionist' as UserRole,
      status: 'pending',
      emailVerificationToken: verificationToken,
    });

    logger.info('user registered', { userId: user.id });
    return { user: user.toSafeJSON(), verificationToken };
  },

  async login(input: { email: string; password: string }, ctx: AuthContext) {
    const user = await User.findOne({ where: { email: input.email } });
    if (!user) throw unauthorized('INVALID_CREDENTIALS', 'Invalid email or password');
    if (user.status === 'disabled') throw unauthorized('ACCOUNT_DISABLED', 'Account disabled');

    const ok = await verifyPassword(input.password, user.passwordHash);
    if (!ok) throw unauthorized('INVALID_CREDENTIALS', 'Invalid email or password');

    const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email });
    const next = newRefreshToken();
    await RefreshToken.create({
      userId: user.id,
      tokenHash: next.hash,
      expiresAt: next.expiresAt,
      ip: ctx.ip ?? null,
      userAgent: ctx.userAgent ?? null,
    });

    return { accessToken, refreshToken: next.raw, user: user.toSafeJSON() };
  },

  async refresh(input: { refreshToken: string }, ctx: AuthContext) {
    const tokenHash = hashOf(input.refreshToken);
    const stored = await RefreshToken.findOne({
      where: { tokenHash, revokedAt: null, expiresAt: { [Op.gt]: new Date() } },
    });
    if (!stored) throw unauthorized('INVALID_REFRESH', 'Invalid or expired refresh token');

    const user = await User.findByPk(stored.userId);
    if (!user || user.status === 'disabled') {
      throw unauthorized('ACCOUNT_DISABLED', 'Account unavailable');
    }

    const next = newRefreshToken();
    const replacement = await RefreshToken.create({
      userId: user.id,
      tokenHash: next.hash,
      expiresAt: next.expiresAt,
      ip: ctx.ip ?? null,
      userAgent: ctx.userAgent ?? null,
    });
    stored.revokedAt = new Date();
    stored.replacedById = replacement.id;
    await stored.save();

    const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email });
    return { accessToken, refreshToken: next.raw };
  },

  async logout(input: { refreshToken: string }) {
    const tokenHash = hashOf(input.refreshToken);
    const stored = await RefreshToken.findOne({ where: { tokenHash } });
    if (stored && !stored.revokedAt) {
      stored.revokedAt = new Date();
      await stored.save();
    }
  },

  async me(userId: string) {
    const user = await User.findByPk(userId);
    if (!user) throw notFound('USER_NOT_FOUND', 'User not found');
    return user.toSafeJSON();
  },

  async changePassword(userId: string, input: { currentPassword: string; newPassword: string }) {
    const user = await User.findByPk(userId);
    if (!user) throw notFound('USER_NOT_FOUND', 'User not found');
    const ok = await verifyPassword(input.currentPassword, user.passwordHash);
    if (!ok) throw badRequest('INVALID_CREDENTIALS', 'Current password is incorrect');
    user.passwordHash = await hashPassword(input.newPassword);
    await user.save();
    await RefreshToken.update(
      { revokedAt: new Date() },
      { where: { userId, revokedAt: null } },
    );
  },

  async forgotPassword(email: string) {
    const user = await User.findOne({ where: { email } });
    if (!user) return undefined;
    const token = crypto.randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    user.passwordResetToken = hashOf(token);
    user.passwordResetExpiresAt = expiresAt;
    await user.save();
    return token;
  },

  async resetPassword(input: { token: string; password: string }) {
    const user = await User.findOne({
      where: {
        passwordResetToken: hashOf(input.token),
        passwordResetExpiresAt: { [Op.gt]: new Date() },
      },
    });
    if (!user) throw badRequest('INVALID_RESET_TOKEN', 'Invalid or expired reset token');
    user.passwordHash = await hashPassword(input.password);
    user.passwordResetToken = null;
    user.passwordResetExpiresAt = null;
    await user.save();
    await RefreshToken.update(
      { revokedAt: new Date() },
      { where: { userId: user.id, revokedAt: null } },
    );
  },
};
