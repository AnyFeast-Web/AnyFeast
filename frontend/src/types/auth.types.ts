// ============================================================
// AUTH TYPES
// ============================================================

export type UserRole = 'admin' | 'nutritionist' | 'viewer';

export interface NutritionistUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}
