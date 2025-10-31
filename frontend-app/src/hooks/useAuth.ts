import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { setAuthData, logout, setLoading, setError } from '@/store/authSlice';
import { authService } from '@/services/authService';
import { LoginRequest, RegisterRequest, AuthResponse } from '@/types';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);

  const login = async (credentials: LoginRequest) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const response = await authService.login(credentials);
      dispatch(setAuthData(response));
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch(setError(message));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const response = await authService.register(data);
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch(setError(message));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const logoutUser = async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Silent fail, logout locally anyway
    }
    dispatch(logout());
  };

  const hasPermission = (permission: string): boolean => {
    return auth.permissions.includes(permission);
  };

  return {
    ...auth,
    login,
    register,
    logout: logoutUser,
    hasPermission,
  };
};
