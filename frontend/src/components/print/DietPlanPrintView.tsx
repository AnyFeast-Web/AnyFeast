import {
  Sun, UtensilsCrossed, Moon, Coffee,
  CheckCircle, XCircle, Info
} from 'lucide-react';
import { Letterhead } from './Letterhead';

/* ── Types ─────────────────────────────────────────────────────── */
interface MealData {
  name: string;
  servingSize: string;
  prepTime: string;
  cookTime: string;
  intakeTime: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  prepTips: string;
  alternatives: string;
}

interface Preferences {
  dietType: string;
  primaryGoal: string;
  allergies: string;
  medicalConditions: string;
}

interface DietPlanPrintViewProps {
  mealPlan: Record<string, Record<string, MealData>>;
  preferences: Preferences;
  guidelines: string;
  title?: string;
}

/* ── Helpers ───────────────────────────────────────────────────── */
const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as const;
const DAYS  = ['Daily'] as const;

const MEAL_ICONS: Record<string, React.ReactNode> = {
  Breakfast: <Sun className="w-3.5 h-3.5" />,
  Lunch:     <UtensilsCrossed className="w-3.5 h-3.5" />,
  Dinner:    <Moon className="w-3.5 h-3.5" />,
  Snacks:    <Coffee className="w-3.5 h-3.5" />,
};

/** Parse the raw guidelines text into three named sections. */
function parseGuidelines(raw: string) {
  const sections: { title: string; items: string[]; kind: 'do' | 'avoid' | 'note' }[] = [];
  let currentTitle = '';
  let currentItems: string[] = [];
  let currentKind: 'do' | 'avoid' | 'note' = 'do';

  const flush = () => {
    if (currentTitle && currentItems.length) {
      sections.push({ title: currentTitle, items: [...currentItems], kind: currentKind });
    }
    currentItems = [];
  };

  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Detect section headers
    const lower = trimmed.toLowerCase();
    if (lower.startsWith("do's") || lower.startsWith("do's")) {
      flush();
      currentTitle = trimmed;
      currentKind = 'do';
    } else if (lower.startsWith('avoid')) {
      flush();
      currentTitle = trimmed;
      currentKind = 'avoid';
    } else if (lower.startsWith('additional')) {
      flush();
      currentTitle = trimmed;
      currentKind = 'note';
    } else {
      // Strip leading number + dot
      const cleaned = trimmed.replace(/^\d+\.\s*/, '');
      if (cleaned) currentItems.push(cleaned);
    }
  }
  flush();
  return sections;
}

