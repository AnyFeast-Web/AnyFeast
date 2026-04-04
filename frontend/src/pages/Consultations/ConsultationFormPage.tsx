import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Save, CheckCircle, HeartPulse, Brain, Apple,
  Pill, FileText, Target, ClipboardList, Calendar, Download, AlertTriangle
} from 'lucide-react';
import { TopBar } from '../../components/layout/TopBar';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card, Button, Badge } from '../../components/ui';
import { FormSection } from '../../components/forms/FormSection';
import { FormField, TextAreaField, SelectField, NumberField } from '../../components/forms/FormField';
import { CheckboxGroup } from '../../components/forms/CheckboxGroup';
import { ConsentCheckbox } from '../../components/forms/ConsentCheckbox';
import { FileUploadZone } from '../../components/forms/FileUploadZone';
import { BloodMarkerInput } from '../../components/forms/BloodMarkerInput';
import { SupplementRow } from '../../components/forms/SupplementRow';
import { SectionNav } from '../../components/forms/SectionNav';
import { AutoSaveIndicator, type SaveStatus } from '../../components/forms/AutoSaveIndicator';
import { MissingDataPanel } from '../../components/forms/MissingDataPanel';
import { SummaryPanel } from '../../components/forms/SummaryPanel';
import { AuditTrailPanel } from '../../components/forms/AuditTrailPanel';
import { useClient } from '../../hooks/useClients';
import { useCreateConsultation, useUpdateConsultation, useConsultation } from '../../hooks/useConsultations';
import { getMissingDataFlags, getAbnormalMarkers, exportConsultationPDF } from '../../utils/consultationUtils';
import {
  CONSULTATION_SECTIONS,
  createEmptyConsultationForm,
  type ConsultationFormSection,
  type FullConsultationForm,
  type MedicalHistory,
  type LifestyleBehaviour,
  type NutritionHistory,
  type SupplementsTreatments,
  type BloodReports,
  type GoalsConstraints,
  type ConsultationPlan,
  type UploadedFile,
  type BloodMarkerEntry,
  type SupplementEntry,
} from '../../types/consultationForm.types';

const DIGESTIVE_OPTIONS = [
  'Bloating', 'Constipation', 'Diarrhoea', 'Acid reflux', 'Gas',
  'IBS', 'Nausea', 'Cramping', 'Loss of appetite', 'Excessive appetite',
];

const DIETARY_RESTRICTION_OPTIONS = [
  'Vegetarian', 'Vegan', 'Halal', 'Kosher', 'Gluten free',
  'Dairy free', 'Low sodium', 'Low spice', 'Nut free', 'Jain',
];

