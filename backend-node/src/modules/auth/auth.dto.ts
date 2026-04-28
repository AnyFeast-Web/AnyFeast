import { z } from 'zod';

export const registerDto = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(120),
});
export type RegisterDto = z.infer<typeof registerDto>;

export const loginDto = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1).max(128),
});
export type LoginDto = z.infer<typeof loginDto>;

export const refreshDto = z.object({
  refreshToken: z.string().min(20),
});
export type RefreshDto = z.infer<typeof refreshDto>;

export const forgotPasswordDto = z.object({
  email: z.string().email().toLowerCase(),
});

export const resetPasswordDto = z.object({
  token: z.string().min(20),
  password: z.string().min(8).max(128),
});

export const changePasswordDto = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});