/* ── Component ─────────────────────────────────────────────────── */
export function DietPlanPrintView({
  mealPlan,
  preferences,
  guidelines,
  title,
}: DietPlanPrintViewProps) {
  const parsedGuidelines = parseGuidelines(guidelines);

  return (
    <div className="pv-root">
      {/* ═══════════════════ PAGE 1 ═══════════════════ */}
      <div className="pv-page pv-page--one">
        <Letterhead />

        {/* Client info card */}
        <div className="pv-client-card">
          <div className="pv-client-card__header">
            <div>
              <h2 className="pv-client-card__title">Personalized Diet Plan</h2>
              <p className="pv-client-card__subtitle">{title || 'Patient Diet Plan'}</p>
            </div>
            <div className="pv-client-card__meta">
              <div className="pv-client-card__field">
                <span className="pv-label">DATE</span>
                <span className="pv-value">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="pv-client-card__field">
                <span className="pv-label">GOAL</span>
                <span className="pv-value">{preferences.primaryGoal}</span>
              </div>
              <div className="pv-client-card__field">
                <span className="pv-label">DIET</span>
                <span className="pv-value">{preferences.dietType}</span>
              </div>
            </div>
          </div>
          <div className="pv-client-card__details">
            <div className="pv-client-card__detail-item">
              <span className="pv-label">ALLERGIES</span>
              <span className="pv-value">{preferences.allergies || 'None'}</span>
            </div>
            <div className="pv-client-card__detail-item">
              <span className="pv-label">MEDICAL CONDITIONS</span>
              <span className="pv-value">{preferences.medicalConditions || 'None'}</span>
            </div>
          </div>
        </div>

        {/* Meal table */}
        <h3 className="pv-section-title">
          <span className="pv-section-title__text">Daily Meal Schedule</span>
          <span className="pv-section-title__rule" />
        </h3>

        <table className="pv-meal-table">
          <thead>
            <tr>
              <th style={{ width: '14%' }}>MEAL</th>
              <th style={{ width: '9%' }}>TIME</th>
              <th style={{ width: '22%' }}>MENU</th>
              <th style={{ width: '12%' }}>SERVING</th>
              <th style={{ width: '28%' }}>NUTRITION</th>
              <th style={{ width: '15%' }}>PREP / COOK</th>
            </tr>
          </thead>
          <tbody>
            {DAYS.map(day =>
              MEALS.map((meal, idx) => {
                const data = mealPlan[day]?.[meal];
                if (!data) return null;
                return (
                  <tr key={`${day}-${meal}`} className={idx % 2 === 1 ? 'pv-row-alt' : ''}>
                    <td className="pv-meal-name">
                      <span className="pv-meal-icon">{MEAL_ICONS[meal]}</span>
                      {meal}
                    </td>
                    <td>{data.intakeTime || '–'}</td>
                    <td>
                      <div className="pv-menu-name">{data.name || '–'}</div>
                      {data.alternatives && (
                        <div className="pv-alt-text">Alt: {data.alternatives}</div>
                      )}
                    </td>
                    <td>{data.servingSize || '–'}</td>
                    <td>
                      <div className="pv-pills">
                        {data.calories > 0 && (
                          <span className="pv-pill pv-pill--cal">{data.calories} kcal</span>
                        )}
                        {data.protein_g > 0 && (
                          <span className="pv-pill pv-pill--p">P {data.protein_g}g</span>
                        )}
                        {data.carbs_g > 0 && (
                          <span className="pv-pill pv-pill--c">C {data.carbs_g}g</span>
                        )}
                        {data.fat_g > 0 && (
                          <span className="pv-pill pv-pill--f">F {data.fat_g}g</span>
                        )}
                        {!data.calories && !data.protein_g && !data.carbs_g && !data.fat_g && '–'}
                      </div>
                    </td>
                    <td>
                      <div>{data.prepTime || '–'} / {data.cookTime || '–'}</div>
                      {data.prepTips && (
                        <div className="pv-alt-text">{data.prepTips}</div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Page 1 footer */}
        <div className="pv-footer">
          <div className="pv-footer__rule" />
          <p className="pv-footer__text">AnyFeast &nbsp;|&nbsp; www.anyfeast.com &nbsp;|&nbsp; Page 1 of 2</p>
        </div>
      </div>

      {/* ═══════════════════ PAGE 2 ═══════════════════ */}
      <div className="pv-page pv-page--two">
        <Letterhead />

        <h3 className="pv-section-title">
          <span className="pv-section-title__text">Dietary Guidelines</span>
          <span className="pv-section-title__rule" />
        </h3>

        <div className="pv-guidelines">
          {parsedGuidelines.map((section, i) => (
            <div
              key={i}
              className={`pv-guide-card pv-guide-card--${section.kind}`}
            >
              <h4 className="pv-guide-card__title">{section.title}</h4>
              <ul className="pv-guide-card__list">
                {section.items.map((item, j) => (
                  <li key={j} className="pv-guide-card__item">
                    <span className="pv-guide-card__icon">
                      {section.kind === 'do' && <CheckCircle className="w-4 h-4" />}
                      {section.kind === 'avoid' && <XCircle className="w-4 h-4" />}
                      {section.kind === 'note' && <Info className="w-4 h-4" />}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Page 2 footer */}
        <div className="pv-footer">
          <div className="pv-footer__rule" />
          <p className="pv-footer__text">AnyFeast &nbsp;|&nbsp; www.anyfeast.com &nbsp;|&nbsp; Page 2 of 2</p>
        </div>
      </div>
    </div>
  );
}
