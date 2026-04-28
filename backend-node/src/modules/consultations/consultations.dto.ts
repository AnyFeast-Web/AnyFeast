import { z } from 'zod';

const status = z.enum(['draft', 'completed', 'archived']);
const jsonObject = z.record(z.unknown());

export const createConsultationDto = z.object({
  clientId: z.string().uuid(),
  consultationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: status.default('draft'),
  medicalHistory: jsonObject.default({}),
  lifestyle: jsonObject.default({}),
  nutritionHistory: jsonObject.default({}),
  bloodReport: jsonObject.default({}),
  goals: z.array(z.string().max(200)).default([]),
  notes: z.string().max(8000).optional(),
  consentSignedAt: z.string().datetime().optional(),
});
export type CreateConsultationDto = z.infer<typeof createConsultationDto>;

export const updateConsultationDto = createConsultationDto.partial().omit({ clientId: true });
export type UpdateConsultationDto = z.infer<typeof updateConsultationDto>;

export const listConsultationsQuery = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  status: status.optional(),
  clientId: z.string().uuid().optional(),
});
export type ListConsultationsQuery = z.infer<typeof listConsultationsQuery>;
