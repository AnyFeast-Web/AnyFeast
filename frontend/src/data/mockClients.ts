import { Client } from '../types';

export const mockClients: Client[] = [
  {
    id: 'c1',
    nutritionist_id: 'n1',
    status: 'active',
    personal_info: {
      first_name: 'Priya',
      last_name: 'Sharma',
      email: 'priya.sharma@email.com',
      phone: '+91 98765 43210',
      age: 34,
      gender: 'female',
    },
    measurements: {
      weight_kg: 72,
      height_cm: 162,
      activity_multiplier: 1.2
    },
    goals: ['fat_loss'],
    tags: ['Fat Loss', 'Thyroid'],
    diet_preferences: { veg: true, vegan: false, halal: false, gluten_free: false, allergies: [] },
    created_at: '2025-11-15T08:00:00Z',
    updated_at: '2026-03-28T10:30:00Z',
  },
  {
    id: 'c2',
    nutritionist_id: 'n1',
    status: 'active',
    personal_info: {
      first_name: 'Rahul',
      last_name: 'Verma',
      email: 'rahul.verma@email.com',
      phone: '+91 87654 32109',
      age: 28,
      gender: 'male',
    },
    measurements: {
      weight_kg: 85,
      height_cm: 178,
      activity_multiplier: 1.2
    },
    goals: ['muscle_gain'],
    tags: ['Athlete', 'Muscle Gain'],
    diet_preferences: { veg: false, vegan: false, halal: false, gluten_free: false, allergies: ['shellfish'] },
    created_at: '2025-12-01T08:00:00Z',
    updated_at: '2026-03-27T15:00:00Z',
  },
  {
    id: 'c3',
    nutritionist_id: 'n1',
    status: 'active',
    personal_info: {
      first_name: 'Meera',
      last_name: 'Patel',
      email: 'meera.patel@email.com',
      phone: '+91 76543 21098',
      age: 52,
      gender: 'female',
    },
    measurements: {
      weight_kg: 68,
      height_cm: 155,
      activity_multiplier: 1.2
    },
    goals: ['diabetic_control'],
    tags: ['Diabetic', 'Heart'],
    diet_preferences: { veg: true, vegan: false, halal: false, gluten_free: false, allergies: ['nuts'] },
    created_at: '2025-10-20T08:00:00Z',
    updated_at: '2026-03-26T09:00:00Z',
  },
  {
    id: 'c4',
    nutritionist_id: 'n1',
    status: 'active',
    personal_info: {
      first_name: 'Arjun',
      last_name: 'Reddy',
      email: 'arjun.reddy@email.com',
      age: 24,
      gender: 'male',
    },
    measurements: {
      weight_kg: 70,
      height_cm: 175,
      activity_multiplier: 1.2
    },
    goals: ['muscle_gain'],
    tags: ['Athlete'],
    diet_preferences: { veg: false, vegan: false, halal: false, gluten_free: false, allergies: [] },
    created_at: '2026-01-10T08:00:00Z',
    updated_at: '2026-03-28T08:00:00Z',
  },
  {
    id: 'c5',
    nutritionist_id: 'n1',
    status: 'active',
    personal_info: {
      first_name: 'Fatima',
      last_name: 'Khan',
      email: 'fatima.khan@email.com',
      age: 41,
      gender: 'female',
    },
    measurements: {
      weight_kg: 82,
      height_cm: 160,
      activity_multiplier: 1.2
    },
    goals: ['fat_loss'],
    tags: ['Fat Loss'],
    diet_preferences: { veg: false, vegan: false, halal: true, gluten_free: false, allergies: ['dairy'] },
    created_at: '2026-01-05T08:00:00Z',
    updated_at: '2026-03-25T14:00:00Z',
  },
  {
    id: 'c6',
    nutritionist_id: 'n1',
    status: 'inactive',
    personal_info: {
      first_name: 'Vikram',
      last_name: 'Singh',
      email: 'vikram.singh@email.com',
      age: 45,
      gender: 'male',
    },
    measurements: {
      weight_kg: 95,
      height_cm: 182,
      activity_multiplier: 1.2
    },
    goals: ['fat_loss'],
    tags: ['Fat Loss', 'Heart'],
    diet_preferences: { veg: false, vegan: false, halal: false, gluten_free: false, allergies: [] },
    created_at: '2025-09-01T08:00:00Z',
    updated_at: '2026-03-10T08:00:00Z',
  },
  {
    id: 'c7',
    nutritionist_id: 'n1',
    status: 'active',
    personal_info: {
      first_name: 'Anita',
      last_name: 'Desai',
      email: 'anita.desai@email.com',
      age: 30,
      gender: 'female',
    },
    measurements: {
      weight_kg: 58,
      height_cm: 165,
      activity_multiplier: 1.2
    },
    goals: ['maintenance'],
    tags: ['Maintenance'],
    diet_preferences: { veg: true, vegan: true, halal: false, gluten_free: true, allergies: ['soy'] },
    created_at: '2026-02-15T08:00:00Z',
    updated_at: '2026-03-28T07:00:00Z',
  },
  {
    id: 'c8',
    nutritionist_id: 'n1',
    status: 'active',
    personal_info: {
      first_name: 'Karthik',
      last_name: 'Nair',
      email: 'karthik.nair@email.com',
      age: 37,
      gender: 'male',
    },
    measurements: {
      weight_kg: 78,
      height_cm: 170,
      activity_multiplier: 1.2
    },
    goals: ['diabetic_control'],
    tags: ['Diabetic'],
    diet_preferences: { veg: false, vegan: false, halal: false, gluten_free: false, allergies: [] },
    created_at: '2025-12-20T08:00:00Z',
    updated_at: '2026-03-27T12:00:00Z',
  },
];
