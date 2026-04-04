// ============================================================
// MEAL PLAN TYPES
// ============================================================

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type PlanStatus = 'draft' | 'active' | 'sent' | 'archived';

export interface NutritionInfo {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
}

export interface MealItem {
  id: string;
  ingredient_id: string;
  ingredient_name: string;
  portion_g: number;
  nutrition: NutritionInfo;
}

export interface DayMeals {
  breakfast: MealItem[];
  lunch: MealItem[];
  dinner: MealItem[];
  snack: MealItem[];
}

export interface MealPlan {
  id: string;
  client_id: string;
  client_name: string;
  title: string;
  version: number;
  date_range: {
    start: string;
    end: string;
  };
  status: PlanStatus;
  days: Record<DayOfWeek, DayMeals>;
  total_nutrition: NutritionInfo;
  created_at: string;
  updated_at: string;
}
