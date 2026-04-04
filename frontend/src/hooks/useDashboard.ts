import { useQuery } from '@tanstack/react-query';
import * as dashboardApi from '../api/dashboard.api';

export const useDashboardStats = () =>
  useQuery({ queryKey: ['dashboard_stats'], queryFn: dashboardApi.getDashboardStats });
