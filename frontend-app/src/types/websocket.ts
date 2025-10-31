export interface WebSocketEvent<T = any> {
  type: string;
  data: T;
}

export interface NewAlertEvent {
  alertId: string;
  transactionId: string;
  severity: string;
  riskScore: number;
  timestamp: string;
}

export interface AlertUpdatedEvent {
  alertId: string;
  status: string;
  updatedAt: string;
}
