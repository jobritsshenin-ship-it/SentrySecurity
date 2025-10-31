import { format, formatDistanceToNow } from 'date-fns';

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatDate = (date: string | Date, formatStr: string = 'MMM dd, yyyy'): string => {
  return format(new Date(date), formatStr);
};

export const formatTime = (date: string | Date, formatStr: string = 'h:mm a'): string => {
  return format(new Date(date), formatStr);
};

export const formatDateTime = (date: string | Date, formatStr: string = 'MMM dd, yyyy h:mm a'): string => {
  return format(new Date(date), formatStr);
};

export const formatRelativeTime = (date: string | Date): string => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const formatRiskScore = (score: number): string => {
  return (score * 100).toFixed(1);
};

export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(2)}%`;
};

export const formatTransactionId = (id: string, maxLen: number = 12): string => {
  return id.length > maxLen ? `${id.substring(0, maxLen)}...` : id;
};
