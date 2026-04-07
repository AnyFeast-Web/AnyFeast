// ============================================================
// CLIENT TYPES
// ============================================================

export type ClientGoal = 'fat_loss' | 'muscle_gain' | 'maintenance' | 'diabetic_control';
export type ClientStatus = 'active' | 'inactive';
export type Gender = 'male' | 'female' | 'other';

export interface DietPreferences {
  veg: boolean;
  vegan: boolean;
  halal: boolean;
  gluten_free: boolean;
  allergies: string[];
}

export interface Client {
  id: string;
  nutritionist_id: string;
  name: string;
  age: number;
  gender: Gender;
  weight_kg: number;
  height_cm: number;
  goal: ClientGoal;
  conditions: string[];
  tags: string[];
  diet_preferences: DietPreferences;
  status: ClientStatus;
  last_active: string;
  created_at: string;
  avatar_url?: string;
  email?: string;
  phone?: string;
  customer_id?: string;
}

export type CreateClientInput = Omit<Client, 'id' | 'nutritionist_id' | 'last_active' | 'created_at'>;
export type UpdateClientInput = Partial<CreateClientInput>;
