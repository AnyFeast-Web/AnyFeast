import { MealPlan } from '../types';

export const mockMealPlans: MealPlan[] = [
  {
    id: 'mp1',
    client_id: 'c1',
    client_name: 'Priya Sharma',
    title: 'Thyroid-Friendly Fat Loss Plan',
    version: 2,
    date_range: { start: '2026-03-24', end: '2026-03-30' },
    status: 'active',
    days: {
      monday: {
        breakfast: [
          { id: 'm1', ingredient_id: 'i8', ingredient_name: 'Oats (Rolled, Dry)', portion_g: 50, nutrition: { calories: 195, protein_g: 8.5, carbs_g: 33.2, fat_g: 3.5, fiber_g: 5.3 } },
          { id: 'm2', ingredient_id: 'i9', ingredient_name: 'Banana', portion_g: 120, nutrition: { calories: 107, protein_g: 1.3, carbs_g: 27.4, fat_g: 0.4, fiber_g: 3.1 } },
        ],
        lunch: [
          { id: 'm3', ingredient_id: 'i13', ingredient_name: 'Roti (Whole Wheat)', portion_g: 60, nutrition: { calories: 178, protein_g: 5.9, carbs_g: 33.4, fat_g: 2.2, fiber_g: 4.9 } },
          { id: 'm4', ingredient_id: 'i12', ingredient_name: 'Dal (Moong, Cooked)', portion_g: 150, nutrition: { calories: 158, protein_g: 11, carbs_g: 27.5, fat_g: 0.6, fiber_g: 8 } },
          { id: 'm5', ingredient_id: 'i14', ingredient_name: 'Spinach (Cooked)', portion_g: 100, nutrition: { calories: 23, protein_g: 2.9, carbs_g: 3.6, fat_g: 0.3, fiber_g: 2.4 } },
        ],
        dinner: [
          { id: 'm6', ingredient_id: 'i11', ingredient_name: 'Paneer (Cottage Cheese)', portion_g: 80, nutrition: { calories: 212, protein_g: 14.6, carbs_g: 1, fat_g: 16.6, fiber_g: 0 } },
          { id: 'm7', ingredient_id: 'i4', ingredient_name: 'Broccoli (Steamed)', portion_g: 150, nutrition: { calories: 53, protein_g: 3.6, carbs_g: 10.8, fat_g: 0.6, fiber_g: 5 } },
        ],
        snack: [
          { id: 'm8', ingredient_id: 'i10', ingredient_name: 'Almonds (Raw)', portion_g: 20, nutrition: { calories: 116, protein_g: 4.2, carbs_g: 4.3, fat_g: 10, fiber_g: 2.4 } },
        ],
      },
      tuesday: {
        breakfast: [
          { id: 'm9', ingredient_id: 'i3', ingredient_name: 'Egg (Whole, Boiled)', portion_g: 100, nutrition: { calories: 155, protein_g: 12.6, carbs_g: 1.1, fat_g: 10.6, fiber_g: 0 } },
          { id: 'm10', ingredient_id: 'i13', ingredient_name: 'Roti (Whole Wheat)', portion_g: 40, nutrition: { calories: 119, protein_g: 3.9, carbs_g: 22.3, fat_g: 1.5, fiber_g: 3.2 } },
        ],
        lunch: [
          { id: 'm11', ingredient_id: 'i1', ingredient_name: 'Chicken Breast (Boneless)', portion_g: 120, nutrition: { calories: 198, protein_g: 37.2, carbs_g: 0, fat_g: 4.3, fiber_g: 0 } },
          { id: 'm12', ingredient_id: 'i2', ingredient_name: 'Brown Rice (Cooked)', portion_g: 100, nutrition: { calories: 123, protein_g: 2.7, carbs_g: 25.6, fat_g: 1, fiber_g: 1.6 } },
        ],
        dinner: [
          { id: 'm13', ingredient_id: 'i7', ingredient_name: 'Salmon (Grilled)', portion_g: 100, nutrition: { calories: 208, protein_g: 20, carbs_g: 0, fat_g: 13, fiber_g: 0 } },
          { id: 'm14', ingredient_id: 'i6', ingredient_name: 'Sweet Potato (Baked)', portion_g: 150, nutrition: { calories: 135, protein_g: 3, carbs_g: 31.1, fat_g: 0.2, fiber_g: 5 } },
        ],
        snack: [
          { id: 'm15', ingredient_id: 'i5', ingredient_name: 'Greek Yogurt (Low-fat)', portion_g: 150, nutrition: { calories: 110, protein_g: 15, carbs_g: 6, fat_g: 3, fiber_g: 0 } },
        ],
      },
      wednesday: { breakfast: [], lunch: [], dinner: [], snack: [] },
      thursday: { breakfast: [], lunch: [], dinner: [], snack: [] },
      friday: { breakfast: [], lunch: [], dinner: [], snack: [] },
      saturday: { breakfast: [], lunch: [], dinner: [], snack: [] },
      sunday: { breakfast: [], lunch: [], dinner: [], snack: [] },
    },
    total_nutrition: { calories: 1842, protein_g: 146, carbs_g: 227, fat_g: 68, fiber_g: 41 },
    created_at: '2026-03-20T08:00:00Z',
    updated_at: '2026-03-24T10:00:00Z',
  },
  {
    id: 'mp2',
    client_id: 'c2',
    client_name: 'Rahul Verma',
    title: 'High-Protein Muscle Building Plan',
    version: 1,
    date_range: { start: '2026-03-17', end: '2026-03-23' },
    status: 'sent',
    days: {
      monday: { breakfast: [], lunch: [], dinner: [], snack: [] },
      tuesday: { breakfast: [], lunch: [], dinner: [], snack: [] },
      wednesday: { breakfast: [], lunch: [], dinner: [], snack: [] },
      thursday: { breakfast: [], lunch: [], dinner: [], snack: [] },
      friday: { breakfast: [], lunch: [], dinner: [], snack: [] },
      saturday: { breakfast: [], lunch: [], dinner: [], snack: [] },
      sunday: { breakfast: [], lunch: [], dinner: [], snack: [] },
    },
    total_nutrition: { calories: 2650, protein_g: 210, carbs_g: 280, fat_g: 75, fiber_g: 35 },
    created_at: '2026-03-15T08:00:00Z',
    updated_at: '2026-03-17T10:00:00Z',
  },
  {
    id: 'mp3',
    client_id: 'c3',
    client_name: 'Meera Patel',
    title: 'Diabetic-Friendly Balanced Plan',
    version: 3,
    date_range: { start: '2026-03-31', end: '2026-04-06' },
    status: 'draft',
    days: {
      monday: { breakfast: [], lunch: [], dinner: [], snack: [] },
      tuesday: { breakfast: [], lunch: [], dinner: [], snack: [] },
      wednesday: { breakfast: [], lunch: [], dinner: [], snack: [] },
      thursday: { breakfast: [], lunch: [], dinner: [], snack: [] },
      friday: { breakfast: [], lunch: [], dinner: [], snack: [] },
      saturday: { breakfast: [], lunch: [], dinner: [], snack: [] },
      sunday: { breakfast: [], lunch: [], dinner: [], snack: [] },
    },
    total_nutrition: { calories: 1650, protein_g: 95, carbs_g: 180, fat_g: 60, fiber_g: 38 },
    created_at: '2026-03-25T08:00:00Z',
    updated_at: '2026-03-27T14:00:00Z',
  },
];
