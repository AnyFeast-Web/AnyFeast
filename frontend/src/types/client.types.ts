// ============================================================
// CLIENT TYPES
// ============================================================

export type ClientStatus = 'active' | 'inactive';

export interface PersonalInfo {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  dob?: string;
  age?: number;
  gender?: string;
}

export interface Measurements {
  height_cm?: number;
  weight_kg?: number;
  activity_multiplier?: number;
}

export interface Client {
  id: string;
  nutritionist_id: string;
  status: ClientStatus;
  personal_info: PersonalInfo;
  goals: string[];
  tags: string[];
  measurements: Measurements;
  created_at: string;
  updated_at: string;
}

export interface CreateClientInput {
  status?: ClientStatus;
  personal_info: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    dob?: string;
    age?: number;
    gender?: string;
  };
  goals?: string[];
  tags?: string[];
  measurements?: {
    height_cm?: number;
    weight_kg?: number;
    activity_multiplier?: number;
  };
}

export type UpdateClientInput = Partial<CreateClientInput>;
