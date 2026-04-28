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
import { DietPlanPrintView } from '../../components/print/DietPlanPrintView';

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

const DISEASE_GUIDELINES = {
  general: DEFAULT_GUIDELINES,
  diabetic: `Do's for Diabetic Patients
1. Drink 3–4 litres water daily
2. Eat meals at fixed times (every 3–4 hours)
3. Walk 30 minutes after meals
4. Keep dinner very light and early (by 7 PM)
5. Maintain consistent meal timing
6. Use minimal oil (2–3 teaspoons daily)
7. Focus on high-fiber foods
8. Track blood sugar levels regularly

Avoid
1. All sugary foods and beverages
2. Refined carbohydrates (white rice, white bread)
3. Fried and processed foods
4. Frequent outside/street food
5. High-glycemic fruits (mango, banana in excess)
6. Excess salt and oil
7. Alcohol and sugary tea/coffee

Additional Notes
1. Include cinnamon in diet for blood sugar control
2. Consume methi (fenugreek) seeds soaked overnight
3. Take fasting blood sugar levels every 2 weeks
4. Include bitter gourd and bottle gourd regularly
5. Take prescribed medications on schedule
6. Monitor HbA1c levels every 3 months`,

  hypertension: `Do's for Hypertension Patients
1. Drink 2–3 litres water daily
2. Eat every 3–4 hours in small portions
3. Walk 30–45 minutes daily
4. Keep dinner light and at least 2 hours before sleep
5. Maintain regular meal timing
6. Use minimal salt (reduce to 1/2 teaspoon daily)
7. Include potassium-rich foods
8. Monitor BP regularly

Avoid
1. High-sodium foods (pickles, canned items, processed meats)
2. Fried and deep-fried foods
3. Heavy, spicy foods
4. Frequent outside food
5. Excess sugar and salt
6. Alcohol and tobacco
7. High-fat foods and red meat

Additional Notes
1. Start morning with 1 glass warm water with lemon
2. Include garlic and onion in meals
3. Consume high-fiber foods (oats, whole grains)
4. Check blood pressure twice daily (morning and evening)
5. Practice yoga and breathing exercises daily
6. Reduce stress through meditation`,

  pcod: `Do's for PCOD/PCOS Patients
1. Drink 3–4 litres water daily
2. Eat every 3–4 hours to maintain insulin levels
3. Walk 30 minutes after each meal
4. Keep dinner light and early
5. Maintain consistent meal timing
6. Use minimal oil (2–3 teaspoons)
7. Exercise regularly (cardio + strength training)
8. Track menstrual cycle and weight

Avoid
1. Sugary and processed foods
2. Refined carbohydrates
3. Fried foods
4. Frequent outside food
5. Excess nuts (limit to 10–12 daily)
6. Bakery items and sugar
7. Cheat meals more than once monthly

Additional Notes
1. Include inositol-rich foods (chickpeas, lentils, nuts)
2. Take Vitamin D and B12 supplements if prescribed
3. Include cinnamon in diet for PCOD management
4. Maintain regular exercise (especially resistance training)
5. Get hormonal levels checked quarterly
6. Focus on waist circumference reduction`,

  thyroid: `Do's for Thyroid Patients
1. Drink 2–3 litres water daily
2. Eat every 3–4 hours
3. Walk 20–30 minutes daily
4. Keep dinner light and at least 2 hours before sleep
5. Take medicines with proper gap from food
6. Maintain consistent meal timing
7. Get adequate sleep (7–8 hours)
8. Check TSH levels regularly

Avoid
1. Cruciferous vegetables in excess (cabbage, cauliflower, broccoli)
2. Soy products (unless advised)
3. Excess iodine or no iodine
4. Fried and processed foods
5. Caffeine in excess (more than 1–2 cups daily)
6. Frequent outside food
7. Stress and irregular sleep

Additional Notes
1. Take thyroid medicines 1 hour before breakfast or 3 hours after dinner
2. Include selenium and zinc-rich foods
3. Consume iodized salt in appropriate quantities
4. Practice yoga and stress management
5. Check TSH levels every 6–8 weeks after medicine adjustment
6. Maintain stable weight`,

  cholesterol: `Do's for High Cholesterol Patients
1. Drink 3 litres water daily
2. Eat every 3–4 hours
3. Walk 45 minutes daily
4. Keep dinner light and early
5. Maintain regular meal timing
6. Use minimal oil (use olive oil when possible)
7. Include fiber-rich foods
8. Monitor cholesterol levels regularly

Avoid
1. High-fat and saturated fats
2. Red meat and full-fat dairy
3. Fried and processed foods
4. Trans fats (bakery items, packed snacks)
5. Egg yolk in excess (limit to 2–3 weekly)
6. Sugary foods and beverages
7. Alcohol and smoking

Additional Notes
1. Start morning with 1 glass warm water with lemon
2. Include oats and whole grains daily
3. Consume fatty fish (salmon, mackerel) 2–3 times weekly
4. Include nuts (almonds, walnuts) in moderation
5. Check lipid profile every 3 months
6. Maintain regular aerobic exercise`
};

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
  const [selectedDisease, setSelectedDisease] = useState<keyof typeof DISEASE_GUIDELINES>('general');

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

  const handleDiseaseChange = (disease: keyof typeof DISEASE_GUIDELINES) => {
    setSelectedDisease(disease);
    setGuidelines(DISEASE_GUIDELINES[disease]);
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
        .screen-only { display: block; }
        .print-only  { display: none; }
        @media print {
          header, nav, aside, .sidebar, .print-hide, .screen-only { display: none !important; }
          .print-only { display: block !important; }
        }
      `}</style>
      
      <TopBar className="print-hide" title="Interactive Diet Form" />
      <PageWrapper className="print-block">
        <datalist id="meal-suggestions">
          {COMMON_MEALS.map(meal => <option key={meal} value={meal} />)}
        </datalist>

        {/* Hidden print-only view — rendered by window.print() */}
        <div className="print-only hidden">
          <DietPlanPrintView
            mealPlan={mealPlan}
            preferences={preferences}
            guidelines={guidelines}
            title={existingPlan?.title}
          />
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
            <div className="mb-4 pb-4 border-b border-border-subtle screen-only">
              <label className="block text-sm font-semibold text-text-secondary mb-3">Select Medical Condition (Auto-generate Guidelines)</label>
              <select 
                className="w-full bg-bg-input border border-border-subtle rounded-md px-4 py-2 text-sm focus:outline-none focus:border-brand-primary"
                value={selectedDisease}
                onChange={(e) => handleDiseaseChange(e.target.value as keyof typeof DISEASE_GUIDELINES)}
              >
                <option value="general">General Health Guidelines</option>
                <option value="diabetic">Diabetic Patient Guidelines</option>
                <option value="hypertension">Hypertension Patient Guidelines</option>
                <option value="pcod">PCOD/PCOS Patient Guidelines</option>
                <option value="thyroid">Thyroid Patient Guidelines</option>
                <option value="cholesterol">High Cholesterol Patient Guidelines</option>
              </select>
              <p className="text-xs text-text-muted mt-2">Selecting a condition will auto-populate the guidelines below. You can still edit them manually.</p>
            </div>
            <textarea 
              className="flex-1 w-full bg-bg-input border border-border-subtle rounded-md p-4 text-sm focus:outline-none focus:border-brand-primary text-text-primary resize-y min-h-[600px] leading-relaxed shadow-sm"
              value={guidelines}
              onChange={(e) => setGuidelines(e.target.value)}
            />
          </div>
        </div>

        {/* Tab 4: PDF Preview */}
        <div className={`${activeTab === 'preview' ? 'block' : 'hidden'} print-block`}>
          <h2 className="text-xl font-display font-bold text-text-primary mb-4">PDF Preview</h2>
          <DietPlanPrintView
            mealPlan={mealPlan}
            preferences={preferences}
            guidelines={guidelines}
            title={existingPlan?.title}
          />
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
