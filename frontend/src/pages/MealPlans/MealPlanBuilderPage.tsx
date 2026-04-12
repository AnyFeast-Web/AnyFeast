import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Save, FileDown, ChevronDown, ChevronUp, 
  Clock, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TopBar } from '../../components/layout/TopBar';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Button } from '../../components/ui';
import { useMealPlan, useUpdateMealPlan, useCreateMealPlan } from '../../hooks/useMealPlans';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

const emptyMeal = () => ({
  name: '',
  servingSize: '',
  prepTime: '',
  cookTime: '',
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

  const [expandedDay, setExpandedDay] = useState<string>(DAYS[0]);

  // State for Meal Plan
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
    if (existingPlan?.grid) {
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
    Object.keys(mealPlan).forEach(day => {
      formattedGrid[day.toLowerCase()] = {};
      Object.keys(mealPlan[day]).forEach(mealType => {
        // Ensure values correspond to integers for backend models if necessary
        const mealData = mealPlan[day][mealType];
        const meal = {
          ...mealData,
          calories: Number(mealData.calories) || 0,
          protein_g: Number(mealData.protein_g) || 0,
          carbs_g: Number(mealData.carbs_g) || 0,
          fat_g: Number(mealData.fat_g) || 0,
        };
        formattedGrid[day.toLowerCase()][mealType.toLowerCase()] = [meal];
      });
    });

    const payload = {
      client_id: existingPlan?.client_id || 'new-client',
      title: existingPlan?.title || 'New Meal Plan',
      status: existingPlan?.status || 'draft',
      date_range: existingPlan?.date_range || { 
        start_date: new Date().toISOString(), 
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() 
      },
      grid: formattedGrid,
      total_nutrition_targets: existingPlan?.total_nutrition_targets || {
        calories: 2000,
        protein_g: 150,
        carbs_g: 200,
        fat_g: 70
      }
    };
    
    if (id && id !== 'new') {
      updateMutation.mutate(payload, { 
        onSuccess: () => alert('Meal plan saved successfully!') 
      });
    } else {
      createMutation.mutate(payload, { 
        onSuccess: (res) => {
          alert('Meal plan created successfully!');
          navigate(`/meal-plans/${res.id}`);
        }
      });
    }
  };

  return (
    <>
      <TopBar title="Interactive Meal Plan Builder" />
      <PageWrapper>
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-display font-bold text-text-primary">{existingPlan?.title || "Weekly Meal Plan Formulation"}</h2>
            <p className="text-sm text-text-secondary mt-1">Design a comprehensive diet plan without database constraints.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" icon={<FileDown className="w-4 h-4" />} onClick={() => window.print()}>
              Export PDF
            </Button>
            <Button 
              icon={<Save className="w-4 h-4" />} 
              onClick={handleSave}
              disabled={updateMutation.isPending || createMutation.isPending}
            >
              {updateMutation.isPending || createMutation.isPending ? "Saving..." : "Save Plan"}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {DAYS.map(day => (
            <div key={day} className="bg-bg-surface border border-border-subtle rounded-xl overflow-hidden shadow-sm">
              <button 
                onClick={() => setExpandedDay(expandedDay === day ? '' : day)}
                className="w-full flex items-center justify-between p-4 bg-bg-elevated/30 hover:bg-bg-elevated/50 transition-colors"
              >
                <h3 className="font-display font-bold text-lg text-text-primary">{day}</h3>
                {expandedDay === day ? <ChevronUp className="w-5 h-5 text-text-secondary" /> : <ChevronDown className="w-5 h-5 text-text-secondary" />}
              </button>
              
              <AnimatePresence>
                {expandedDay === day && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 space-y-8 border-t border-border-subtle">
                      {MEALS.map(meal => {
                        const data = mealPlan[day][meal];
                        return (
                          <div key={meal} className="bg-bg-elevated/20 rounded-lg p-5 border border-border-subtle">
                            <h4 className="font-display font-semibold text-brand-primary mb-4 text-base border-b border-border-subtle pb-2">{meal}</h4>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                              {/* Basic Info */}
                              <div className="lg:col-span-5 space-y-4">
                                <div>
                                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Meal Name</label>
                                  <input 
                                    className="w-full bg-bg-input border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
                                    placeholder="e.g. Oatmeal with Berries"
                                    value={data.name}
                                    onChange={(e) => updateMeal(day, meal, 'name', e.target.value)}
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-semibold text-text-secondary uppercase mb-1 text-accent-rose">Calories (kcal)</label>
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
                                    <Info className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input 
                                      className="w-full bg-bg-input border border-border-subtle rounded-md pl-9 pr-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
                                      placeholder="e.g. 1 bowl (200g)"
                                      value={data.servingSize}
                                      onChange={(e) => updateMeal(day, meal, 'servingSize', e.target.value)}
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Prep Time</label>
                                  <div className="relative">
                                    <Clock className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input 
                                      className="w-full bg-bg-input border border-border-subtle rounded-md pl-9 pr-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
                                      placeholder="e.g. 10 mins"
                                      value={data.prepTime}
                                      onChange={(e) => updateMeal(day, meal, 'prepTime', e.target.value)}
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Cook Time</label>
                                  <div className="relative">
                                    <Clock className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input 
                                      className="w-full bg-bg-input border border-border-subtle rounded-md pl-9 pr-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-primary"
                                      placeholder="e.g. 20 mins"
                                      value={data.cookTime}
                                      onChange={(e) => updateMeal(day, meal, 'cookTime', e.target.value)}
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Details */}
                              <div className="lg:col-span-4 space-y-4">
                                <div>
                                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Prep Tips & Instructions</label>
                                  <textarea 
                                    className="w-full bg-bg-input border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-primary resize-none h-[88px]"
                                    placeholder="Any tips on making this ahead of time..."
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </PageWrapper>
    </>
  );
}
