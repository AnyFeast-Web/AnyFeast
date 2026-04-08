import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ingredientsApi from '../api/ingredients.api';

export const useIngredients = (search?: string) =>
  useQuery({
    queryKey: ['ingredients', search],
    queryFn: () => ingredientsApi.getIngredients(search),
  });

export const useCreateIngredient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ingredientsApi.createIngredient,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ingredients'] }),
  });
};

export const useUpdateIngredient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ingredientsApi.Ingredient> }) => 
      ingredientsApi.updateIngredient(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ingredients'] }),
  });
};
