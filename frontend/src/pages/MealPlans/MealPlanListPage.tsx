import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, CalendarDays, Copy, FileDown, Send } from 'lucide-react';
import { TopBar } from '../../components/layout/TopBar';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card, Button, Avatar, StatusBadge, Badge, Input } from '../../components/ui';
import { MacroBar } from '../../components/nutrition/MacroBar';
import { useMealPlans, useCreateMealPlan } from '../../hooks/useMealPlans';
import { useClients } from '../../hooks/useClients';
import { formatDate, formatCalories } from '../../utils/formatters';
import { DAYS_OF_WEEK, DAY_LABELS, MEAL_TYPES, MEAL_LABELS } from '../../utils/constants';
import { DayOfWeek, Client } from '../../types';

export function MealPlanListPage() {
  const navigate = useNavigate();
  const { data: plans = [], isLoading, error } = useMealPlans();
  const { data: clients = [] } = useClients();
  const createMutation = useCreateMealPlan();

  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [formError, setFormError] = useState<string | null>(null);

  // Handle deep-linking from Client Profile
  useState(() => {
    if (location.state?.openNew && location.state?.clientId) {
      setFormData({ 
        title: '', 
        client_id: location.state.clientId, 
        calories: 2000, 
        protein: 150, 
        carbs: 200, 
        fat: 70 
      });
      setIsModalOpen(true);
      // Clear state so it doesn't reopen on refresh
      window.history.replaceState({}, document.title);
    }
  });

  const handleOpenNew = () => {
    setFormData({ title: '', client_id: '', calories: 2000, protein: 150, carbs: 200, fat: 70 });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_id) {
      setFormError("Please select a client");
      return;
    }

    const selectedClient = clients.find((c: Client) => c.id === formData.client_id);
    const clientName = selectedClient ? `${selectedClient.personal_info.first_name} ${selectedClient.personal_info.last_name}`.trim() : 'Unknown';

    const payload = {
      client_id: formData.client_id,
      client_name: clientName,
      title: formData.title,
      status: 'draft',
      date_range: {
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      grid: {
        monday: { breakfast: [], lunch: [], dinner: [], snack: [] },
        tuesday: { breakfast: [], lunch: [], dinner: [], snack: [] },
        wednesday: { breakfast: [], lunch: [], dinner: [], snack: [] },
        thursday: { breakfast: [], lunch: [], dinner: [], snack: [] },
        friday: { breakfast: [], lunch: [], dinner: [], snack: [] },
        saturday: { breakfast: [], lunch: [], dinner: [], snack: [] },
        sunday: { breakfast: [], lunch: [], dinner: [], snack: [] }
      },
      total_nutrition_targets: {
        calories: formData.calories,
        protein_g: formData.protein,
        carbs_g: formData.carbs,
        fat_g: formData.fat
      }
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        setIsModalOpen(false);
      },
      onError: (err: any) => {
        setFormError(err.response?.data?.detail?.[0]?.msg || "Failed to create meal plan");
      }
    });
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
                    <span>
                      {plan.date_range?.start_date 
                        ? `${formatDate(plan.date_range.start_date)} — ${formatDate(plan.date_range.end_date)}` 
                        : plan.date_range?.start
                        ? `${formatDate(plan.date_range.start)} — ${formatDate(plan.date_range.end)}`
                        : 'No dates'}
                    </span>
                    <Badge variant="gray" size="sm">v{plan.version || 1}</Badge>
                  </div>
                  {(plan.total_nutrition || plan.total_nutrition_targets) && (
                    <>
                      {(() => {
                        const nutrition = plan.total_nutrition || plan.total_nutrition_targets;
                        return (
                          <>
                            <p className="mono-number text-2xl text-brand-primary mb-3">
                              {formatCalories(nutrition.calories || 0)}
                            </p>
                            <MacroBar 
                              protein={nutrition.protein_g || 0} 
                              carbs={nutrition.carbs_g || 0} 
                              fat={nutrition.fat_g || 0} 
                            />
                            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border-subtle">
                              <div className="flex-1 text-center">
                                <p className="mono-number text-sm text-macro-protein">{Math.round(nutrition.protein_g || 0)}g</p>
                                <p className="text-xs text-text-muted">Protein</p>
                              </div>
                              <div className="w-px h-8 bg-border-subtle" />
                              <div className="flex-1 text-center">
                                <p className="mono-number text-sm text-macro-carbs">{Math.round(nutrition.carbs_g || 0)}g</p>
                                <p className="text-xs text-text-muted">Carbs</p>
                              </div>
                              <div className="w-px h-8 bg-border-subtle" />
                              <div className="flex-1 text-center">
                                <p className="mono-number text-sm text-macro-fat">{Math.round(nutrition.fat_g || 0)}g</p>
                                <p className="text-xs text-text-muted">Fat</p>
                              </div>
                            </div>
                          </>
                        );
                      })()}
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
                  label="Plan Title" 
                  placeholder="e.g. 4-Week Weight Loss Plan" 
                  value={formData.title || ''} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  required 
                />
                
                <div>
                  <label className="block text-xs font-display font-semibold text-text-secondary uppercase mb-1.5">Select Client</label>
                  <select 
                    value={formData.client_id || ''} 
                    onChange={e => setFormData({...formData, client_id: e.target.value})}
                    className="w-full bg-bg-input border border-border-subtle rounded-md px-3.5 py-2.5 text-sm font-body text-text-primary focus:border-brand-primary focus:outline-none transition-colors"
                    required
                  >
                    <option value="">Choose a client...</option>
                    {clients.map((c: Client) => (
                      <option key={c.id} value={c.id}>
                        {c.personal_info.first_name} {c.personal_info.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Daily Calories" 
                    type="number"
                    value={formData.calories || ''} 
                    onChange={e => setFormData({...formData, calories: Number(e.target.value)})} 
                  />
                  <Input 
                    label="Protein (g)" 
                    type="number"
                    value={formData.protein || ''} 
                    onChange={e => setFormData({...formData, protein: Number(e.target.value)})} 
                  />
                </div>

                {formError && (
                  <p className="text-xs text-accent-rose bg-accent-rose/10 p-2 rounded">{formError}</p>
                )}

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
