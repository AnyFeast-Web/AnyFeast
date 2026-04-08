import api from './axiosInstance';

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export const getIngredients = (search?: string): Promise<Ingredient[]> =>
  api.get('ingredients/', { params: { search } }).then((r) => r.data);

export const createIngredient = (data: Partial<Ingredient>): Promise<Ingredient> =>
  api.post('ingredients/', data).then((r) => r.data);

export const updateIngredient = (id: string, data: Partial<Ingredient>): Promise<Ingredient> =>
  api.put(`ingredients/${id}/`, data).then((r) => r.data);
