import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { store } from '@/store/store';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let refreshing = false;
let failedQueue: Array<{
  onSuccess: (token: string) => void;
  onFailed: (error: AxiosError) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.onFailed(error);
    } else {
      prom.onSuccess(token!);
    }
  });

  failedQueue = [];
};

// Request interceptor - add JWT token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const state = store.getState();
    const token = state.auth.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 and retry
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (refreshing) {
        return new Promise((onSuccess, onFailed) => {
          failedQueue.push({ onSuccess, onFailed });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      refreshing = true;
      originalRequest._retry = true;

      const state = store.getState();
      const refreshToken = state.auth.refreshToken;

      if (refreshToken) {
        try {
          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            { refreshToken },
            { withCredentials: true }
          );

          const { accessToken } = response.data.data;
          store.dispatch({
            type: 'auth/setToken',
            payload: accessToken,
          } as any);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }

          processQueue(null, accessToken);
          return api(originalRequest);
        } catch (err) {
          processQueue(err as AxiosError, null);
          store.dispatch({ type: 'auth/logout' } as any);
          window.location.href = '/login';
          return Promise.reject(err);
        } finally {
          refreshing = false;
        }
      }
    }

    // Retry logic for 5xx errors (max 3 times with exponential backoff)
    if (
      error.response?.status &&
      error.response.status >= 500 &&
      !originalRequest._retryCount
    ) {
      originalRequest._retryCount = 0;
    }

    if (originalRequest._retryCount !== undefined && originalRequest._retryCount < 3) {
      originalRequest._retryCount += 1;
      const delay = Math.pow(2, originalRequest._retryCount - 1) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default api;
