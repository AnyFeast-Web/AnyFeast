// ============================================================
// INGREDIENT TYPES
// ============================================================

export type IngredientCategory = 'protein' | 'grains' | 'dairy' | 'vegetables' | 'fruits' | 'fats' | 'legumes' | 'spices';
export type IngredientSource = 'usda' | 'custom';

export interface IngredientNutrition {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sodium_mg?: number;
  calcium_mg?: number;
  iron_mg?: number;
}

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  unit: string;
  nutrition_per_100g: IngredientNutrition;
  source: IngredientSource;
  usda_fdc_id?: string;
  created_at: string;
}