export function ConsultationFormPage() {
  const { clientId, id } = useParams<{ clientId?: string; id?: string }>();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<ConsultationFormSection>('medical');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<string>();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const { data: clientData } = useClient(clientId || '');

  const [form, setForm] = useState<FullConsultationForm>(() => {
    return createEmptyConsultationForm(
      clientId || '',
      'Loading...',
      'n1',
      'Dr. Anika Desai'
    );
  });

  // Update form with client name once loaded
  useEffect(() => {
    if (clientData && clientData.name && form.client_name !== clientData.name) {
      setForm((prev) => ({ ...prev, client_name: clientData.name }));
    }
  }, [clientData]);

  const createMutation = useCreateConsultation();
  const updateMutation = useUpdateConsultation(id || 'temp');
  
  const { data: existingForm } = useConsultation(id || '');

  // Load backend data if it exists
  useEffect(() => {
    if (existingForm && id) {
      setForm((prev) => ({ ...prev, ...existingForm }));
    }
  }, [existingForm, id]);

  const client = clientData;

  // Auto-save (debounced 2s)
  const triggerAutoSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      setSaveStatus('saving');
      
      const payload = { ...form, updated_at: new Date().toISOString() };
      
      if (id) {
        updateMutation.mutate(payload, {
          onSuccess: () => {
            setLastSaved(new Date().toISOString());
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 3000);
          }
        });
      } else {
        createMutation.mutate(payload, {
          onSuccess: (newDoc) => {
            navigate(`/consultations/${newDoc.id}/edit`, { replace: true });
            setLastSaved(new Date().toISOString());
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 3000);
          }
        });
      }
    }, 2000);
  }, [form, id, updateMutation, createMutation, navigate]);

  // Generic update helpers
  const updateMedical = useCallback((field: keyof MedicalHistory, value: MedicalHistory[keyof MedicalHistory]) => {
    setForm((prev) => ({ ...prev, medical_history: { ...prev.medical_history, [field]: value } }));
    triggerAutoSave();
  }, [triggerAutoSave]);

  const updateLifestyle = useCallback((field: keyof LifestyleBehaviour, value: LifestyleBehaviour[keyof LifestyleBehaviour]) => {
    setForm((prev) => ({ ...prev, lifestyle: { ...prev.lifestyle, [field]: value } }));
    triggerAutoSave();
  }, [triggerAutoSave]);

  const updateNutrition = useCallback((field: keyof NutritionHistory, value: string) => {
    setForm((prev) => ({ ...prev, nutrition_history: { ...prev.nutrition_history, [field]: value } }));
    triggerAutoSave();
  }, [triggerAutoSave]);

  const updateSupplements = useCallback((field: keyof SupplementsTreatments, value: SupplementsTreatments[keyof SupplementsTreatments]) => {
    setForm((prev) => ({ ...prev, supplements: { ...prev.supplements, [field]: value } }));
    triggerAutoSave();
  }, [triggerAutoSave]);

  const updateBloodReports = useCallback((field: keyof BloodReports, value: BloodReports[keyof BloodReports]) => {
    setForm((prev) => ({ ...prev, blood_reports: { ...prev.blood_reports, [field]: value } }));
    triggerAutoSave();
  }, [triggerAutoSave]);

  const updateGoals = useCallback((field: keyof GoalsConstraints, value: GoalsConstraints[keyof GoalsConstraints]) => {
    setForm((prev) => ({ ...prev, goals: { ...prev.goals, [field]: value } }));
    triggerAutoSave();
  }, [triggerAutoSave]);

  const updatePlan = useCallback((field: keyof ConsultationPlan, value: string) => {
    setForm((prev) => ({ ...prev, plan: { ...prev.plan, [field]: value } }));
    triggerAutoSave();
  }, [triggerAutoSave]);

  // Completion check
  const completionMap: Record<string, boolean> = {
    medical: !!(form.medical_history.previous_diagnoses || form.medical_history.current_symptoms),
    lifestyle: !!(form.lifestyle.sleep_hours || form.lifestyle.physical_activity),
    nutrition: !!(form.nutrition_history.past_diets || form.nutrition_history.meal_timings),
    supplements: form.supplements.supplements.length > 0,
    blood_reports: form.blood_reports.markers.length > 0 || form.blood_reports.files.length > 0,
    goals: !!(form.goals.weight_goals || form.goals.health_goals),
    plan: !!(form.plan.free_notes || form.plan.next_steps),
  };

  const completedCount = Object.values(completionMap).filter(Boolean).length;

  // Missing data & abnormal markers
  const missingFlags = useMemo(() => getMissingDataFlags(form), [form]);
  const abnormalMarkers = useMemo(() => getAbnormalMarkers(form), [form]);

  // Save / Submit
  const handleSave = () => {
    setSaveStatus('saving');
    const payload = { ...form, updated_at: new Date().toISOString() };
    if (id) {
      updateMutation.mutate(payload, {
        onSuccess: () => {
          setLastSaved(new Date().toISOString());
          setSaveStatus('saved');
        }
      });
    } else {
       createMutation.mutate(payload, {
         onSuccess: (newDoc) => {
           navigate(`/consultations/${newDoc.id}/edit`);
           setLastSaved(new Date().toISOString());
           setSaveStatus('saved');
         }
       });
    }
  };

  const handleSubmit = () => {
    const payload = { ...form, status: 'completed', updated_at: new Date().toISOString() };
    if (id) {
      updateMutation.mutate(payload, {
        onSuccess: () => {
          setSaveStatus('saved');
          setLastSaved(new Date().toISOString());
          navigate('/consultations');
        }
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          setSaveStatus('saved');
          navigate('/consultations');
        }
      })
    }
  };

  // Section navigation
  const sectionIndex = CONSULTATION_SECTIONS.findIndex((s) => s.id === activeSection);
  const goNext = () => {
    if (sectionIndex < CONSULTATION_SECTIONS.length - 1) {
      setActiveSection(CONSULTATION_SECTIONS[sectionIndex + 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  const goPrev = () => {
    if (sectionIndex > 0) {
      setActiveSection(CONSULTATION_SECTIONS[sectionIndex - 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <TopBar
        title="Consultation Form"
        subtitle={client?.name || 'New Consultation'}
        actions={
          <div className="flex items-center gap-3">
            <AutoSaveIndicator status={saveStatus} lastSaved={lastSaved} />
            <Badge variant={form.status === 'completed' ? 'teal' : 'amber'}>
              {form.status === 'completed' ? 'Completed' : 'Draft'}
            </Badge>
            <Button variant="secondary" size="sm" icon={<Download className="w-4 h-4" />} onClick={() => exportConsultationPDF(form)}>
              PDF
            </Button>
            <Button variant="secondary" size="sm" icon={<Save className="w-4 h-4" />} onClick={handleSave}>
              Save Draft
            </Button>
            <Button size="sm" icon={<CheckCircle className="w-4 h-4" />} onClick={handleSubmit} disabled={!form.consent_given}>
              Submit
            </Button>
          </div>
        }
      />

      <PageWrapper className="!max-w-none">
        {/* Back */}
        <button
          onClick={() => navigate(client ? `/clients/${client.id}` : '/clients')}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to {client?.name || 'Clients'}
        </button>

        <div className="flex gap-6">
          {/* Left Sidebar — Section Nav */}
          <div className="w-72 flex-shrink-0 hidden lg:block">
            <div className="sticky top-6 space-y-4">
              {/* Progress */}
              <Card hover={false}>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-display font-semibold text-text-secondary uppercase">Progress</p>
                    <span className="text-xs font-display font-bold text-brand-primary">{completedCount}/7</span>
                  </div>
                  <div className="w-full h-1.5 bg-bg-input rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-brand-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(completedCount / 7) * 100}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                </div>
              </Card>

              <Card hover={false}>
                <div className="p-3">
                  <SectionNav
                    sections={CONSULTATION_SECTIONS}
                    activeSection={activeSection}
                    onSelect={setActiveSection}
                    completionMap={completionMap}
                  />
                </div>
              </Card>

              {/* Consent */}
              <ConsentCheckbox
                checked={form.consent_given}
                onChange={(checked) => {
                  setForm((prev) => ({
                    ...prev,
                    consent_given: checked,
                    consent_timestamp: checked ? new Date().toISOString() : undefined,
                  }));
                  triggerAutoSave();
                }}
                timestamp={form.consent_timestamp}
              />

              {/* Missing Data Flags */}
              <MissingDataPanel
                flags={missingFlags}
                onNavigate={(sectionId) => setActiveSection(sectionId as ConsultationFormSection)}
              />

              {/* Summary & PDF */}
              <SummaryPanel form={form} />

              {/* Audit Trail */}
              <AuditTrailPanel form={form} />
            </div>
          </div>

          {/* Main Form Area */}
          <div className="flex-1 min-w-0 space-y-6 pb-12">
            {/* ── A. Medical & Health History ── */}
            {activeSection === 'medical' && (
              <motion.div key="medical" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <FormSection
                  title="A. Medical & Health History"
                  description="Previous diagnoses, symptoms, allergies, medications"
                  icon={<HeartPulse className="w-5 h-5" />}
                  isComplete={completionMap.medical}
                >
                  <TextAreaField
                    label="Previous Diagnoses"
                    placeholder="List any previous medical diagnoses..."
                    value={form.medical_history.previous_diagnoses}
                    onChange={(e) => updateMedical('previous_diagnoses', e.target.value)}
                  />
                  <TextAreaField
                    label="Current Symptoms"
                    placeholder="Describe current symptoms the client is experiencing..."
                    value={form.medical_history.current_symptoms}
                    onChange={(e) => updateMedical('current_symptoms', e.target.value)}
                  />
                  <CheckboxGroup
                    label="Digestive Issues"
                    options={DIGESTIVE_OPTIONS}
                    selected={form.medical_history.digestive_issues}
                    onChange={(val) => updateMedical('digestive_issues', val)}
                    columns={3}
                  />
                  <TextAreaField
                    label="Allergies & Intolerances"
                    placeholder="Food allergies, intolerances, sensitivities..."
                    value={form.medical_history.allergies_intolerances}
                    onChange={(e) => updateMedical('allergies_intolerances', e.target.value)}
                  />
                  <TextAreaField
                    label="Family History"
                    placeholder="Relevant family medical history..."
                    value={form.medical_history.family_history}
                    onChange={(e) => updateMedical('family_history', e.target.value)}
                  />
                  <TextAreaField
                    label="Medication History"
                    placeholder="Current and past medications (name, dosage, duration)..."
                    value={form.medical_history.medication_history}
                    onChange={(e) => updateMedical('medication_history', e.target.value)}
                  />
                  <TextAreaField
                    label="Previous Surgeries or Major Illnesses"
                    placeholder="Any surgical history or major illnesses..."
                    value={form.medical_history.previous_surgeries}
                    onChange={(e) => updateMedical('previous_surgeries', e.target.value)}
                  />
                </FormSection>
              </motion.div>
            )}

            {/* ── B. Lifestyle & Behaviour ── */}
            {activeSection === 'lifestyle' && (
              <motion.div key="lifestyle" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <FormSection
                  title="B. Lifestyle & Behaviour"
                  description="Sleep, stress, activity, habits"
                  icon={<Brain className="w-5 h-5" />}
                  isComplete={completionMap.lifestyle}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <NumberField
                      label="Sleep (hours/night)"
                      value={form.lifestyle.sleep_hours}
                      onChange={(val) => updateLifestyle('sleep_hours', val)}
                      placeholder="e.g. 7"
                      min={0}
                      max={24}
                      step={0.5}
                      unit="hrs"
                    />
                    <SelectField
                      label="Sleep Quality"
                      value={form.lifestyle.sleep_quality}
                      onChange={(e) => updateLifestyle('sleep_quality', e.target.value)}
                      options={[
                        { value: 'low', label: 'Poor' },
                        { value: 'moderate', label: 'Moderate' },
                        { value: 'high', label: 'Good' },
                      ]}
                      placeholder="Select..."
                    />
                    <SelectField
                      label="Stress Level"
                      value={form.lifestyle.stress_level}
                      onChange={(e) => updateLifestyle('stress_level', e.target.value)}
                      options={[
                        { value: 'low', label: 'Low' },
                        { value: 'moderate', label: 'Moderate' },
                        { value: 'high', label: 'High' },
                      ]}
                      placeholder="Select..."
                    />
                    <SelectField
                      label="Energy Level"
                      value={form.lifestyle.energy_level}
                      onChange={(e) => updateLifestyle('energy_level', e.target.value)}
                      options={[
                        { value: 'low', label: 'Low' },
                        { value: 'moderate', label: 'Moderate' },
                        { value: 'high', label: 'High' },
                      ]}
                      placeholder="Select..."
                    />
                    <SelectField
                      label="Smoking"
                      value={form.lifestyle.smoking}
                      onChange={(e) => updateLifestyle('smoking', e.target.value)}
                      options={[
                        { value: 'none', label: 'None' },
                        { value: 'occasional', label: 'Occasional' },
                        { value: 'regular', label: 'Regular' },
                        { value: 'heavy', label: 'Heavy' },
                      ]}
                      placeholder="Select..."
                    />
                    <SelectField
                      label="Alcohol"
                      value={form.lifestyle.alcohol}
                      onChange={(e) => updateLifestyle('alcohol', e.target.value)}
                      options={[
                        { value: 'none', label: 'None' },
                        { value: 'occasional', label: 'Occasional' },
                        { value: 'regular', label: 'Regular' },
                        { value: 'heavy', label: 'Heavy' },
                      ]}
                      placeholder="Select..."
                    />
                    <NumberField
                      label="Water Intake"
                      value={form.lifestyle.water_intake_litres}
                      onChange={(val) => updateLifestyle('water_intake_litres', val)}
                      placeholder="e.g. 2.5"
                      min={0}
                      max={10}
                      step={0.5}
                      unit="litres"
                    />
                  </div>
                  <TextAreaField
                    label="Physical Activity"
                    placeholder="Describe exercise routine, frequency, duration..."
                    value={form.lifestyle.physical_activity}
                    onChange={(e) => updateLifestyle('physical_activity', e.target.value)}
                  />
                  <TextAreaField
                    label="Work Schedule"
                    placeholder="Work pattern, typical day structure..."
                    value={form.lifestyle.work_schedule}
                    onChange={(e) => updateLifestyle('work_schedule', e.target.value)}
                  />
                </FormSection>
              </motion.div>
            )}

            {/* ── C. Nutrition History ── */}
            {activeSection === 'nutrition' && (
              <motion.div key="nutrition" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <FormSection
                  title="C. Nutrition History"
                  description="Past diets, cravings, preferences"
                  icon={<Apple className="w-5 h-5" />}
                  isComplete={completionMap.nutrition}
                >
                  <TextAreaField
                    label="Past Diets Followed"
                    placeholder="Keto, IF, low-carb, calorie counting, etc..."
                    value={form.nutrition_history.past_diets}
                    onChange={(e) => updateNutrition('past_diets', e.target.value)}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextAreaField
                      label="What Worked"
                      placeholder="Approaches that were effective..."
                      value={form.nutrition_history.what_worked}
                      onChange={(e) => updateNutrition('what_worked', e.target.value)}
                    />
                    <TextAreaField
                      label="What Didn't Work"
                      placeholder="Approaches that were unsuccessful..."
                      value={form.nutrition_history.what_didnt_work}
                      onChange={(e) => updateNutrition('what_didnt_work', e.target.value)}
                    />
                  </div>
                  <TextAreaField
                    label="Meal Timings"
                    placeholder="Breakfast, lunch, dinner times and snacking patterns..."
                    value={form.nutrition_history.meal_timings}
                    onChange={(e) => updateNutrition('meal_timings', e.target.value)}
                  />
                  <TextAreaField
                    label="Cravings"
                    placeholder="Common food cravings, triggers..."
                    value={form.nutrition_history.cravings}
                    onChange={(e) => updateNutrition('cravings', e.target.value)}
                  />
                  <TextAreaField
                    label="Emotional / Binge Eating"
                    placeholder="Patterns, triggers, coping mechanisms..."
                    value={form.nutrition_history.emotional_eating}
                    onChange={(e) => updateNutrition('emotional_eating', e.target.value)}
                  />
                  <TextAreaField
                    label="Cultural Food Preferences"
                    placeholder="Regional cuisine, traditional foods, cooking style..."
                    value={form.nutrition_history.cultural_preferences}
                    onChange={(e) => updateNutrition('cultural_preferences', e.target.value)}
                  />
                  <TextAreaField
                    label="Food Aversions"
                    placeholder="Foods the client dislikes or refuses to eat..."
                    value={form.nutrition_history.food_aversions}
                    onChange={(e) => updateNutrition('food_aversions', e.target.value)}
                  />
                </FormSection>
              </motion.div>
            )}

            {/* ── D. Supplements & Treatments ── */}
            {activeSection === 'supplements' && (
              <motion.div key="supplements" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <FormSection
                  title="D. Supplements & Treatments"
                  description="Current and past supplements"
                  icon={<Pill className="w-5 h-5" />}
                  isComplete={completionMap.supplements}
                >
                  <SupplementRow
                    supplements={form.supplements.supplements}
                    onChange={(sups) => updateSupplements('supplements', sups)}
                  />
                  <TextAreaField
                    label="Other Treatments or Programmes"
                    placeholder="Ayurveda, homeopathy, physiotherapy, wellness programs..."
                    value={form.supplements.other_treatments}
                    onChange={(e) => updateSupplements('other_treatments', e.target.value)}
                  />
                </FormSection>
              </motion.div>
            )}

            {/* ── E. Blood Reports & Tests ── */}
            {activeSection === 'blood_reports' && (
              <motion.div key="blood_reports" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <FormSection
                  title="E. Blood Reports & Test Results"
                  description="Upload reports, enter key markers"
                  icon={<FileText className="w-5 h-5" />}
                  isComplete={completionMap.blood_reports}
                >
                  <FormField label="Upload Reports" hint="Upload blood reports, scans, prescriptions">
                    <FileUploadZone
                      files={form.blood_reports.files}
                      onAdd={(newFiles) =>
                        updateBloodReports('files', [...form.blood_reports.files, ...newFiles])
                      }
                      onRemove={(fileId) =>
                        updateBloodReports('files', form.blood_reports.files.filter((f) => f.id !== fileId))
                      }
                    />
                  </FormField>

                  <FormField label="Test Date">
                    <input
                      type="date"
                      value={form.blood_reports.test_date}
                      onChange={(e) => updateBloodReports('test_date', e.target.value)}
                      className="w-full max-w-xs bg-bg-input border border-border-subtle rounded-md px-3.5 py-2.5 text-sm font-body text-text-primary focus:border-brand-primary focus:outline-none transition-colors"
                    />
                  </FormField>

                  <FormField label="Blood Markers" hint="Add markers manually or use quick-add presets">
                    <BloodMarkerInput
                      markers={form.blood_reports.markers}
                      onChange={(markers) => updateBloodReports('markers', markers)}
                    />
                  </FormField>

                  {abnormalMarkers.length > 0 && (
                    <div className="bg-accent-amber/5 border border-accent-amber/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-4 h-4 text-accent-amber" />
                        <h4 className="text-sm font-semibold text-accent-amber">Abnormal Markers Detected</h4>
                      </div>
                      <div className="space-y-3">
                        {abnormalMarkers.map((marker, idx) => (
                          <div key={idx} className="text-sm">
                            <span className="font-medium text-text-primary">{marker.marker_name}</span>
                            <span className="text-text-muted mx-2">—</span>
                            <span className={`font-semibold ${
                              marker.status === 'critical' ? 'text-accent-rose' :
                              marker.status === 'high' ? 'text-accent-amber' : 'text-accent-blue'
                            }`}>
                              {marker.value} {marker.unit} ({marker.status.toUpperCase()})
                            </span>
                            <p className="text-xs text-text-secondary mt-1 bg-white/60 p-2 rounded border border-border-subtle">{marker.recommendation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <TextAreaField
                    label="Comments"
                    placeholder="Nutritionist observations on blood report results..."
                    value={form.blood_reports.comments}
                    onChange={(e) => updateBloodReports('comments', e.target.value)}
                  />
                </FormSection>
              </motion.div>
            )}

            {/* ── F. Goals & Constraints ── */}
            {activeSection === 'goals' && (
              <motion.div key="goals" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <FormSection
                  title="F. Goals & Constraints"
                  description="Weight, health, budget, restrictions"
                  icon={<Target className="w-5 h-5" />}
                  isComplete={completionMap.goals}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextAreaField
                      label="Weight Goals"
                      placeholder="Target weight, timeline, approach..."
                      value={form.goals.weight_goals}
                      onChange={(e) => updateGoals('weight_goals', e.target.value)}
                    />
                    <TextAreaField
                      label="Health Goals"
                      placeholder="Specific health outcomes desired..."
                      value={form.goals.health_goals}
                      onChange={(e) => updateGoals('health_goals', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <TextAreaField
                      label="Budget"
                      placeholder="Monthly food & supplement budget..."
                      value={form.goals.budget}
                      onChange={(e) => updateGoals('budget', e.target.value)}
                    />
                    <SelectField
                      label="Cooking Ability"
                      value={form.goals.cooking_ability}
                      onChange={(e) => updateGoals('cooking_ability', e.target.value)}
                      options={[
                        { value: 'beginner', label: 'Beginner' },
                        { value: 'intermediate', label: 'Intermediate' },
                        { value: 'advanced', label: 'Advanced' },
                      ]}
                      placeholder="Select..."
                    />
                    <TextAreaField
                      label="Time Available for Cooking"
                      placeholder="Daily time for meal prep..."
                      value={form.goals.time_available}
                      onChange={(e) => updateGoals('time_available', e.target.value)}
                    />
                  </div>
                  <TextAreaField
                    label="Family / Household Context"
                    placeholder="Who they cook for, family dietary needs..."
                    value={form.goals.family_context}
                    onChange={(e) => updateGoals('family_context', e.target.value)}
                  />
                  <CheckboxGroup
                    label="Dietary Restrictions"
                    options={DIETARY_RESTRICTION_OPTIONS}
                    selected={form.goals.dietary_restrictions}
                    onChange={(val) => updateGoals('dietary_restrictions', val)}
                    columns={3}
                  />
                </FormSection>
              </motion.div>
            )}

            {/* ── G. Consultation Notes & Plan ── */}
            {activeSection === 'plan' && (
              <motion.div key="plan" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <FormSection
                  title="G. Consultation Notes & Plan"
                  description="Notes, next steps, follow-up"
                  icon={<ClipboardList className="w-5 h-5" />}
                  isComplete={completionMap.plan}
                >
                  <TextAreaField
                    label="Free Text Notes"
                    placeholder="General consultation notes..."
                    value={form.plan.free_notes}
                    onChange={(e) => updatePlan('free_notes', e.target.value)}
                    className="!min-h-[120px]"
                  />
                  <TextAreaField
                    label="Priority Issues"
                    placeholder="Numbered list of priority issues to address..."
                    value={form.plan.priority_issues}
                    onChange={(e) => updatePlan('priority_issues', e.target.value)}
                  />
                  <TextAreaField
                    label="Agreed Next Steps"
                    placeholder="Action items agreed upon with client..."
                    value={form.plan.next_steps}
                    onChange={(e) => updatePlan('next_steps', e.target.value)}
                  />
                  <FormField label="Follow-up Date">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-text-muted" />
                      <input
                        type="date"
                        value={form.plan.follow_up_date}
                        onChange={(e) => updatePlan('follow_up_date', e.target.value)}
                        className="bg-bg-input border border-border-subtle rounded-md px-3.5 py-2.5 text-sm font-body text-text-primary focus:border-brand-primary focus:outline-none transition-colors"
                      />
                    </div>
                  </FormField>
                  <div className="relative">
                    <TextAreaField
                      label="Internal Notes (not visible to client)"
                      placeholder="Private notes for internal reference only..."
                      value={form.plan.internal_notes}
                      onChange={(e) => updatePlan('internal_notes', e.target.value)}
                    />
                    <div className="absolute top-0 right-0">
                      <Badge variant="rose" size="sm">Internal only</Badge>
                    </div>
                  </div>
                </FormSection>
              </motion.div>
            )}

            {/* Section Navigation Buttons */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={goPrev}
                disabled={sectionIndex === 0}
              >
                ← Previous Section
              </Button>
              <p className="text-xs text-text-muted font-display">
                Section {sectionIndex + 1} of {CONSULTATION_SECTIONS.length}
              </p>
              {sectionIndex < CONSULTATION_SECTIONS.length - 1 ? (
                <Button variant="secondary" size="sm" onClick={goNext}>
                  Next Section →
                </Button>
              ) : (
                <Button
                  size="sm"
                  icon={<CheckCircle className="w-4 h-4" />}
                  onClick={handleSubmit}
                  disabled={!form.consent_given}
                >
                  Submit Consultation
                </Button>
              )}
            </div>
          </div>
        </div>
      </PageWrapper>
    </>
  );
}
