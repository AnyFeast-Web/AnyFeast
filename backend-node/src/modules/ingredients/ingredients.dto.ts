import { z } from 'zod';

const nutrition = z.record(z.union([z.number(), z.string()]));

export const createIngredientDto = z.object({
  name: z.string().min(1).max(160),
  category: z.string().max(64).optional(),
  unit: z.string().max(16).default('g'),
  nutrition: nutrition.default({}),
  aliases: z.array(z.string().max(160)).default([]),
});
export type CreateIngredientDto = z.infer<typeof createIngredientDto>;

export const updateIngredientDto = createIngredientDto.partial();
export type UpdateIngredientDto = z.infer<typeof updateIngredientDto>;

export const listIngredientsQuery = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().min(1).max(160).optional(),
  category: z.string().max(64).optional(),
});
export type ListIngredientsQuery = z.infer<typeof listIngredientsQuery>;
