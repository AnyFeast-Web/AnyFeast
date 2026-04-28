import { z } from 'zod';

const mealType = z.enum([
  'breakfast',
  'snack_morning',
  'lunch',
  'snack_afternoon',
  'dinner',
  'snack_evening',
]);

const mealDto = z.object({
  mealType,
  position: z.number().int().min(0).default(0),
  title: z.string().min(1).max(200),
  ingredients: z.array(z.unknown()).default([]),
  macros: z.record(z.unknown()).default({}),
  instructions: z.string().max(8000).optional(),
});

const dayDto = z.object({
  dayIndex: z.number().int().min(0).max(13),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  notes: z.string().max(2000).optional(),
  meals: z.array(mealDto).default([]),
});

export const createMealPlanDto = z.object({
  clientId: z.string().uuid(),
  title: z.string().min(1).max(160),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  nutritionTargets: z.record(z.unknown()).default({}),
  guidelines: z.string().max(4000).optional(),
  groceryList: z.array(z.unknown()).default([]),
  days: z.array(dayDto).default([]),
});
export type CreateMealPlanDto = z.infer<typeof createMealPlanDto>;

export const updateMealPlanDto = createMealPlanDto.partial().omit({ clientId: true });
export type UpdateMealPlanDto = z.infer<typeof updateMealPlanDto>;

export const listMealPlansQuery = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  clientId: z.string().uuid().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
});
export type ListMealPlansQuery = z.infer<typeof listMealPlansQuery>;

export const generateMealPlanDto = z.object({
  clientId: z.string().uuid(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  nutritionTargets: z.record(z.unknown()).optional(),
  preferences: z.record(z.unknown()).optional(),
});
export type GenerateMealPlanDto = z.infer<typeof generateMealPlanDto>;

export const sendMealPlanEmailDto = z.object({
  to: z.string().email().optional(),
});
export type SendMealPlanEmailDto = z.infer<typeof sendMealPlanEmailDto>;
