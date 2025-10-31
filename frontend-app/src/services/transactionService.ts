import api from './api';
import { Transaction, TransactionDetail, TransactionFilters, TransactionListResponse, FlagTransactionRequest } from '@/types';

export const transactionService = {
  getTransactions: async (
    filters?: TransactionFilters,
    page: number = 1,
    limit: number = 25,
    sortBy: string = 'riskScore',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<TransactionListResponse> => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      sortBy,
      sortOrder,
      ...Object.fromEntries(
        Object.entries(filters || {})
          .filter(([_, v]) => v !== undefined && v !== null)
          .map(([k, v]) => [k, String(v)])
      ),
    });

    const response = await api.get(`/transactions?${params}`);
    return response.data.data;
  },

  getTransactionById: async (id: string): Promise<TransactionDetail> => {
    const response = await api.get(`/transactions/${id}`);
    return response.data.data;
  },

  flagTransaction: async (id: string, reason: string): Promise<{ transactionId: string; alertId: string }> => {
    const response = await api.post(`/transactions/${id}/flag`, { reason } as FlagTransactionRequest);
    return response.data.data;
  },

  unflagTransaction: async (id: string): Promise<{ transactionId: string }> => {
    const response = await api.post(`/transactions/${id}/unflag`);
    return response.data.data;
  },

  searchTransactions: async (query: string): Promise<{ transactions: Transaction[] }> => {
    const response = await api.get('/transactions/search', { params: { q: query } });
    return response.data.data;
  },

  exportTransactions: async (format: 'csv' | 'json' | 'xlsx', filters?: TransactionFilters) => {
    const params = new URLSearchParams({
      format,
      ...Object.fromEntries(
        Object.entries(filters || {})
          .filter(([_, v]) => v !== undefined && v !== null)
          .map(([k, v]) => [k, String(v)])
      ),
    });

    const response = await api.get(`/transactions/export?${params}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  bulkAction: async (
    transactionIds: string[],
    action: 'FLAG' | 'UNFLAG' | 'ASSIGN',
    assignTo?: string
  ): Promise<{ processed: number; failed: number }> => {
    const response = await api.post('/transactions/bulk-action', {
      transactionIds,
      action,
      assignTo,
    });
    return response.data.data;
  },
};
