import { z } from 'zod';

export const signUrlDto = z.object({
  filename: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[A-Za-z0-9._-]+$/, 'Filename must be alphanumeric with . _ -'),
  contentType: z.string().min(1).max(120).optional(),
  scope: z.enum(['client_attachment', 'avatar', 'consultation']).default('client_attachment'),
  clientId: z.string().uuid().optional(),
});
export type SignUrlDto = z.infer<typeof signUrlDto>;
