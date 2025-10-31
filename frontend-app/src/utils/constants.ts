// Severity colors
export const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '#d32f2f',
  HIGH: '#f57c00',
  MEDIUM: '#fbc02d',
  LOW: '#1976d2',
};

// Status colors
export const STATUS_COLORS: Record<string, string> = {
  NEW: '#1976d2',
  IN_REVIEW: '#f57c00',
  RESOLVED: '#388e3c',
  FALSE_POSITIVE: '#757575',
  COMPLETED: '#388e3c',
  FLAGGED: '#f57c00',
  BLOCKED: '#d32f2f',
  OPEN: '#1976d2',
  IN_PROGRESS: '#f57c00',
  CLOSED: '#388e3c',
  ESCALATED: '#d32f2f',
  PENDING_APPROVAL: '#fbc02d',
};

// Role permissions
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: [
    'view_dashboard',
    'view_transactions',
    'flag_transactions',
    'view_alerts',
    'resolve_alerts',
    'view_cases',
    'create_cases',
    'view_rules',
    'create_rules',
    'view_analytics',
    'manage_users',
    'manage_settings',
  ],
  ANALYST: [
    'view_dashboard',
    'view_transactions',
    'flag_transactions',
    'view_alerts',
    'resolve_alerts',
    'view_cases',
    'create_cases',
    'view_analytics',
  ],
  MANAGER: ['view_dashboard', 'view_cases', 'view_analytics'],
  AUDITOR: ['view_dashboard', 'view_analytics'],
  READONLY: ['view_dashboard', 'view_analytics'],
};

// Risk score thresholds
export const RISK_THRESHOLDS = {
  LOW: 0.3,
  MEDIUM: 0.5,
  HIGH: 0.7,
  CRITICAL: 0.9,
};

// Alert types
export const ALERT_TYPES = [
  'UNUSUAL_AMOUNT',
  'VELOCITY_CHECK',
  'GEOGRAPHIC_ANOMALY',
  'NETWORK_FRAUD',
  'ACCOUNT_COMPROMISE',
];

// Merchant categories
export const MERCHANT_CATEGORIES = [
  'Electronics',
  'Groceries',
  'Travel',
  'Entertainment',
  'Healthcare',
  'Utilities',
  'Other',
];

// Pagination
export const DEFAULT_PAGE_SIZE = 25;
export const PAGE_SIZE_OPTIONS = [25, 50, 100];

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    MFA_VERIFY: '/auth/mfa/verify',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  TRANSACTIONS: {
    LIST: '/transactions',
    DETAIL: '/transactions/:id',
    FLAG: '/transactions/:id/flag',
    UNFLAG: '/transactions/:id/unflag',
    SEARCH: '/transactions/search',
    EXPORT: '/transactions/export',
    BULK_ACTION: '/transactions/bulk-action',
  },
  ALERTS: {
    LIST: '/alerts',
    DETAIL: '/alerts/:id',
    UPDATE: '/alerts/:id',
    RESOLVE: '/alerts/:id/resolve',
    DISMISS: '/alerts/:id/dismiss',
    BULK_ACTION: '/alerts/bulk-action',
  },
  DASHBOARD: {
    KPIS: '/dashboard/kpis',
    ANALYTICS: '/dashboard/analytics',
  },
};
