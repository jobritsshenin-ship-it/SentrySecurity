export interface KPIData {
  todayMetrics: {
    totalTransactions: number;
    activeAlerts: number;
    detectionAccuracy: number;
    pendingCases: number;
    systemUptime: number;
  };
  trends: {
    transactionsTrend: number;
    alertsTrend: number;
    accuracyTrend: number;
  };
}

export interface TransactionTrendData {
  timestamp: string;
  count: number;
}

export interface AlertDistribution {
  UNUSUAL_AMOUNT: number;
  VELOCITY_CHECK: number;
  GEOGRAPHIC_ANOMALY: number;
  NETWORK_FRAUD: number;
  ACCOUNT_COMPROMISE: number;
}

export interface DashboardAnalytics {
  transactionTrend: TransactionTrendData[];
  alertDistribution: AlertDistribution;
  accuracyTrend: Array<{
    date: string;
    accuracy: number;
    precision: number;
    recall: number;
  }>;
}
