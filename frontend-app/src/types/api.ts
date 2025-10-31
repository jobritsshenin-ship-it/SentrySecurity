export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  error?: string | null;
  message?: string;
  timestamp: string;
  requestId: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}
