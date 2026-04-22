import api from './axiosInstance';

export const getMealPlans = (clientId?: string): Promise<any[]> => {
  const url = clientId ? `mealplans/?client_id=${clientId}` : 'mealplans/';
  return api.get(url).then((r) => r.data);
};

export const getMealPlanById = (id: string): Promise<any> =>
  api.get(`mealplans/${id}/`).then((r) => r.data);

export const createMealPlan = (data: any): Promise<any> =>
  api.post('mealplans/', data).then((r) => r.data);

export const updateMealPlan = (id: string, data: any): Promise<any> =>
  api.put(`mealplans/${id}/`, data).then((r) => r.data);

export const deleteMealPlan = (id: string): Promise<any> =>
  api.delete(`mealplans/${id}/`).then((r) => r.data);
