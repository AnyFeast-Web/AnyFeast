import type { FullConsultationForm } from '../types/consultationForm.types';

// ── Missing Data Flags ──
export interface MissingDataFlag {
  section: string;
  sectionId: string;
  field: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
}

export function getMissingDataFlags(form: FullConsultationForm): MissingDataFlag[] {
  const flags: MissingDataFlag[] = [];

  // A. Medical
  if (!form.medical_history.previous_diagnoses && !form.medical_history.current_symptoms) {
    flags.push({ section: 'Medical & Health History', sectionId: 'medical', field: 'diagnoses/symptoms', severity: 'critical', message: 'No medical history or symptoms recorded' });
  }
  if (!form.medical_history.allergies_intolerances) {
    flags.push({ section: 'Medical & Health History', sectionId: 'medical', field: 'allergies', severity: 'warning', message: 'Allergies & intolerances not recorded — risk of adverse reactions' });
  }
  if (!form.medical_history.medication_history) {
    flags.push({ section: 'Medical & Health History', sectionId: 'medical', field: 'medications', severity: 'warning', message: 'Medication history not recorded — potential supplement interactions' });
  }

  // B. Lifestyle
  if (!form.lifestyle.sleep_hours && !form.lifestyle.sleep_quality) {
    flags.push({ section: 'Lifestyle & Behaviour', sectionId: 'lifestyle', field: 'sleep', severity: 'info', message: 'Sleep data not recorded' });
  }
  if (!form.lifestyle.physical_activity) {
    flags.push({ section: 'Lifestyle & Behaviour', sectionId: 'lifestyle', field: 'activity', severity: 'warning', message: 'Physical activity not recorded — needed for TDEE calculation' });
  }

  // C. Nutrition
  if (!form.nutrition_history.meal_timings) {
    flags.push({ section: 'Nutrition History', sectionId: 'nutrition', field: 'meal_timings', severity: 'warning', message: 'Meal timings not recorded' });
  }

  // E. Blood Reports
  if (form.blood_reports.markers.length === 0 && form.blood_reports.files.length === 0) {
    flags.push({ section: 'Blood Reports & Tests', sectionId: 'blood_reports', field: 'markers', severity: 'info', message: 'No blood test results uploaded or entered' });
  }
  if (!form.blood_reports.test_date && form.blood_reports.markers.length > 0) {
    flags.push({ section: 'Blood Reports & Tests', sectionId: 'blood_reports', field: 'test_date', severity: 'warning', message: 'Blood test date not recorded' });
  }

  // F. Goals
  if (!form.goals.weight_goals && !form.goals.health_goals) {
    flags.push({ section: 'Goals & Constraints', sectionId: 'goals', field: 'goals', severity: 'critical', message: 'No goals set — consultation plan cannot address specific outcomes' });
  }

  // G. Plan
  if (!form.plan.next_steps) {
    flags.push({ section: 'Consultation Notes & Plan', sectionId: 'plan', field: 'next_steps', severity: 'critical', message: 'No next steps defined — client has no action items' });
  }
  if (!form.plan.follow_up_date) {
    flags.push({ section: 'Consultation Notes & Plan', sectionId: 'plan', field: 'follow_up_date', severity: 'warning', message: 'Follow-up date not set' });
  }

  // Consent
  if (!form.consent_given) {
    flags.push({ section: 'Consent', sectionId: 'medical', field: 'consent', severity: 'critical', message: 'Medical data consent not obtained' });
  }

  return flags;
}

// ── Abnormal Blood Marker Detection ──
export interface AbnormalMarker {
  marker_name: string;
  value: string;
  unit: string;
  status: 'low' | 'high' | 'critical';
  reference_range: string;
  recommendation: string;
}

