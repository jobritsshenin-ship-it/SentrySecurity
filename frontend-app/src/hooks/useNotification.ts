import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { addToast, removeToast } from '@/store/notificationSlice';

export const useNotification = () => {
  const dispatch = useDispatch<AppDispatch>();

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration = 3000) => {
    const toastId = Date.now().toString();
    dispatch(
      addToast({
        message,
        type,
        duration,
      })
    );
    return toastId;
  };

  const success = (message: string, duration = 3000) => showToast(message, 'success', duration);
  const error = (message: string, duration = 5000) => showToast(message, 'error', duration);
  const warning = (message: string, duration = 4000) => showToast(message, 'warning', duration);
  const info = (message: string, duration = 3000) => showToast(message, 'info', duration);

  const hideToast = (toastId: string) => {
    dispatch(removeToast(toastId));
  };

  return {
    showToast,
    success,
    error,
    warning,
    info,
    hideToast,
  };
};
