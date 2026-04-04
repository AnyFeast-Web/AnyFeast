import api from './axiosInstance';

export interface DashboardStats {
  total_active_clients: number;
  pending_consultations: number;
  active_meal_plans: number;
  compliance_rate: number;
  urgent_alerts: any[];
  recent_activity: any[];
}

export const getDashboardStats = (): Promise<DashboardStats> =>
  api.get('/dashboard/stats').then((r) => r.data);
