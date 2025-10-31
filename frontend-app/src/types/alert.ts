export interface Alert {
  alertId: string;
  transactionId: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  alertType: 'UNUSUAL_AMOUNT' | 'VELOCITY_CHECK' | 'GEOGRAPHIC_ANOMALY' | 'NETWORK_FRAUD' | 'ACCOUNT_COMPROMISE';
  status: 'NEW' | 'IN_REVIEW' | 'RESOLVED' | 'FALSE_POSITIVE';
  riskScore: number;
  riskExplanation: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: {
    userId: string;
    name: string;
  };
}

export interface AlertDetail extends Alert {
  riskFactors: Array<{
    factor: string;
    confidence: number;
    details: string;
  }>;
  transactionDetails: {
    customerId: string;
    amount: number;
    merchant: string;
  };
  customerHistory: Array<{
    transactionId: string;
    amount: number;
    timestamp: string;
  }>;
  notes: Array<{
    analystId: string;
    content: string;
    createdAt: string;
  }>;
  actionHistory: Array<{
    action: string;
    actor: string;
    timestamp: string;
    details: string;
  }>;
}

export interface AlertFilters {
  severity?: string[];
  status?: string[];
  alertType?: string[];
  assignedTo?: string;
  dateFrom?: string;
  dateTo?: string;
  riskScoreMin?: number;
  riskScoreMax?: number;
}

export interface AlertListResponse {
  alerts: Alert[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
  };
}

export interface ResolveAlertRequest {
  resolution: 'FRAUD_CONFIRMED' | 'LEGITIMATE' | 'DUPLICATE';
  notes?: string;
}

export interface DismissAlertRequest {
  reason: string;
  notes?: string;
}
