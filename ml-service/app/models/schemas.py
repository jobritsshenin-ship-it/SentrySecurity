from pydantic import BaseModel
from typing import Optional, List

class CustomerHistory(BaseModel):
    totalTransactions: int
    averageAmount: float
    maxAmount: float
    lastTransactionDate: str
    lastTransactionCountry: Optional[str] = None

class GeolocationData(BaseModel):
    country: str
    ip: str

class DeviceInfo(BaseModel):
    deviceId: str
    deviceType: str
    isNewDevice: bool

class TransactionRequest(BaseModel):
    transactionId: str
    amount: float
    merchantCategory: str
    customerHistory: CustomerHistory
    geolocation: GeolocationData
    deviceInfo: DeviceInfo

class RiskFactor(BaseModel):
    factor: str
    confidence: float
    details: str

class ScoringResponse(BaseModel):
    transactionId: str
    riskScore: float
    riskFactors: List[RiskFactor]
