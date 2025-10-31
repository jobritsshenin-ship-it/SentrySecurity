import api from './api';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  MFAVerifyRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '@/types';

export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data.data;
  },

  register: async (data: RegisterRequest) => {
    const response = await api.post('/auth/register', data);
    return response.data.data;
  },

  verifyMFA: async (data: MFAVerifyRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/mfa/verify', data);
    return response.data.data;
  },

  refresh: async (refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<{ message: string }> => {
    const response = await api.post('/auth/forgot-password', data);
    return response.data.data;
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<{ message: string }> => {
    const response = await api.post('/auth/reset-password', data);
    return response.data.data;
  },
};
