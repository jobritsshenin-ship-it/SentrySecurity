export interface Transaction {
  transactionId: string;
  customerId: string;
  customerName: string;
  amount: number;
  currency: string;
  merchantId: string;
  merchantName: string;
  merchantCategory: string;
  timestamp: string;
  status: 'COMPLETED' | 'FLAGGED' | 'BLOCKED';
  riskScore: number;
  riskFactors: string[];
  geolocation?: {
    country: string;
    city: string;
    ip: string;
    coordinates?: { latitude: number; longitude: number };
  };
  deviceInfo?: {
    deviceId: string;
    deviceType: string;
    osType: string;
    browserType: string;
  };
  cardInfo?: {
    cardId: string;
    cardType: string;
    maskedCard: string;
    issuedCountry: string;
  };
}

export interface TransactionDetail extends Transaction {
  riskExplanation: string;
  customerHistory: {
    totalTransactions: number;
    averageAmount: number;
    maxAmount: number;
    lastTransactionDate: string;
  };
}

export interface TransactionFilters {
  amountMin?: number;
  amountMax?: number;
  dateFrom?: string;
  dateTo?: string;
  merchantCategory?: string;
  riskScoreMin?: number;
  riskScoreMax?: number;
  status?: string;
  customerId?: string;
}

export interface TransactionListResponse {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
  };
}

export interface FlagTransactionRequest {
  reason: string;
}
