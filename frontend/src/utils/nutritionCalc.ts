import { NutritionInfo } from '../types';

export function calculateMealNutrition(
  proteinPer100g: number,
  carbsPer100g: number,
  fatPer100g: number,
  fiberPer100g: number,
  portionG: number
): NutritionInfo {
  const protein_g = (proteinPer100g * portionG) / 100;
  const carbs_g = (carbsPer100g * portionG) / 100;
  const fat_g = (fatPer100g * portionG) / 100;
  const fiber_g = (fiberPer100g * portionG) / 100;
  const calories = protein_g * 4 + carbs_g * 4 + fat_g * 9;

  return { calories, protein_g, carbs_g, fat_g, fiber_g };
}

export function sumNutrition(items: NutritionInfo[]): NutritionInfo {
  return items.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein_g: acc.protein_g + item.protein_g,
      carbs_g: acc.carbs_g + item.carbs_g,
      fat_g: acc.fat_g + item.fat_g,
      fiber_g: acc.fiber_g + item.fiber_g,
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 }
  );
}

export function calculateBMR(
  gender: 'male' | 'female',
  weightKg: number,
  heightCm: number,
  age: number
): number {
  if (gender === 'male') {
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  }
  return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
}

export function calculateTDEE(bmr: number, activityLevel: string): number {
  const factors: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  return bmr * (factors[activityLevel] || 1.2);
}

export function macroPercentages(nutrition: NutritionInfo) {
  const total = nutrition.protein_g + nutrition.carbs_g + nutrition.fat_g;
  if (total === 0) return { protein: 0, carbs: 0, fat: 0 };
  return {
    protein: Math.round((nutrition.protein_g / total) * 100),
    carbs: Math.round((nutrition.carbs_g / total) * 100),
    fat: Math.round((nutrition.fat_g / total) * 100),
  };
}
