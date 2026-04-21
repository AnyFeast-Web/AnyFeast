import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Save, FileDown, 
  Clock, Info, Settings, CalendarDays, FileText, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TopBar } from '../../components/layout/TopBar';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Button } from '../../components/ui';
import { useMealPlan, useUpdateMealPlan, useCreateMealPlan } from '../../hooks/useMealPlans';

const DAYS = ['Daily'];
const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

const COMMON_MEALS = [
  "Oatmeal with Berries & Almonds",
  "Scrambled Eggs with Avocado Toast",
  "Greek Yogurt with Honey & Walnuts",
  "Protein Shake with Banana",
  "Grilled Chicken Salad with Vinaigrette",
  "Quinoa Bowl with Roasted Veggies",
  "Baked Salmon with Sweet Potato",
  "Lentil Soup with Whole Wheat Bread",
  "Tofu Stir-fry with Brown Rice",
  "Cottage Cheese with Pineapple",
  "Handful of Almonds & Dark Chocolate",
  "Apple Slices with Peanut Butter"
];

const DEFAULT_GUIDELINES = `Do's
1. Drink 3 litres water daily
2. Eat every 3–4 hours
3. Walk 10–15 minutes after meals
4. Keep dinner light
5. Maintain regular meal timing
6. Use only 3 teaspoons oil daily
7. Continue gym consistently
8. Track waist every 2 weeks

Avoid
1. Sugary tea or coffee
2. Frequent outside food
3. Fried foods
4. Heavy late dinners
5. Excess nuts
6. Bakery foods
7. Cheat meals more than once weekly

Additional Notes
1. Start morning with 1 glass warm water
2. Take 1 tsp chia seeds soaked overnight, 20–30 min before breakfast
3. Pre-workout fruit should be taken 30 minutes before gym
4. Post-workout whey should be taken within 20 minutes after workout
5. Recheck Vitamin D and B12
6. Focus on waist reduction, not only scale weight`;

const emptyMeal = () => ({
  name: '',
  servingSize: '',
  prepTime: '',
  cookTime: '',
  intakeTime: '',
  calories: 0,
  protein_g: 0,
  carbs_g: 0,
  fat_g: 0,
  prepTips: '',
  alternatives: ''
});

