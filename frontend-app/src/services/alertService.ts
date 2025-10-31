import api from './api';
import { Alert, AlertDetail, AlertFilters, AlertListResponse, ResolveAlertRequest, DismissAlertRequest } from '@/types';

export const alertService = {
  getAlerts: async (
    filters?: AlertFilters,
    page: number = 1,
    limit: number = 25
  ): Promise<AlertListResponse> => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    // Add array parameters
    if (filters?.severity && filters.severity.length > 0) {
      filters.severity.forEach((s) => params.append('severity[]', s));
    }
    if (filters?.status && filters.status.length > 0) {
      filters.status.forEach((s) => params.append('status[]', s));
    }
    if (filters?.alertType && filters.alertType.length > 0) {
      filters.alertType.forEach((t) => params.append('alertType[]', t));
    }

    // Add single value parameters
    const singleParams = { assignedTo: filters?.assignedTo, dateFrom: filters?.dateFrom, dateTo: filters?.dateTo };
    Object.entries(singleParams).forEach(([k, v]) => {
      if (v !== undefined && v !== null) params.append(k, String(v));
    });

    const response = await api.get(`/alerts?${params}`);
    return response.data.data;
  },

  getAlertById: async (id: string): Promise<AlertDetail> => {
    const response = await api.get(`/alerts/${id}`);
    return response.data.data;
  },

  updateAlert: async (id: string, updates: Partial<Alert>): Promise<Alert> => {
    const response = await api.put(`/alerts/${id}`, updates);
    return response.data.data;
  },

  resolveAlert: async (id: string, data: ResolveAlertRequest): Promise<Alert> => {
    const response = await api.post(`/alerts/${id}/resolve`, data);
    return response.data.data;
  },

  dismissAlert: async (id: string, data: DismissAlertRequest): Promise<Alert> => {
    const response = await api.post(`/alerts/${id}/dismiss`, data);
    return response.data.data;
  },

  assignAlert: async (id: string, analystId: string): Promise<Alert> => {
    const response = await api.put(`/alerts/${id}`, { assignedTo: analystId });
    return response.data.data;
  },

  getTransactionHistory: async (alertId: string) => {
    const response = await api.get(`/alerts/${alertId}/transaction-history`);
    return response.data.data;
  },

  bulkAction: async (
    alertIds: string[],
    action: 'ASSIGN' | 'RESOLVE' | 'DISMISS',
    params?: {
      assignTo?: string;
      resolution?: string;
      reason?: string;
    }
  ): Promise<{ processed: number; failed: number }> => {
    const response = await api.post('/alerts/bulk-action', {
      alertIds,
      action,
      ...params,
    });
    return response.data.data;
  },
};
