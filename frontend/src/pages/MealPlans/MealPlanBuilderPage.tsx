import { useState, useMemo } from 'react';
import { PlusCircle, Copy, FileDown, Send, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TopBar } from '../../components/layout/TopBar';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Badge, StatusBadge, Input } from '../../components/ui';
import { NutritionPanel } from '../../components/nutrition/NutritionPanel';
import { useMealPlan, useCreateMealPlan, useUpdateMealPlan } from '../../hooks/useMealPlans';
import { DAYS_OF_WEEK, DAY_LABELS, MEAL_TYPES, MEAL_LABELS } from '../../utils/constants';

type DayOfWeek = typeof DAYS_OF_WEEK[number];
type MealType = typeof MEAL_TYPES[number];

interface MacroMeal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// Initial mock state for a 7x4 grid
const initialGrid: Record<DayOfWeek, Record<MealType, MacroMeal[]>> = DAYS_OF_WEEK.reduce((acc, day) => {
  acc[day] = MEAL_TYPES.reduce((mAcc, mealType) => {
    // Pre-populate some data
    if (day === 'monday' && mealType === 'breakfast') mAcc[mealType] = [{ id: '1', name: 'Oatmeal Bowl', calories: 400, protein: 12, carbs: 60, fat: 8 }];
    else if (day === 'tuesday' && mealType === 'lunch') mAcc[mealType] = [{ id: '2', name: 'Chicken Salad', calories: 550, protein: 45, carbs: 20, fat: 25 }];
    else mAcc[mealType] = [];
    return mAcc;
  }, {} as Record<MealType, MacroMeal[]>);
  return acc;
}, {} as Record<DayOfWeek, Record<MealType, MacroMeal[]>>);