const MARKER_RECOMMENDATIONS: Record<string, Record<string, string>> = {
  'TSH': {
    high: 'Elevated TSH may indicate hypothyroidism. Consider thyroid-supportive nutrients (selenium, zinc, iodine). Refer to endocrinologist.',
    low: 'Low TSH may indicate hyperthyroidism. Urgent referral to endocrinologist recommended.',
  },
  'HbA1c': {
    high: 'Elevated HbA1c indicates poor blood sugar control. Focus on low-GI foods, fiber-rich diet, portion control.',
    critical: 'HbA1c critically elevated — diabetes management needs review. Urgent medical referral.',
  },
  'Vitamin D': {
    low: 'Vitamin D deficiency. Consider supplementation (D3 + K2). Recommend sun exposure and fatty fish.',
  },
  'Vitamin B12': {
    low: 'B12 deficiency — common in vegetarians. Consider methylcobalamin supplement. Include dairy, eggs, fortified foods.',
  },
  'Iron (Serum)': {
    low: 'Low iron levels. Include iron-rich foods (spinach, lentils, red meat). Consider iron supplementation with vitamin C.',
  },
  'Ferritin': {
    low: 'Low ferritin indicates depleted iron stores. Iron supplementation recommended. Avoid tea/coffee with meals.',
  },
  'Fasting Glucose': {
    high: 'Elevated fasting glucose. Pre-diabetic or diabetic range. Reduce refined carbs, increase fiber.',
  },
  'Total Cholesterol': {
    high: 'Elevated cholesterol. Increase soluble fiber (oats, barley), omega-3 fatty acids. Reduce saturated fats.',
  },
  'LDL': {
    high: 'High LDL ("bad" cholesterol). Mediterranean diet pattern recommended. Increase plant sterols.',
  },
  'Triglycerides': {
    high: 'Elevated triglycerides. Reduce sugar, refined carbs, alcohol. Increase omega-3 fatty acids.',
  },
  'Creatinine': {
    high: 'Elevated creatinine may indicate kidney stress. Monitor protein intake. Hydration check.',
  },
  'Uric Acid': {
    high: 'Elevated uric acid — risk of gout. Reduce purine-rich foods (organ meats, shellfish). Increase hydration.',
  },
};

export function getAbnormalMarkers(form: FullConsultationForm): AbnormalMarker[] {
  return form.blood_reports.markers
    .filter((m) => m.status === 'low' || m.status === 'high' || m.status === 'critical')
    .map((m) => ({
      marker_name: m.marker_name,
      value: m.value,
      unit: m.unit,
      status: m.status as 'low' | 'high' | 'critical',
      reference_range: m.reference_range,
      recommendation:
        MARKER_RECOMMENDATIONS[m.marker_name]?.[m.status] ||
        `${m.marker_name} is ${m.status} (value: ${m.value} ${m.unit}, ref: ${m.reference_range}). Review and advise.`,
    }));
}

// ── Generate Summary Note ──
export function generateConsultationSummary(form: FullConsultationForm): string {
  const lines: string[] = [];

  lines.push(`CONSULTATION SUMMARY`);
  lines.push(`${'═'.repeat(50)}`);
  lines.push(`Client: ${form.client_name}`);
  lines.push(`Nutritionist: ${form.nutritionist_name}`);
  lines.push(`Date: ${new Date(form.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`);
  lines.push(`Status: ${form.status.toUpperCase()}`);
  lines.push('');

  // Medical summary
  if (form.medical_history.previous_diagnoses) {
    lines.push(`MEDICAL HISTORY`);
    lines.push(`Diagnoses: ${form.medical_history.previous_diagnoses}`);
    if (form.medical_history.current_symptoms) lines.push(`Current symptoms: ${form.medical_history.current_symptoms}`);
    if (form.medical_history.allergies_intolerances) lines.push(`Allergies: ${form.medical_history.allergies_intolerances}`);
    if (form.medical_history.medication_history) lines.push(`Medications: ${form.medical_history.medication_history}`);
    lines.push('');
  }

  // Lifestyle summary
  const lifestyle: string[] = [];
  if (form.lifestyle.sleep_hours) lifestyle.push(`Sleep: ${form.lifestyle.sleep_hours}h (${form.lifestyle.sleep_quality || 'quality unknown'})`);
  if (form.lifestyle.stress_level) lifestyle.push(`Stress: ${form.lifestyle.stress_level}`);
  if (form.lifestyle.energy_level) lifestyle.push(`Energy: ${form.lifestyle.energy_level}`);
  if (form.lifestyle.physical_activity) lifestyle.push(`Activity: ${form.lifestyle.physical_activity}`);
  if (form.lifestyle.water_intake_litres) lifestyle.push(`Water: ${form.lifestyle.water_intake_litres}L/day`);
  if (lifestyle.length > 0) {
    lines.push(`LIFESTYLE`);
    lifestyle.forEach((l) => lines.push(`• ${l}`));
    lines.push('');
  }

  // Abnormal blood markers
  const abnormal = getAbnormalMarkers(form);
  if (abnormal.length > 0) {
    lines.push(`ABNORMAL BLOOD MARKERS`);
    abnormal.forEach((m) => {
      lines.push(`⚠ ${m.marker_name}: ${m.value} ${m.unit} (${m.status.toUpperCase()}, ref: ${m.reference_range})`);
      lines.push(`  → ${m.recommendation}`);
    });
    lines.push('');
  }

  // Supplements
  if (form.supplements.supplements.length > 0) {
    lines.push(`CURRENT SUPPLEMENTS`);
    form.supplements.supplements.filter((s) => s.is_current).forEach((s) => {
      lines.push(`• ${s.name} — ${s.dosage}, ${s.frequency} (${s.reason})`);
    });
    lines.push('');
  }

  // Goals
  if (form.goals.weight_goals || form.goals.health_goals) {
    lines.push(`GOALS`);
    if (form.goals.weight_goals) lines.push(`Weight: ${form.goals.weight_goals}`);
    if (form.goals.health_goals) lines.push(`Health: ${form.goals.health_goals}`);
    lines.push('');
  }

  // Plan
  if (form.plan.priority_issues) {
    lines.push(`PRIORITY ISSUES`);
    lines.push(form.plan.priority_issues);
    lines.push('');
  }
  if (form.plan.next_steps) {
    lines.push(`NEXT STEPS`);
    lines.push(form.plan.next_steps);
    lines.push('');
  }
  if (form.plan.follow_up_date) {
    lines.push(`FOLLOW-UP: ${new Date(form.plan.follow_up_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`);
  }

  // Missing data warnings
  const missing = getMissingDataFlags(form).filter((f) => f.severity === 'critical');
  if (missing.length > 0) {
    lines.push('');
    lines.push(`⚠ MISSING CRITICAL DATA`);
    missing.forEach((f) => lines.push(`• ${f.message}`));
  }

  return lines.join('\n');
}

