import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, CalendarDays, Copy, FileDown, Send } from 'lucide-react';
import { TopBar } from '../../components/layout/TopBar';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card, Button, Avatar, StatusBadge, Badge, Input } from '../../components/ui';
import { MacroBar } from '../../components/nutrition/MacroBar';
import { useMealPlans } from '../../hooks/useMealPlans';
import { formatDate, formatCalories } from '../../utils/formatters';
import { DAYS_OF_WEEK, DAY_LABELS, MEAL_TYPES, MEAL_LABELS } from '../../utils/constants';
import { DayOfWeek } from '../../types';

export function MealPlanListPage() {
  const navigate = useNavigate();
  const { data: plans = [], isLoading, error } = useMealPlans();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const handleOpenNew = () => {
    setFormData({ title: '', client: '', calories: '', duration: '', diet_type: 'Standard' });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Assuming a generic API handler or hook mutation will be added later
    setIsModalOpen(false);
  };

  return (
    <>
      <TopBar title="Meal Plans" subtitle={`${plans.length} total plans`}
        actions={<Button icon={<PlusCircle className="w-4 h-4" />} size="sm" onClick={handleOpenNew}>Create Plan</Button>} />
      <PageWrapper>
        {isLoading && (
          <div className="flex h-64 items-center justify-center">
            <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {error && (
          <div className="p-4 bg-accent-rose/10 text-accent-rose rounded-lg text-center">
            Failed to load meal plans.
          </div>
        )}
        {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {plans.map((plan: any, i: number) => (
            <motion.div key={plan.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}>
              <Card className="h-full cursor-pointer" onClick={() => navigate(`/meal-plans/${plan.id}`)}>
                <Card.Header>
                  <div className="flex items-center gap-2">
                    <Avatar name={plan.client_name || "Unknown"} size="sm" active />
                    <span className="text-sm font-display font-medium text-text-primary">{plan.client_name || "Unknown Client"}</span>
                  </div>
                  <StatusBadge status={plan.status || "draft"} />
                </Card.Header>
                <Card.Body>
                  <h3 className="text-md font-display font-semibold text-text-primary mb-1">{plan.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-text-secondary mb-4">
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span>{plan.date_range ? `${formatDate(plan.date_range.start)} — ${formatDate(plan.date_range.end)}` : 'No dates'}</span>
                    <Badge variant="gray" size="sm">v{plan.version || 1}</Badge>
                  </div>
                  {plan.total_nutrition && (
                    <>
                      <p className="mono-number text-2xl text-brand-primary mb-3">{formatCalories(plan.total_nutrition.calories || 0)}</p>
                      <MacroBar protein={plan.total_nutrition.protein_g || 0} carbs={plan.total_nutrition.carbs_g || 0} fat={plan.total_nutrition.fat_g || 0} />
                      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border-subtle">
                        <div className="flex-1 text-center">
                          <p className="mono-number text-sm text-macro-protein">{Math.round(plan.total_nutrition.protein_g || 0)}g</p>
                          <p className="text-xs text-text-muted">Protein</p>
                        </div>
                        <div className="w-px h-8 bg-border-subtle" />
                        <div className="flex-1 text-center">
                          <p className="mono-number text-sm text-macro-carbs">{Math.round(plan.total_nutrition.carbs_g || 0)}g</p>
                          <p className="text-xs text-text-muted">Carbs</p>
                        </div>
                        <div className="w-px h-8 bg-border-subtle" />
                        <div className="flex-1 text-center">
                          <p className="mono-number text-sm text-macro-fat">{Math.round(plan.total_nutrition.fat_g || 0)}g</p>
                          <p className="text-xs text-text-muted">Fat</p>
                        </div>
                      </div>
                    </>
                  )}
                </Card.Body>
              </Card>
            </motion.div>
          ))}
        </div>
        )}
      </PageWrapper>

      {/* New Meal Plan Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-inverse/20 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-bg-surface border border-border-subtle rounded-xl p-6 w-full max-w-lg shadow-xl"
            >
              <h3 className="text-lg font-display font-semibold text-text-primary mb-4">Add Meal Plan</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input 
                  label="Title" 
                  placeholder="e.g. 4-Week Weight Loss Plan" 
                  value={formData.title || ''} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  required 
                />
                <Input 
                  label="Client Name" 
                  placeholder="e.g. Jane Doe" 
                  value={formData.client || ''} 
                  onChange={e => setFormData({...formData, client: e.target.value})} 
                  required 
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Calories target" 
                    type="number"
                    placeholder="e.g. 2000" 
                    value={formData.calories || ''} 
                    onChange={e => setFormData({...formData, calories: Number(e.target.value)})} 
                  />
                  <Input 
                    label="Duration (weeks)" 
                    type="number"
                    placeholder="e.g. 4" 
                    value={formData.duration || ''} 
                    onChange={e => setFormData({...formData, duration: Number(e.target.value)})} 
                  />
                </div>

                <div>
                  <label className="block text-xs font-display font-semibold text-text-secondary uppercase mb-1.5">Diet Type</label>
                  <select 
                    value={formData.diet_type || 'Standard'} 
                    onChange={e => setFormData({...formData, diet_type: e.target.value})}
                    className="w-full bg-bg-input border border-border-subtle rounded-md px-3.5 py-2.5 text-sm font-body text-text-primary focus:border-brand-primary focus:outline-none transition-colors"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Keto">Keto</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Paleo">Paleo</option>
                    <option value="High Protein">High Protein</option>
                  </select>
                </div>

                <div className="flex gap-3 mt-8 pt-4 border-t border-border-subtle">
                  <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Create Plan
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <button 
        onClick={handleOpenNew}
        className="fixed bottom-6 right-6 w-14 h-14 bg-brand-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-brand-dim transition-colors z-40"
        title="Add Meal Plan"
      >
        <PlusCircle className="w-6 h-6" />
      </button>
    </>
  );
}