export function MealPlanBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [grid, setGrid] = useState(initialGrid);

  const { data: existingPlan, isLoading } = useMealPlan(id || '');
  const createMutation = useCreateMealPlan();
  const updateMutation = useUpdateMealPlan(id || 'temp');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCell, setActiveCell] = useState<{ day: DayOfWeek; mealType: MealType } | null>(null);
  const [newMeal, setNewMeal] = useState<Partial<MacroMeal>>({ name: '', calories: 0, protein: 0, carbs: 0, fat: 0 });

  const handleOpenModal = (day: DayOfWeek, mealType: MealType) => {
    setActiveCell({ day, mealType });
    setNewMeal({ name: '', calories: 0, protein: 0, carbs: 0, fat: 0 });
    setIsModalOpen(true);
  };

  const handleSaveMeal = () => {
    if (!activeCell || !newMeal.name) return;
    const meal: MacroMeal = {
      id: Math.random().toString(),
      name: newMeal.name,
      calories: Number(newMeal.calories) || 0,
      protein: Number(newMeal.protein) || 0,
      carbs: Number(newMeal.carbs) || 0,
      fat: Number(newMeal.fat) || 0,
    };
    
    setGrid(prev => ({
      ...prev,
      [activeCell.day]: {
        ...prev[activeCell.day],
        [activeCell.mealType]: [...prev[activeCell.day][activeCell.mealType], meal]
      }
    }));
    setIsModalOpen(false);
  };

  const handleRemoveMeal = (day: DayOfWeek, mealType: MealType, mealId: string) => {
    setGrid(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealType]: prev[day][mealType].filter(m => m.id !== mealId)
      }
    }));
  };

  // Calculate totals
  const totals = useMemo(() => {
    let cal = 0, pro = 0, ch = 0, f = 0;
    Object.values(grid).forEach(day => {
      Object.values(day).forEach(meals => {
        meals.forEach(m => {
          cal += m.calories; pro += m.protein; ch += m.carbs; f += m.fat;
        });
      });
    });
    return { calories: cal, protein_g: pro, carbs_g: ch, fat_g: f, fiber_g: 0 };
  }, [grid]);

  // Calculate weekly averages (divide by 7)
  const averages = useMemo(() => ({
    calories: Math.round(totals.calories / 7),
    protein_g: Math.round(totals.protein_g / 7),
    carbs_g: Math.round(totals.carbs_g / 7),
    fat_g: Math.round(totals.fat_g / 7),
    fiber_g: 0
  }), [totals]);

  return (
    <>
      <TopBar title="Meal Plan Builder" />
      <PageWrapper className="!max-w-none">
        
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-display font-bold text-text-primary">
              {existingPlan ? existingPlan.title : 'New Meal Plan'}
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm font-medium text-text-secondary">Client: {existingPlan?.client_name || 'Select Client'}</span>
              <span className="text-xs text-text-muted">·</span>
              <Badge variant="gray" size="sm">Draft</Badge>
              <StatusBadge status={existingPlan?.status || 'draft'} />
            </div>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Button variant="secondary" size="sm" icon={<History className="w-4 h-4" />}>History</Button>
            <Button variant="secondary" size="sm" icon={<Copy className="w-4 h-4" />}>Duplicate</Button>
            <Button variant="secondary" size="sm" icon={<FileDown className="w-4 h-4" />}>PDF</Button>
            <Button 
              size="sm" 
              onClick={() => {
                const payload = {
                  client_id: existingPlan?.client_id || 'new-client',
                  title: existingPlan?.title || 'New Meal Plan',
                  date_range: { start: new Date().toISOString(), end: new Date().toISOString() },
                  grid: grid,
                  total_nutrition_targets: totals
                };
                if (id) {
                  updateMutation.mutate(payload, { onSuccess: () => alert('Saved!') });
                } else {
                  createMutation.mutate(payload, { onSuccess: (res) => navigate(`/meal-plans/${res.id}`) });
                }
              }}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Plan'}
            </Button>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-6 items-start">
          
          {/* Main Grid */}
          <div className="flex-1 w-full overflow-x-auto bg-bg-surface border border-border-subtle rounded-xl shadow-sm">
            <div className="min-w-[1000px]">
              {/* Header Row (Days) */}
              <div className="grid grid-cols-8 border-b border-border-subtle bg-bg-elevated/50">
                <div className="p-4 border-r border-border-subtle flex items-center justify-center font-display font-semibold text-text-secondary">
                  Meal
                </div>
                {DAYS_OF_WEEK.map(day => (
                  <div key={day} className="p-4 border-r border-border-subtle last:border-0 text-center font-display font-semibold text-text-primary capitalize">
                    {DAY_LABELS[day]}
                  </div>
                ))}
              </div>

              {/* Body Rows (Meal Types) */}
              {MEAL_TYPES.map(mealType => (
                <div key={mealType} className="grid grid-cols-8 border-b border-border-subtle last:border-0">
                  
                  {/* Row Header */}
                  <div className="p-4 border-r border-border-subtle flex items-center justify-center font-display font-medium text-text-secondary capitalize bg-bg-elevated/20">
                    <span className="-rotate-90 sm:rotate-0 tracking-wider text-xs whitespace-nowrap">
                      {MEAL_LABELS[mealType]}
                    </span>
                  </div>

                  {/* Day Cells */}
                  {DAYS_OF_WEEK.map(day => {
                    const meals = grid[day][mealType];
                    return (
                      <div key={`${day}-${mealType}`} className="p-2 border-r border-border-subtle last:border-0 hover:bg-bg-input/30 transition-colors min-h-[140px] flex flex-col group relative">
                        <div className="flex-1 space-y-2">
                          {meals.map(meal => (
                            <div key={meal.id} className="bg-white border border-border-subtle p-2 rounded-md shadow-sm relative group/meal">
                              <p className="text-xs font-semibold text-text-primary leading-tight mb-1 truncate pr-4">{meal.name}</p>
                              <div className="flex flex-wrap gap-1">
                                <span className="text-[10px] px-1.5 py-0.5 bg-brand-primary/10 text-brand-primary rounded">{meal.calories}k</span>
                                <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">{meal.protein}p</span>
                              </div>
                              <button 
                                onClick={() => handleRemoveMeal(day, mealType, meal.id)}
                                className="absolute top-1 right-1 w-4 h-4 bg-accent-rose/10 hover:bg-accent-rose text-accent-rose hover:text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover/meal:opacity-100 transition-all">
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                        
                        <button 
                          onClick={() => handleOpenModal(day, mealType)}
                          className="mt-2 w-full flex items-center justify-center py-1.5 text-xs text-text-muted hover:text-brand-primary border border-dashed border-border-subtle hover:border-brand-primary/40 rounded bg-bg-surface transition-colors opacity-0 group-hover:opacity-100">
                          <PlusCircle className="w-3.5 h-3.5 mr-1" /> Add
                        </button>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Right Summary Panel */}
          <div className="w-full xl:w-[320px] flex-shrink-0">
            <div className="sticky top-24 space-y-4">
              <NutritionPanel 
                nutrition={averages}
                goals={{ calories: 2000, protein_g: 160, carbs_g: 220, fat_g: 70, fiber_g: 30 }}
                title="Daily Average (Over 7 Days)" 
              />
              
              <div className="bg-bg-surface border border-border-subtle rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-display font-semibold text-text-primary mb-3">Weekly Totals</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Calories</span>
                    <span className="font-medium text-text-primary">{totals.calories} kcal</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Protein</span>
                    <span className="font-medium text-text-primary">{totals.protein_g}g</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Carbs</span>
                    <span className="font-medium text-text-primary">{totals.carbs_g}g</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Fat</span>
                    <span className="font-medium text-text-primary">{totals.fat_g}g</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>

      {/* Add Meal Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-inverse/20 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-bg-surface border border-border-subtle rounded-xl p-6 w-full max-w-sm shadow-xl"
            >
              <h3 className="text-lg font-display font-semibold text-text-primary mb-1">Add Meal</h3>
              <p className="text-xs text-text-secondary mb-4 capitalize">
                {activeCell?.day} • {activeCell?.mealType}
              </p>
              
              <div className="space-y-3">
                <Input label="Meal Name (e.g. Oatmeal Bowl)" value={newMeal.name} onChange={e => setNewMeal({...newMeal, name: e.target.value})} autoFocus />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Calories" type="number" value={newMeal.calories || ''} onChange={e => setNewMeal({...newMeal, calories: parseInt(e.target.value)})} />
                  <Input label="Protein (g)" type="number" value={newMeal.protein || ''} onChange={e => setNewMeal({...newMeal, protein: parseInt(e.target.value)})} />
                  <Input label="Carbs (g)" type="number" value={newMeal.carbs || ''} onChange={e => setNewMeal({...newMeal, carbs: parseInt(e.target.value)})} />
                  <Input label="Fat (g)" type="number" value={newMeal.fat || ''} onChange={e => setNewMeal({...newMeal, fat: parseInt(e.target.value)})} />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleSaveMeal} disabled={!newMeal.name}>Save</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
