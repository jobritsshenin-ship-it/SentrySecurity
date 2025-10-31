import api from './api';
import { KPIData, DashboardAnalytics } from '@/types';

export const dashboardService = {
  getKPIs: async (): Promise<KPIData> => {
    const response = await api.get('/dashboard/kpis');
    return response.data.data;
  },

  getAnalytics: async (): Promise<DashboardAnalytics> => {
    const response = await api.get('/dashboard/analytics');
    return response.data.data;
  },
};
