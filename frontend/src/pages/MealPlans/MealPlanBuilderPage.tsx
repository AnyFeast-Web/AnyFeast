import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  PlusCircle, Save, FileDown, Trash2, ChevronDown, ChevronUp, 
  ShoppingCart, Clock, Info, Check, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TopBar } from '../../components/layout/TopBar';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Button, Input } from '../../components/ui';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
const GROCERY_CATEGORIES = ['Produce', 'Dairy', 'Protein', 'Grains', 'Pantry', 'Other'];

const emptyMeal = () => ({
  name: '',
  servingSize: '',
  prepTime: '',
  cookTime: '',
  calories: 0,
  protein: 0,
  carbs: 0,
  fats: 0,
  prepTips: '',
  alternatives: ''
});

export function MealPlanBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'schedule' | 'groceries'>('schedule');
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

  // State for Groceries
  const [groceries, setGroceries] = useState<{ id: string; name: string; category: string }[]>([]);
  const [newGroceryItem, setNewGroceryItem] = useState('');
  const [newGroceryCategory, setNewGroceryCategory] = useState(GROCERY_CATEGORIES[0]);

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

  const addGrocery = () => {
    if (!newGroceryItem) return;
    setGroceries([...groceries, { id: Math.random().toString(), name: newGroceryItem, category: newGroceryCategory }]);
    setNewGroceryItem('');
  };

  const removeGrocery = (id: string) => {
    setGroceries(groceries.filter(g => g.id !== id));
  };

  const handleSave = () => {
    alert("Meal plan saved successfully!");
  };

  return (
    <>
      <TopBar title="Interactive Meal Plan Builder" />
      <PageWrapper>
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-display font-bold text-text-primary">Weekly Meal Plan Formulation</h2>
            <p className="text-sm text-text-secondary mt-1">Design a comprehensive diet plan without database constraints.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" icon={<FileDown className="w-4 h-4" />} onClick={() => window.print()}>
              Export PDF
            </Button>
            <Button icon={<Save className="w-4 h-4" />} onClick={handleSave}>
              Save Plan
            </Button>
          </div>
        </div>

        {/* Custom Tabs */}
        <div className="flex gap-4 mb-6 border-b border-border-subtle pb-2">
          <button 
            className={`pb-2 px-1 text-sm font-display font-semibold transition-colors ${activeTab === 'schedule' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-text-secondary hover:text-text-primary'}`}
            onClick={() => setActiveTab('schedule')}
          >
            Weekly Schedule
          </button>
          <button 
            className={`pb-2 px-1 text-sm font-display font-semibold transition-colors ${activeTab === 'groceries' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-text-secondary hover:text-text-primary'}`}
            onClick={() => setActiveTab('groceries')}
          >
            Grocery List
          </button>
        </div>

        {activeTab === 'schedule' && (
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
                                        value={data.protein || ''}
                                        onChange={(e) => updateMeal(day, meal, 'protein', parseInt(e.target.value) || 0)}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-semibold text-text-secondary uppercase mb-1 text-teal-600">Carbs (g)</label>
                                      <input 
                                        type="number"
                                        className="w-full bg-bg-input border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-primary font-mono"
                                        value={data.carbs || ''}
                                        onChange={(e) => updateMeal(day, meal, 'carbs', parseInt(e.target.value) || 0)}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-semibold text-text-secondary uppercase mb-1 text-accent-amber">Fats (g)</label>
                                      <input 
                                        type="number"
                                        className="w-full bg-bg-input border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-primary font-mono"
                                        value={data.fats || ''}
                                        onChange={(e) => updateMeal(day, meal, 'fats', parseInt(e.target.value) || 0)}
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
        )}

        {activeTab === 'groceries' && (
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 shadow-sm">
            <h3 className="font-display font-bold text-lg text-text-primary mb-6 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-brand-primary" /> Organized Grocery List
            </h3>
            
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <div className="flex-1">
                <Input 
                  label="Add new item" 
                  placeholder="e.g. 1 dozen eggs" 
                  value={newGroceryItem}
                  onChange={(e) => setNewGroceryItem(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addGrocery()}
                />
              </div>
              <div className="sm:w-48">
                <label className="block text-xs font-semibold text-text-secondary mb-[6px]">CATEGORY</label>
                <select 
                  className="w-full bg-bg-input border border-border-subtle rounded-md px-3 py-2 h-[42px] text-sm text-text-primary focus:outline-none focus:border-brand-primary"
                  value={newGroceryCategory}
                  onChange={(e) => setNewGroceryCategory(e.target.value)}
                >
                  {GROCERY_CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="flex items-end">
                <Button onClick={addGrocery} icon={<PlusCircle className="w-4 h-4" />}>Add</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {GROCERY_CATEGORIES.map(category => {
                const categoryItems = groceries.filter(g => g.category === category);
                if (categoryItems.length === 0) return null;
                
                return (
                  <div key={category} className="bg-bg-elevated/30 rounded-lg p-5 border border-border-subtle shadow-sm">
                    <h4 className="font-display font-semibold text-brand-primary mb-3 text-sm uppercase tracking-wider border-b border-border-subtle pb-2">{category}</h4>
                    <ul className="space-y-2">
                      {categoryItems.map(item => (
                        <li key={item.id} className="flex justify-between items-center text-sm p-2.5 bg-bg-surface border border-border-subtle rounded shadow-sm">
                          <span className="text-text-primary font-medium">{item.name}</span>
                          <button onClick={() => removeGrocery(item.id)} className="text-text-muted hover:text-accent-rose transition-colors p-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
            {groceries.length === 0 && (
              <div className="text-center py-16 bg-bg-elevated/20 rounded-lg border-2 border-dashed border-border-subtle">
                <ShoppingCart className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
                <p className="text-text-secondary text-base">Your grocery list is empty. Add items above to get started.</p>
              </div>
            )}
          </div>
        )}
      </PageWrapper>
    </>
  );
}
