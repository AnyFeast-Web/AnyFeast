import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusCircle, CalendarDays, Copy, FileDown, Send } from 'lucide-react';
import { TopBar } from '../../components/layout/TopBar';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card, Button, Avatar, StatusBadge, Badge } from '../../components/ui';
import { MacroBar } from '../../components/nutrition/MacroBar';
import { useMealPlans } from '../../hooks/useMealPlans';
import { formatDate, formatCalories } from '../../utils/formatters';
import { DAYS_OF_WEEK, DAY_LABELS, MEAL_TYPES, MEAL_LABELS } from '../../utils/constants';
import { DayOfWeek } from '../../types';

export function MealPlanListPage() {
  const navigate = useNavigate();
  const { data: plans = [], isLoading, error } = useMealPlans();

  return (
    <>
      <TopBar title="Meal Plans" subtitle={`${plans.length} total plans`}
        actions={<Button icon={<PlusCircle className="w-4 h-4" />} size="sm" onClick={() => navigate('/meal-plans/new')}>Create Plan</Button>} />
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
    </>
  );
}