export function MealPlanBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: existingPlan } = useMealPlan(id || '');
  const updateMutation = useUpdateMealPlan(id || 'temp');
  const createMutation = useCreateMealPlan();

  const [activeTab, setActiveTab] = useState<'profile' | 'schedule' | 'guidelines' | 'preview'>('profile');

  // Profile State
  const [preferences, setPreferences] = useState({
    dietType: 'Non-Vegetarian',
    primaryGoal: 'Maintenance',
    allergies: '',
    medicalConditions: ''
  });

  // Guidelines State
  const [guidelines, setGuidelines] = useState(DEFAULT_GUIDELINES);

  // Schedule State
  const [mealPlan, setMealPlan] = useState<Record<string, Record<string, ReturnType<typeof emptyMeal>>>>(() => {
    const initialState: any = {};
    DAYS.forEach(day => {
      initialState[day] = {};
      MEALS.forEach(meal => {
        initialState[day][meal] = emptyMeal();
      });
    });
    return initialState;
  });

  useEffect(() => {
    if (existingPlan) {
      if (existingPlan.grid) {
        const loaded: any = {};
        DAYS.forEach(day => {
          loaded[day] = {};
          MEALS.forEach(meal => {
            const backendDay = day.toLowerCase();
            const backendMeal = meal.toLowerCase();
            const mealArr = existingPlan.grid[backendDay]?.[backendMeal];
            if (mealArr && mealArr.length > 0) {
              loaded[day][meal] = { ...emptyMeal(), ...mealArr[0] };
            } else {
              loaded[day][meal] = emptyMeal();
            }
          });
        });
        setMealPlan(loaded);
      }
      if (existingPlan.preferences) {
        setPreferences({
          dietType: existingPlan.preferences.dietType || 'Non-Vegetarian',
          primaryGoal: existingPlan.preferences.primaryGoal || 'Maintenance',
          allergies: existingPlan.preferences.allergies || '',
          medicalConditions: existingPlan.preferences.medicalConditions || ''
        });
      }
      // If it exists in DB, overwrite default, else keep default.
      if (existingPlan.guidelines) {
        setGuidelines(existingPlan.guidelines);
      }
    }
  }, [existingPlan]);

  const updateMeal = (day: string, meal: string, field: string, value: string | number) => {
    setMealPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [meal]: {
          ...prev[day][meal],
          [field]: value
        }
      }
    }));
  };

  const handleSave = () => {
    const formattedGrid: any = {};
    let totalCals = 0;
    let totalP = 0;
    let totalC = 0;
    let totalF = 0;
    let activeDaysCount = 0;

    Object.keys(mealPlan).forEach(day => {
      formattedGrid[day.toLowerCase()] = {};
      let dayHasMeals = false;
      Object.keys(mealPlan[day]).forEach(mealType => {
        const mealData = mealPlan[day][mealType];
        const c = Number(mealData.calories) || 0;
        const p = Number(mealData.protein_g) || 0;
        const cb = Number(mealData.carbs_g) || 0;
        const f = Number(mealData.fat_g) || 0;

        if (c > 0 || p > 0 || cb > 0 || f > 0) {
          totalCals += c;
          totalP += p;
          totalC += cb;
          totalF += f;
          dayHasMeals = true;
        }

        const meal = {
          ...mealData,
          calories: c,
          protein_g: p,
          carbs_g: cb,
          fat_g: f,
        };
        formattedGrid[day.toLowerCase()][mealType.toLowerCase()] = [meal];
      });
      if (dayHasMeals) activeDaysCount++;
    });

    const divisor = activeDaysCount > 0 ? activeDaysCount : 1;

    const payload = {
      client_id: existingPlan?.client_id || 'new-client',
      title: existingPlan?.title || 'New Diet Plan',
      status: existingPlan?.status || 'active',
      date_range: existingPlan?.date_range || { 
        start_date: new Date().toISOString(), 
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() 
      },
      grid: formattedGrid,
      preferences: preferences,
      guidelines: guidelines,
      total_nutrition_targets: {
        calories: Math.round(totalCals / divisor),
        protein_g: Math.round(totalP / divisor),
        carbs_g: Math.round(totalC / divisor),
        fat_g: Math.round(totalF / divisor)
      }
    };
    
    if (id && id !== 'new') {
      updateMutation.mutate(payload, { 
        onSuccess: () => alert('Diet plan saved successfully!'),
        onError: (err: any) => alert('Failed to save to database: ' + JSON.stringify(err.response?.data?.detail || err.message))
      });
    } else {
      createMutation.mutate(payload, { 
        onSuccess: (res) => {
          alert('Diet plan created successfully!');
          navigate(`/meal-plans/${res.id}`);
        },
        onError: (err: any) => alert('Failed to create in database: ' + JSON.stringify(err.response?.data?.detail || err.message))
      });
    }
  };

  const executePrint = () => {
    window.print();
  };

  return (
    <>
      <style>{`
        .screen-only {
          display: block;
        }
        .print-only {
          display: none;
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          header, .sidebar-class-if-exists, nav, .print-hide, .screen-only {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          html, body {
            width: 100%;
            min-height: auto;
            background: transparent !important;
          }
          .print-plan-sheet {
            width: 100%;
            color: black !important;
            font-size: 10px;
            line-height: 1.4;
          }
          .print-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
            page-break-inside: avoid;
          }
          .print-table th,
          .print-table td {
            border: 1px solid #333 !important;
            padding: 4px 6px !important;
            vertical-align: top !important;
            text-align: left !important;
          }
          .print-table th {
            background: #e5e7eb !important;
            font-weight: 700 !important;
            font-size: 9px !important;
          }
          .print-table td {
            font-size: 9px !important;
          }
          .print-guidelines {
            page-break-before: always;
          }
          .print-guidelines pre {
            white-space: pre-wrap !important;
            word-break: break-word !important;
            font-size: 10px !important;
            margin: 0 !important;
            font-family: 'Courier New', monospace !important;
            line-height: 1.5 !important;
          }
          .print-card,
          .print-plan-sheet,
          .print-row {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          * {
            background-color: transparent !important;
            color: black !important;
            box-shadow: none !important;
            text-shadow: none !important;
          }
          .print-border {
            border: 1px solid #ccc !important;
            border-radius: 4px !important;
            margin-bottom: 20px !important;
          }
          input, textarea, select {
            border: 1px solid #ddd !important;
            background: #fff !important;
          }
        }
      `}</style>
      
      <TopBar className="print-hide" title="Interactive Diet Form" />
      <PageWrapper className="print-block">
        <datalist id="meal-suggestions">
          {COMMON_MEALS.map(meal => <option key={meal} value={meal} />)}
        </datalist>

        <div className="print-only hidden">
          <div className="print-plan-sheet">
            <div className="mb-8 text-center border-b-2 border-brand-primary pb-6">
              <div className="flex justify-center items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white font-bold text-lg">🏠</div>
                <h1 className="text-3xl font-display font-bold text-brand-primary">ANYFEAST</h1>
              </div>
              <p className="text-sm text-text-secondary">Healthy sustainable cooking powered by AI</p>
              <p className="text-xs text-text-muted mt-2">www.anyfeast.com | pankaj@anyfeast.com | +44 9116 76 9116</p>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-start gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-display font-bold">Personalized Diet Plan</h2>
                  <p className="text-sm text-text-secondary mt-1">{existingPlan?.title || 'Patient Diet Plan'}</p>
                </div>
                <div className="text-right text-xs">
                  <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                  <p><strong>Goal:</strong> {preferences.primaryGoal}</p>
                  <p><strong>Diet:</strong> {preferences.dietType}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-3 rounded">
                <div><strong>Allergies:</strong> {preferences.allergies || 'None'}</div>
                <div><strong>Medical Conditions:</strong> {preferences.medicalConditions || 'None'}</div>
              </div>
            </div>

            <table className="print-table">
              <thead>
                <tr>
                  <th>Meal</th>
                  <th>Time</th>
                  <th>Menu</th>
                  <th>Serving</th>
                  <th>Nutrition</th>
                  <th>Prep / Cook</th>
                </tr>
              </thead>
              <tbody>
                {DAYS.map(day => (
                  MEALS.map(meal => {
                    const data = mealPlan[day][meal];
                    return (
                      <tr key={`${day}-${meal}`} className="print-row">
                        <td className="px-2 py-2 align-top font-semibold">{meal}</td>
                        <td className="px-2 py-2 align-top">{data.intakeTime || '-'}</td>
                        <td className="px-2 py-2 align-top">{data.name || '-'}</td>
                        <td className="px-2 py-2 align-top">{data.servingSize || '-'}</td>
                        <td className="px-2 py-2 align-top">
                          {data.calories ? `${data.calories} cal` : '-'}
                          {data.protein_g ? `, ${data.protein_g}g P` : ''}
                          {data.carbs_g ? `, ${data.carbs_g}g C` : ''}
                          {data.fat_g ? `, ${data.fat_g}g F` : ''}
                        </td>
                        <td className="px-2 py-2 align-top">
                          {data.prepTime || '-'} / {data.cookTime || '-'}
                          {data.prepTips && <div className="mt-1 text-xs">Notes: {data.prepTips}</div>}
                          {data.alternatives && <div className="mt-1 text-xs">Alt: {data.alternatives}</div>}
                        </td>
                      </tr>
                    );
                  })
                ))}
              </tbody>
            </table>

            <div style={{ pageBreakBefore: 'always', marginTop: '30px' }} className="print-guidelines">
              <div className="text-center border-b-2 border-brand-primary pb-4 mb-4">
                <h2 className="text-2xl font-display font-bold text-brand-primary">DIETARY GUIDELINES</h2>
              </div>
              <pre className="text-xs whitespace-pre-wrap break-words">{guidelines}</pre>
            </div>
          </div>
        </div>

        <div className="screen-only">
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6 print-hide">
            <div>
              <h2 className="text-xl font-display font-bold text-text-primary">{existingPlan?.title || "Patient Diet Plan"}</h2>
              <p className="text-sm text-text-secondary mt-1">Design a comprehensive single-day routine routine.</p>
            </div>
          </div>

        {/* Custom Tabs Navigation */}
        <div className="flex gap-4 mb-6 border-b border-border-subtle pb-2 print-hide overflow-x-auto">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2 bg-transparent text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${activeTab === 'profile' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
          >
            <Settings className="w-4 h-4" />
            Patient Profile
          </button>
          <button 
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center gap-2 px-4 py-2 bg-transparent text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${activeTab === 'schedule' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
          >
            <CalendarDays className="w-4 h-4" />
            Diet Schedule
          </button>
          <button 
            onClick={() => setActiveTab('guidelines')}
            className={`flex items-center gap-2 px-4 py-2 bg-transparent text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${activeTab === 'guidelines' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
          >
            <FileText className="w-4 h-4" />
            Guidelines
          </button>
          <button 
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 px-4 py-2 bg-transparent text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${activeTab === 'preview' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
          >
            <FileDown className="w-4 h-4" />
            Download PDF
          </button>
        </div>

        {/* Tab 1: Profile */}
        <div className={`${activeTab === 'profile' ? 'block' : 'hidden'} print-block mb-12`}>
          <h2 className="text-xl font-display font-bold text-text-primary mb-4 hidden print:block">Patient Diet Profile</h2>
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 shadow-sm print-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">Diet Type Preference</label>
                <select 
                  className="w-full bg-bg-input border border-border-subtle rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
                  value={preferences.dietType}
                  onChange={(e) => setPreferences({...preferences, dietType: e.target.value})}
                >
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Non-Vegetarian">Non-Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Pescetarian">Pescetarian</option>
                  <option value="Keto">Keto</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">Primary Goal</label>
                <select 
                  className="w-full bg-bg-input border border-border-subtle rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
                  value={preferences.primaryGoal}
                  onChange={(e) => setPreferences({...preferences, primaryGoal: e.target.value})}
                >
                  <option value="Weight Loss">Weight Loss</option>
                  <option value="Weight Gain">Weight Gain</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Muscle Building">Muscle Building</option>
                  <option value="Clinical Recovery">Clinical Recovery</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-text-secondary mb-2">Allergies & Restrictions</label>
                <textarea 
                  className="w-full bg-bg-input border border-border-subtle rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary resize-y"
                  placeholder="e.g. Peanut allergy, Lactose intolerant..."
                  rows={2}
                  value={preferences.allergies}
                  onChange={(e) => setPreferences({...preferences, allergies: e.target.value})}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-text-secondary mb-2">Relevant Medical Conditions</label>
                <textarea 
                  className="w-full bg-bg-input border border-border-subtle rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary resize-y"
                  placeholder="e.g. Type 2 Diabetes, Hypertension..."
                  rows={2}
                  value={preferences.medicalConditions}
                  onChange={(e) => setPreferences({...preferences, medicalConditions: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tab 2: Schedule */}
        <div className={`${activeTab === 'schedule' ? 'block' : 'hidden'} print-block print-schedule-page mb-12`}>
          <h2 className="text-xl font-display font-bold text-text-primary mb-4 hidden print:block">Master Daily Schedule</h2>
          <div className="space-y-6">
            {DAYS.map(day => (
              <div key={day} className="bg-bg-surface overflow-hidden">
                <div className="space-y-6">
                  {MEALS.map(meal => {
                    const data = mealPlan[day][meal];
                    return (
                      <div key={meal} className="bg-bg-elevated/20 rounded-xl p-6 border border-border-subtle shadow-sm print-border">
                        <div className="flex items-center justify-between border-b border-border-subtle pb-3 mb-5">
                          <h4 className="font-display font-bold text-brand-primary text-lg">{meal}</h4>
                          <div className="flex items-center gap-2 bg-bg-input px-3 py-1.5 rounded-lg border border-border-subtle">
                            <Clock className="w-4 h-4 text-text-muted print-hide" />
                            <input 
                              type="time"
                              className="bg-transparent text-sm text-text-primary focus:outline-none font-semibold w-[100px]"
                              value={data.intakeTime}
                              onChange={(e) => updateMeal(day, meal, 'intakeTime', e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                          {/* Basic Info */}
                          <div className="lg:col-span-5 space-y-4">
                            <div>
                              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Meal Name</label>
                              <input 
                                list="meal-suggestions"
                                className="w-full bg-bg-input border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
                                placeholder="Start typing for suggestions..."
                                value={data.name}
                                onChange={(e) => updateMeal(day, meal, 'name', e.target.value)}
                                autoComplete="off"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1 text-accent-rose">Calories (cal)</label>
                                <input 
                                  type="number"
                                  className="w-full bg-bg-input border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-primary font-mono"
                                  value={data.calories || ''}
                                  onChange={(e) => updateMeal(day, meal, 'calories', parseInt(e.target.value) || 0)}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1 text-brand-primary">Protein (g)</label>
                                <input 
                                  type="number"
                                  className="w-full bg-bg-input border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-primary font-mono"
                                  value={data.protein_g || ''}
                                  onChange={(e) => updateMeal(day, meal, 'protein_g', parseInt(e.target.value) || 0)}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1 text-teal-600">Carbs (g)</label>
                                <input 
                                  type="number"
                                  className="w-full bg-bg-input border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-primary font-mono"
                                  value={data.carbs_g || ''}
                                  onChange={(e) => updateMeal(day, meal, 'carbs_g', parseInt(e.target.value) || 0)}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1 text-accent-amber">Fats (g)</label>
                                <input 
                                  type="number"
                                  className="w-full bg-bg-input border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-primary font-mono"
                                  value={data.fat_g || ''}
                                  onChange={(e) => updateMeal(day, meal, 'fat_g', parseInt(e.target.value) || 0)}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Logistics */}
                          <div className="lg:col-span-3 space-y-4">
                            <div>
                              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Serving Size</label>
                              <div className="relative">
                                <Info className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 print-hide" />
                                <input 
                                  className="w-full bg-bg-input border border-border-subtle rounded-md pl-9 print:pl-3 pr-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
                                  placeholder="e.g. 1 bowl (200g)"
                                  value={data.servingSize}
                                  onChange={(e) => updateMeal(day, meal, 'servingSize', e.target.value)}
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Prep & Cook Time</label>
                              <div className="grid grid-cols-2 gap-2">
                                <input 
                                  className="w-full bg-bg-input border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
                                  placeholder="Prep: 10m"
                                  value={data.prepTime}
                                  onChange={(e) => updateMeal(day, meal, 'prepTime', e.target.value)}
                                />
                                <input 
                                  className="w-full bg-bg-input border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
                                  placeholder="Cook: 20m"
                                  value={data.cookTime}
                                  onChange={(e) => updateMeal(day, meal, 'cookTime', e.target.value)}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Details */}
                          <div className="lg:col-span-4 space-y-4">
                            <div>
                              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Instructions / Specifics</label>
                              <textarea 
                                className="w-full bg-bg-input border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-primary resize-none h-[88px]"
                                placeholder="Any precise preparation notes..."
                                value={data.prepTips}
                                onChange={(e) => updateMeal(day, meal, 'prepTips', e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Alternatives / Substitutions</label>
                              <textarea 
                                className="w-full bg-bg-input border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-primary resize-none h-[88px]"
                                placeholder="e.g. Swap oats for quinoa flakes..."
                                value={data.alternatives}
                                onChange={(e) => updateMeal(day, meal, 'alternatives', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tab 3: Guidelines */}
        <div className={`${activeTab === 'guidelines' ? 'block' : 'hidden'} print-block print-page-break`}>
          <h2 className="text-xl font-display font-bold text-text-primary mb-4 hidden print:block">Dietary Guidelines & Protocols</h2>
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 shadow-sm print-border flex flex-col min-h-[500px]">
             <textarea 
              className="flex-1 w-full bg-transparent border-0 rounded-md py-3 text-sm focus:outline-none text-text-primary resize-y min-h-[600px] leading-relaxed"
              value={guidelines}
              onChange={(e) => setGuidelines(e.target.value)}
            />
          </div>
        </div>

        {/* Tab 4: PDF Preview */}
        <div className={`${activeTab === 'preview' ? 'block' : 'hidden'} print-block`}>
          <h2 className="text-xl font-display font-bold text-text-primary mb-4">PDF Preview</h2>
          <div className="bg-white border border-border-subtle rounded-xl p-8 shadow-sm print-border">
            <div className="print-plan-sheet text-black">
              <div className="mb-8 text-center border-b-2 border-brand-primary pb-6">
                <div className="flex justify-center items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white font-bold text-lg">🏠</div>
                  <h1 className="text-3xl font-display font-bold text-red-600">ANYFEAST</h1>
                </div>
                <p className="text-sm text-gray-600">Healthy sustainable cooking powered by AI</p>
                <p className="text-xs text-gray-500 mt-2">www.anyfeast.com | pankaj@anyfeast.com | +44 9116 76 9116</p>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-display font-bold">Personalized Diet Plan</h2>
                    <p className="text-sm text-gray-600 mt-1">{existingPlan?.title || 'Patient Diet Plan'}</p>
                  </div>
                  <div className="text-right text-xs">
                    <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                    <p><strong>Goal:</strong> {preferences.primaryGoal}</p>
                    <p><strong>Diet:</strong> {preferences.dietType}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-3 rounded">
                  <div><strong>Allergies:</strong> {preferences.allergies || 'None'}</div>
                  <div><strong>Medical Conditions:</strong> {preferences.medicalConditions || 'None'}</div>
                </div>
              </div>

              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-400 p-2 text-left font-bold">Meal</th>
                    <th className="border border-gray-400 p-2 text-left font-bold">Time</th>
                    <th className="border border-gray-400 p-2 text-left font-bold">Menu</th>
                    <th className="border border-gray-400 p-2 text-left font-bold">Serving</th>
                    <th className="border border-gray-400 p-2 text-left font-bold">Nutrition</th>
                    <th className="border border-gray-400 p-2 text-left font-bold">Prep / Cook</th>
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map(day => (
                    MEALS.map(meal => {
                      const data = mealPlan[day][meal];
                      return (
                        <tr key={`${day}-${meal}`}>
                          <td className="border border-gray-400 p-2 font-semibold">{meal}</td>
                          <td className="border border-gray-400 p-2">{data.intakeTime || '-'}</td>
                          <td className="border border-gray-400 p-2">{data.name || '-'}</td>
                          <td className="border border-gray-400 p-2">{data.servingSize || '-'}</td>
                          <td className="border border-gray-400 p-2">
                            {data.calories ? `${data.calories} cal` : '-'}
                            {data.protein_g ? `, ${data.protein_g}g P` : ''}
                            {data.carbs_g ? `, ${data.carbs_g}g C` : ''}
                            {data.fat_g ? `, ${data.fat_g}g F` : ''}
                          </td>
                          <td className="border border-gray-400 p-2">
                            {data.prepTime || '-'} / {data.cookTime || '-'}
                            {data.prepTips && <div className="mt-1 text-xs">Notes: {data.prepTips}</div>}
                            {data.alternatives && <div className="mt-1 text-xs">Alt: {data.alternatives}</div>}
                          </td>
                        </tr>
                      );
                    })
                  ))}
                </tbody>
              </table>

              <div className="mt-8 pt-8 border-t-2 border-brand-primary print-guidelines">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-display font-bold text-red-600">DIETARY GUIDELINES</h2>
                </div>
                <pre className="text-xs whitespace-pre-wrap break-words font-sans leading-relaxed">{guidelines}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions Form */}
        <div className="mt-12 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-6 border-t border-border-subtle print-hide">
          <div className="flex gap-4">
            {activeTab === 'profile' && (
              <Button 
                size="lg" 
                onClick={() => setActiveTab('schedule')}
                className="w-48"
              >
                Next: Diet Schedule <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}

            {activeTab === 'schedule' && (
              <Button 
                size="lg" 
                onClick={() => setActiveTab('guidelines')}
                className="w-48"
              >
                Next: Guidelines <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}

            {activeTab === 'guidelines' && (
              <Button 
                size="lg" 
                onClick={() => setActiveTab('preview')}
                className="w-48"
              >
                Next: PDF Preview <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}

            {activeTab === 'preview' && (
              <Button 
                variant="secondary"
                size="lg" 
                onClick={() => setActiveTab('guidelines')}
                className="w-48"
              >
                Back to Guidelines
              </Button>
            )}

            {activeTab === 'preview' && (
              <Button 
                variant="secondary" 
                icon={<FileDown className="w-4 h-4" />} 
                size="lg" 
                onClick={executePrint}
              >
                Download PDF
              </Button>
            )}
          </div>

          <Button 
            icon={<Save className="w-5 h-5" />} 
            size="lg"
            onClick={handleSave}
            disabled={updateMutation.isPending || createMutation.isPending}
            className="w-48"
          >
            {updateMutation.isPending || createMutation.isPending ? "Saving..." : "Save Routine"}
          </Button>
        </div>

        </div>
      </PageWrapper>
    </>
  );
}
