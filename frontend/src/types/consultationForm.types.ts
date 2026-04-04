// ============================================================
// CONSULTATION FORM TYPES — Structured Consultation Portal
// ============================================================

// ---------- A. Medical & Health History ----------
export interface MedicalHistory {
  previous_diagnoses: string;
  current_symptoms: string;
  digestive_issues: string[];
  allergies_intolerances: string;
  family_history: string;
  medication_history: string;
  previous_surgeries: string;
}

// ---------- B. Lifestyle & Behaviour ----------
export type LevelRating = 'low' | 'moderate' | 'high' | '';
export type FrequencyRating = 'none' | 'occasional' | 'regular' | 'heavy' | '';

export interface LifestyleBehaviour {
  sleep_hours: number | null;
  sleep_quality: LevelRating;
  stress_level: LevelRating;
  energy_level: LevelRating;
  physical_activity: string;
  work_schedule: string;
  smoking: FrequencyRating;
  alcohol: FrequencyRating;
  water_intake_litres: number | null;
}

// ---------- C. Nutrition History ----------
export interface NutritionHistory {
  past_diets: string;
  what_worked: string;
  what_didnt_work: string;
  meal_timings: string;
  cravings: string;
  emotional_eating: string;
  cultural_preferences: string;
  food_aversions: string;
}

// ---------- D. Supplements & Treatments ----------
export interface SupplementEntry {
  id: string;
  name: string;
  brand: string;
  dosage: string;
  frequency: string;
  duration: string;
  reason: string;
  side_effects: string;
  is_current: boolean;
}

export interface SupplementsTreatments {
  supplements: SupplementEntry[];
  other_treatments: string;
}

// ---------- E. Blood Reports & Test Results ----------
export interface BloodMarkerEntry {
  id: string;
  marker_name: string;
  value: string;
  unit: string;
  reference_range: string;
  status: 'normal' | 'low' | 'high' | 'critical' | '';
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  preview_url?: string;
  uploaded_at: string;
}

export interface BloodReports {
  files: UploadedFile[];
  markers: BloodMarkerEntry[];
  test_date: string;
  comments: string;
}

// ---------- F. Goals & Constraints ----------
export interface GoalsConstraints {
  weight_goals: string;
  health_goals: string;
  budget: string;
  cooking_ability: 'beginner' | 'intermediate' | 'advanced' | '';
  time_available: string;
  family_context: string;
  dietary_restrictions: string[];
}

// ---------- G. Consultation Notes & Plan ----------
export interface ConsultationPlan {
  free_notes: string;
  priority_issues: string;
  next_steps: string;
  follow_up_date: string;
  internal_notes: string; // Not visible to customer
}

// ---------- Full Consultation Form ----------
export type ConsultationFormSection =
  | 'medical'
  | 'lifestyle'
  | 'nutrition'
  | 'supplements'
  | 'blood_reports'
  | 'goals'
  | 'plan';

export interface FullConsultationForm {
  id: string;
  client_id: string;
  client_name: string;
  nutritionist_id: string;
  nutritionist_name: string;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'completed';
  consent_given: boolean;
  consent_timestamp?: string;

  medical_history: MedicalHistory;
  lifestyle: LifestyleBehaviour;
  nutrition_history: NutritionHistory;
  supplements: SupplementsTreatments;
  blood_reports: BloodReports;
  goals: GoalsConstraints;
  plan: ConsultationPlan;
}

// ---------- Section metadata for navigation ----------
export interface SectionMeta {
  id: ConsultationFormSection;
  label: string;
  shortLabel: string;
  description: string;
}

export const CONSULTATION_SECTIONS: SectionMeta[] = [
  { id: 'medical', label: 'Medical & Health History', shortLabel: 'A', description: 'Diagnoses, symptoms, allergies, medications' },
  { id: 'lifestyle', label: 'Lifestyle & Behaviour', shortLabel: 'B', description: 'Sleep, stress, activity, habits' },
  { id: 'nutrition', label: 'Nutrition History', shortLabel: 'C', description: 'Past diets, cravings, preferences' },
  { id: 'supplements', label: 'Supplements & Treatments', shortLabel: 'D', description: 'Current and past supplements' },
  { id: 'blood_reports', label: 'Blood Reports & Tests', shortLabel: 'E', description: 'Upload reports, enter markers' },
  { id: 'goals', label: 'Goals & Constraints', shortLabel: 'F', description: 'Weight, health, budget, restrictions' },
  { id: 'plan', label: 'Consultation Notes & Plan', shortLabel: 'G', description: 'Notes, next steps, follow-up' },
];

// ---------- Empty form template ----------
export function createEmptyConsultationForm(
  clientId: string,
  clientName: string,
  nutritionistId: string,
  nutritionistName: string
): FullConsultationForm {
  return {
    id: `cf-${Date.now()}`,
    client_id: clientId,
    client_name: clientName,
    nutritionist_id: nutritionistId,
    nutritionist_name: nutritionistName,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: 'draft',
    consent_given: false,

    medical_history: {
      previous_diagnoses: '',
      current_symptoms: '',
      digestive_issues: [],
      allergies_intolerances: '',
      family_history: '',
      medication_history: '',
      previous_surgeries: '',
    },
    lifestyle: {
      sleep_hours: null,
      sleep_quality: '',
      stress_level: '',
      energy_level: '',
      physical_activity: '',
      work_schedule: '',
      smoking: '',
      alcohol: '',
      water_intake_litres: null,
    },
    nutrition_history: {
      past_diets: '',
      what_worked: '',
      what_didnt_work: '',
      meal_timings: '',
      cravings: '',
      emotional_eating: '',
      cultural_preferences: '',
      food_aversions: '',
    },
    supplements: {
      supplements: [],
      other_treatments: '',
    },
    blood_reports: {
      files: [],
      markers: [],
      test_date: '',
      comments: '',
    },
    goals: {
      weight_goals: '',
      health_goals: '',
      budget: '',
      cooking_ability: '',
      time_available: '',
      family_context: '',
      dietary_restrictions: [],
    },
    plan: {
      free_notes: '',
      priority_issues: '',
      next_steps: '',
      follow_up_date: '',
      internal_notes: '',
    },
  };
}
