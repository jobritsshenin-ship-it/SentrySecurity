import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Alert, AlertFilters, Pagination } from '@/types';

interface AlertState {
  items: Alert[];
  selectedIds: string[];
  filters: AlertFilters;
  pagination: Pagination;
  selectedAlert: Alert | null;
  isLoading: boolean;
  error: string | null;
  unreadCount: number;
}

const initialState: AlertState = {
  items: [],
  selectedIds: [],
  filters: {
    severity: ['CRITICAL', 'HIGH'],
  },
  pagination: {
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
    hasNext: false,
  },
  selectedAlert: null,
  isLoading: false,
  error: null,
  unreadCount: 0,
};

export const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    setItems: (state, action: PayloadAction<Alert[]>) => {
      state.items = action.payload;
    },
    addAlert: (state, action: PayloadAction<Alert>) => {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
    updateAlert: (state, action: PayloadAction<Alert>) => {
      const index = state.items.findIndex((a) => a.alertId === action.payload.alertId);
      if (index > -1) {
        state.items[index] = action.payload;
      }
      if (state.selectedAlert?.alertId === action.payload.alertId) {
        state.selectedAlert = action.payload;
      }
    },
    setPagination: (state, action: PayloadAction<Pagination>) => {
      state.pagination = action.payload;
    },
    setFilters: (state, action: PayloadAction<AlertFilters>) => {
      state.filters = action.payload;
      state.pagination.page = 1;
    },
    selectAlert: (state, action: PayloadAction<Alert | null>) => {
      state.selectedAlert = action.payload;
    },
    toggleSelectId: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const index = state.selectedIds.indexOf(id);
      if (index > -1) {
        state.selectedIds.splice(index, 1);
      } else {
        state.selectedIds.push(id);
      }
    },
    selectAllIds: (state, action: PayloadAction<string[]>) => {
      state.selectedIds = action.payload;
    },
    clearSelectedIds: (state) => {
      state.selectedIds = [];
    },
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
    resetUnreadCount: (state) => {
      state.unreadCount = 0;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setItems,
  addAlert,
  updateAlert,
  setPagination,
  setFilters,
  selectAlert,
  toggleSelectId,
  selectAllIds,
  clearSelectedIds,
  setUnreadCount,
  resetUnreadCount,
  setLoading,
  setError,
} = alertSlice.actions;
export default alertSlice.reducer;
