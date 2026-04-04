import { Ingredient } from '../types';

export const mockIngredients: Ingredient[] = [
  {
    id: 'i1', name: 'Chicken Breast (Boneless)', category: 'protein', unit: 'g',
    nutrition_per_100g: { calories: 165, protein_g: 31, carbs_g: 0, fat_g: 3.6, fiber_g: 0 },
    source: 'usda', usda_fdc_id: '171077', created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'i2', name: 'Brown Rice (Cooked)', category: 'grains', unit: 'g',
    nutrition_per_100g: { calories: 123, protein_g: 2.7, carbs_g: 25.6, fat_g: 1, fiber_g: 1.6 },
    source: 'usda', usda_fdc_id: '169704', created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'i3', name: 'Egg (Whole, Boiled)', category: 'protein', unit: 'g',
    nutrition_per_100g: { calories: 155, protein_g: 12.6, carbs_g: 1.1, fat_g: 10.6, fiber_g: 0 },
    source: 'usda', usda_fdc_id: '173424', created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'i4', name: 'Broccoli (Steamed)', category: 'vegetables', unit: 'g',
    nutrition_per_100g: { calories: 35, protein_g: 2.4, carbs_g: 7.2, fat_g: 0.4, fiber_g: 3.3 },
    source: 'usda', usda_fdc_id: '170379', created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'i5', name: 'Greek Yogurt (Low-fat)', category: 'dairy', unit: 'g',
    nutrition_per_100g: { calories: 73, protein_g: 10, carbs_g: 4, fat_g: 2, fiber_g: 0 },
    source: 'usda', usda_fdc_id: '170886', created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'i6', name: 'Sweet Potato (Baked)', category: 'vegetables', unit: 'g',
    nutrition_per_100g: { calories: 90, protein_g: 2, carbs_g: 20.7, fat_g: 0.1, fiber_g: 3.3 },
    source: 'usda', usda_fdc_id: '168483', created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'i7', name: 'Salmon (Grilled)', category: 'protein', unit: 'g',
    nutrition_per_100g: { calories: 208, protein_g: 20, carbs_g: 0, fat_g: 13, fiber_g: 0 },
    source: 'usda', usda_fdc_id: '175168', created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'i8', name: 'Oats (Rolled, Dry)', category: 'grains', unit: 'g',
    nutrition_per_100g: { calories: 389, protein_g: 16.9, carbs_g: 66.3, fat_g: 6.9, fiber_g: 10.6 },
    source: 'usda', usda_fdc_id: '173904', created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'i9', name: 'Banana', category: 'fruits', unit: 'g',
    nutrition_per_100g: { calories: 89, protein_g: 1.1, carbs_g: 22.8, fat_g: 0.3, fiber_g: 2.6 },
    source: 'usda', usda_fdc_id: '173944', created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'i10', name: 'Almonds (Raw)', category: 'fats', unit: 'g',
    nutrition_per_100g: { calories: 579, protein_g: 21.2, carbs_g: 21.7, fat_g: 49.9, fiber_g: 12.2 },
    source: 'usda', usda_fdc_id: '170567', created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'i11', name: 'Paneer (Cottage Cheese)', category: 'dairy', unit: 'g',
    nutrition_per_100g: { calories: 265, protein_g: 18.3, carbs_g: 1.2, fat_g: 20.8, fiber_g: 0 },
    source: 'custom', created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'i12', name: 'Dal (Moong, Cooked)', category: 'legumes', unit: 'g',
    nutrition_per_100g: { calories: 105, protein_g: 7.3, carbs_g: 18.3, fat_g: 0.4, fiber_g: 5.3 },
    source: 'custom', created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'i13', name: 'Roti (Whole Wheat)', category: 'grains', unit: 'g',
    nutrition_per_100g: { calories: 297, protein_g: 9.8, carbs_g: 55.7, fat_g: 3.7, fiber_g: 8.1 },
    source: 'custom', created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'i14', name: 'Spinach (Cooked)', category: 'vegetables', unit: 'g',
    nutrition_per_100g: { calories: 23, protein_g: 2.9, carbs_g: 3.6, fat_g: 0.3, fiber_g: 2.4 },
    source: 'usda', usda_fdc_id: '168462', created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'i15', name: 'Olive Oil', category: 'fats', unit: 'ml',
    nutrition_per_100g: { calories: 884, protein_g: 0, carbs_g: 0, fat_g: 100, fiber_g: 0 },
    source: 'usda', usda_fdc_id: '171413', created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'i16', name: 'Apple', category: 'fruits', unit: 'g',
    nutrition_per_100g: { calories: 52, protein_g: 0.3, carbs_g: 13.8, fat_g: 0.2, fiber_g: 2.4 },
    source: 'usda', usda_fdc_id: '171688', created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'i17', name: 'Chickpeas (Cooked)', category: 'legumes', unit: 'g',
    nutrition_per_100g: { calories: 164, protein_g: 8.9, carbs_g: 27.4, fat_g: 2.6, fiber_g: 7.6 },
    source: 'usda', usda_fdc_id: '173757', created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'i18', name: 'Tofu (Firm)', category: 'protein', unit: 'g',
    nutrition_per_100g: { calories: 144, protein_g: 15.6, carbs_g: 2.3, fat_g: 8.7, fiber_g: 1.2 },
    source: 'usda', usda_fdc_id: '174272', created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'i19', name: 'Quinoa (Cooked)', category: 'grains', unit: 'g',
    nutrition_per_100g: { calories: 120, protein_g: 4.4, carbs_g: 21.3, fat_g: 1.9, fiber_g: 2.8 },
    source: 'usda', usda_fdc_id: '168917', created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'i20', name: 'Avocado', category: 'fats', unit: 'g',
    nutrition_per_100g: { calories: 160, protein_g: 2, carbs_g: 8.5, fat_g: 14.7, fiber_g: 6.7 },
    source: 'usda', usda_fdc_id: '171705', created_at: '2025-01-01T00:00:00Z',
  },
];