// ── Export PDF (browser print) ──
export function exportConsultationPDF(form: FullConsultationForm): void {
  const summary = generateConsultationSummary(form);
  const abnormal = getAbnormalMarkers(form);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Consultation Report — ${form.client_name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'IBM Plex Sans', sans-serif; color: #0f172a; padding: 40px; font-size: 13px; line-height: 1.6; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #16a34a; padding-bottom: 16px; margin-bottom: 24px; }
    .header h1 { font-family: 'DM Sans', sans-serif; font-size: 22px; font-weight: 700; color: #16a34a; }
    .header .meta { text-align: right; font-size: 12px; color: #475569; }
    .header .meta strong { color: #0f172a; }
    .section { margin-bottom: 20px; }
    .section h2 { font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; color: #16a34a; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px; }
    .section p, .section li { font-size: 13px; margin-bottom: 4px; }
    .section ul { padding-left: 20px; }
    .marker-table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 12px; }
    .marker-table th { background: #f1f5f9; text-align: left; padding: 6px 10px; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 11px; text-transform: uppercase; color: #475569; }
    .marker-table td { padding: 6px 10px; border-bottom: 1px solid #e2e8f0; }
    .status-high { color: #d97706; font-weight: 600; }
    .status-low { color: #2563eb; font-weight: 600; }
    .status-critical { color: #dc2626; font-weight: 700; }
    .status-normal { color: #16a34a; }
    .warning-box { background: #fefce8; border: 1px solid #fde047; border-radius: 6px; padding: 10px 14px; margin: 8px 0; font-size: 12px; }
    .warning-box strong { color: #a16207; }
    .recommendation { font-size: 11px; color: #475569; padding-left: 16px; font-style: italic; margin-bottom: 6px; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
    @media print { body { padding: 20px; } @page { margin: 15mm; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>NutriPro — Consultation Report</h1>
      <p style="font-size:11px; color:#64748b; margin-top:4px;">Structured Consultation Document</p>
    </div>
    <div class="meta">
      <p><strong>${form.client_name}</strong></p>
      <p>Nutritionist: ${form.nutritionist_name}</p>
      <p>Date: ${new Date(form.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      <p>Status: ${form.status.toUpperCase()}</p>
    </div>
  </div>

  ${form.medical_history.previous_diagnoses ? `
  <div class="section">
    <h2>A. Medical & Health History</h2>
    <p><strong>Diagnoses:</strong> ${form.medical_history.previous_diagnoses}</p>
    ${form.medical_history.current_symptoms ? `<p><strong>Symptoms:</strong> ${form.medical_history.current_symptoms}</p>` : ''}
    ${form.medical_history.digestive_issues.length > 0 ? `<p><strong>Digestive issues:</strong> ${form.medical_history.digestive_issues.join(', ')}</p>` : ''}
    ${form.medical_history.allergies_intolerances ? `<p><strong>Allergies:</strong> ${form.medical_history.allergies_intolerances}</p>` : ''}
    ${form.medical_history.medication_history ? `<p><strong>Medications:</strong> ${form.medical_history.medication_history}</p>` : ''}
  </div>` : ''}

  ${(form.lifestyle.sleep_hours || form.lifestyle.physical_activity) ? `
  <div class="section">
    <h2>B. Lifestyle & Behaviour</h2>
    <ul>
      ${form.lifestyle.sleep_hours ? `<li>Sleep: ${form.lifestyle.sleep_hours}h/night (${form.lifestyle.sleep_quality || '—'})</li>` : ''}
      ${form.lifestyle.stress_level ? `<li>Stress: ${form.lifestyle.stress_level}</li>` : ''}
      ${form.lifestyle.energy_level ? `<li>Energy: ${form.lifestyle.energy_level}</li>` : ''}
      ${form.lifestyle.physical_activity ? `<li>Activity: ${form.lifestyle.physical_activity}</li>` : ''}
      ${form.lifestyle.water_intake_litres ? `<li>Water: ${form.lifestyle.water_intake_litres}L/day</li>` : ''}
      ${form.lifestyle.smoking && form.lifestyle.smoking !== 'none' ? `<li>Smoking: ${form.lifestyle.smoking}</li>` : ''}
      ${form.lifestyle.alcohol && form.lifestyle.alcohol !== 'none' ? `<li>Alcohol: ${form.lifestyle.alcohol}</li>` : ''}
    </ul>
  </div>` : ''}

  ${form.blood_reports.markers.length > 0 ? `
  <div class="section">
    <h2>E. Blood Reports & Test Results</h2>
    ${form.blood_reports.test_date ? `<p><strong>Test date:</strong> ${new Date(form.blood_reports.test_date).toLocaleDateString('en-GB')}</p>` : ''}
    <table class="marker-table">
      <thead><tr><th>Marker</th><th>Value</th><th>Ref. Range</th><th>Status</th></tr></thead>
      <tbody>
        ${form.blood_reports.markers.map((m) => `
          <tr>
            <td>${m.marker_name}</td>
            <td>${m.value} ${m.unit}</td>
            <td>${m.reference_range}</td>
            <td class="status-${m.status || 'normal'}">${m.status ? m.status.toUpperCase() : '—'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    ${abnormal.length > 0 ? `
      <div class="warning-box">
        <strong>⚠ Abnormal Values Detected</strong>
        ${abnormal.map((a) => `<p style="margin:4px 0 0 0;">• ${a.marker_name}: ${a.value} ${a.unit} (${a.status})</p><p class="recommendation">→ ${a.recommendation}</p>`).join('')}
      </div>
    ` : ''}
    ${form.blood_reports.comments ? `<p style="margin-top:8px;"><strong>Comments:</strong> ${form.blood_reports.comments}</p>` : ''}
  </div>` : ''}

  ${form.supplements.supplements.length > 0 ? `
  <div class="section">
    <h2>D. Supplements</h2>
    <ul>
      ${form.supplements.supplements.map((s) => `<li><strong>${s.name}</strong> (${s.brand}) — ${s.dosage}, ${s.frequency}. ${s.is_current ? 'Currently taking.' : 'Previously taken.'} ${s.reason ? `Reason: ${s.reason}` : ''}</li>`).join('')}
    </ul>
  </div>` : ''}

  ${(form.goals.weight_goals || form.goals.health_goals) ? `
  <div class="section">
    <h2>F. Goals & Constraints</h2>
    ${form.goals.weight_goals ? `<p><strong>Weight goals:</strong> ${form.goals.weight_goals}</p>` : ''}
    ${form.goals.health_goals ? `<p><strong>Health goals:</strong> ${form.goals.health_goals}</p>` : ''}
    ${form.goals.budget ? `<p><strong>Budget:</strong> ${form.goals.budget}</p>` : ''}
    ${form.goals.cooking_ability ? `<p><strong>Cooking ability:</strong> ${form.goals.cooking_ability}</p>` : ''}
    ${form.goals.dietary_restrictions.length > 0 ? `<p><strong>Restrictions:</strong> ${form.goals.dietary_restrictions.join(', ')}</p>` : ''}
  </div>` : ''}

  ${(form.plan.priority_issues || form.plan.next_steps) ? `
  <div class="section">
    <h2>G. Consultation Plan</h2>
    ${form.plan.free_notes ? `<p>${form.plan.free_notes}</p>` : ''}
    ${form.plan.priority_issues ? `<p style="margin-top:8px;"><strong>Priority issues:</strong></p><p style="white-space:pre-line;">${form.plan.priority_issues}</p>` : ''}
    ${form.plan.next_steps ? `<p style="margin-top:8px;"><strong>Next steps:</strong></p><p style="white-space:pre-line;">${form.plan.next_steps}</p>` : ''}
    ${form.plan.follow_up_date ? `<p style="margin-top:8px;"><strong>Follow-up:</strong> ${new Date(form.plan.follow_up_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>` : ''}
  </div>` : ''}

  <div class="footer">
    Generated by NutriPro · ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} · 
    ${form.nutritionist_name} · Confidential — For professional use only
  </div>
</body>
</html>`;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  }
}
