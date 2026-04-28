import { z } from 'zod';

const sex = z.enum(['male', 'female', 'other', 'prefer_not_to_say']);
const status = z.enum(['active', 'paused', 'archived']);

export const createClientDto = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  email: z.string().email().optional(),
  phone: z.string().min(3).max(32).optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  sex: sex.optional(),
  notes: z.string().max(4000).optional(),
  goals: z.array(z.string().max(200)).default([]),
});
export type CreateClientDto = z.infer<typeof createClientDto>;

export const updateClientDto = createClientDto.partial().extend({
  status: status.optional(),
});
export type UpdateClientDto = z.infer<typeof updateClientDto>;

export const listClientsQuery = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  status: status.optional(),
  search: z.string().min(1).max(160).optional(),
});
export type ListClientsQuery = z.infer<typeof listClientsQuery>;

export const createMeasurementDto = z.object({
  recordedAt: z.string().datetime().optional(),
  heightCm: z.number().positive().optional(),
  weightKg: z.number().positive().optional(),
  bodyFatPct: z.number().min(0).max(100).optional(),
  waistCm: z.number().positive().optional(),
  hipCm: z.number().positive().optional(),
  notes: z.string().max(2000).optional(),
});
export type CreateMeasurementDto = z.infer<typeof createMeasurementDto>;
