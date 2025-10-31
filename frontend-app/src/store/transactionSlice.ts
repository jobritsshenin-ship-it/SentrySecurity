import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Transaction, TransactionFilters, Pagination } from '@/types';

interface TransactionState {
  items: Transaction[];
  selectedIds: string[];
  filters: TransactionFilters;
  search: string;
  pagination: Pagination;
  selectedTransaction: Transaction | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TransactionState = {
  items: [],
  selectedIds: [],
  filters: {},
  search: '',
  pagination: {
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
    hasNext: false,
  },
  selectedTransaction: null,
  isLoading: false,
  error: null,
};

export const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    setItems: (state, action: PayloadAction<Transaction[]>) => {
      state.items = action.payload;
    },
    setPagination: (state, action: PayloadAction<Pagination>) => {
      state.pagination = action.payload;
    },
    setFilters: (state, action: PayloadAction<TransactionFilters>) => {
      state.filters = action.payload;
      state.pagination.page = 1;
    },
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
    selectTransaction: (state, action: PayloadAction<Transaction | null>) => {
      state.selectedTransaction = action.payload;
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
  setPagination,
  setFilters,
  setSearch,
  selectTransaction,
  toggleSelectId,
  selectAllIds,
  clearSelectedIds,
  setLoading,
  setError,
} = transactionSlice.actions;
export default transactionSlice.reducer;
