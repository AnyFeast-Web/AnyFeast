export const APP_NAME = 'AnyFeast';
export const APP_TAGLINE = 'Professional Nutritionist Platform';

export const DAYS_OF_WEEK = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
] as const;

export const DAY_LABELS: Record<string, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

export const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

export const GOAL_COLORS: Record<string, { bg: string; text: string }> = {
  fat_loss: { bg: 'bg-accent-amber/10', text: 'text-accent-amber' },
  muscle_gain: { bg: 'bg-brand-primary/10', text: 'text-brand-primary' },
  maintenance: { bg: 'bg-accent-blue/10', text: 'text-accent-blue' },
  diabetic_control: { bg: 'bg-accent-rose/10', text: 'text-accent-rose' },
};

export const INGREDIENT_CATEGORIES = [
  'protein', 'grains', 'dairy', 'vegetables', 'fruits', 'fats', 'legumes', 'spices'
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  protein: 'Protein',
  grains: 'Grains',
  dairy: 'Dairy',
  vegetables: 'Vegetables',
  fruits: 'Fruits',
  fats: 'Fats & Oils',
  legumes: 'Legumes',
  spices: 'Spices',
};
