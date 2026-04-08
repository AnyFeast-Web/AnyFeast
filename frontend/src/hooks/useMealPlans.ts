import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as mealplansApi from '../api/mealplans.api';

export const useMealPlans = () =>
  useQuery({ queryKey: ['meal_plans'], queryFn: mealplansApi.getMealPlans });

export const useMealPlan = (id: string) =>
  useQuery({
    queryKey: ['meal_plans', id],
    queryFn: () => mealplansApi.getMealPlanById(id),
    enabled: !!id,
  });

export const useCreateMealPlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: mealplansApi.createMealPlan,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['meal_plans'] }),
  });
};

export const useUpdateMealPlan = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => mealplansApi.updateMealPlan(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['meal_plans'] });
      qc.invalidateQueries({ queryKey: ['meal_plans', id] });
    },
  });
};

export const useDeleteMealPlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: mealplansApi.deleteMealPlan,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['meal_plans'] }),
  });
};
