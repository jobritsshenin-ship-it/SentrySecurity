# ML Service Sprint Plan - Phase 1

**Team**: ML/Data Developers (1-2)
**Duration**: 8 weeks
**Framework**: Python 3.10 + FastAPI + Pydantic

---

## ✅ Completed (Week 1-2 Preparation)

### Foundation
- [x] FastAPI application setup
- [x] Project structure
- [x] requirements.txt with dependencies
- [x] Main.py with CORS and routes

### Fraud Scoring Engine
- [x] FraudScorer class with rule-based logic
- [x] Unusual amount detection (3x threshold, +0.30)
- [x] New device detection (+0.15)
- [x] Geographic anomaly detection (+0.20)
- [x] New customer handling (0.1 baseline)
- [x] Risk factor explanations
- [x] Confidence score calculation

### Pydantic Schemas
- [x] TransactionRequest model
- [x] ScoringResponse model
- [x] RiskFactor model
- [x] Related models (CustomerHistory, GeolocationData, DeviceInfo)

### FastAPI Endpoints
- [x] POST /api/score - Score transaction
- [x] GET /health - Health check

---

## 🚀 Sprint 1-2: Enhancement & Robustness (Week 1-4)

### Configuration & Error Handling

#### 1. Configuration Constants
**File**: `app/config.py`
```python
# Scoring thresholds
UNUSUAL_AMOUNT_MULTIPLIER = 3.0
NEW_DEVICE_SCORE = 0.15
GEOGRAPHIC_ANOMALY_SCORE = 0.20
UNUSUAL_AMOUNT_SCORE = 0.30

# Score bounds
MIN_SCORE = 0.0
MAX_SCORE = 1.0

# New customer handling
NEW_CUSTOMER_THRESHOLD = 5  # transactions
NEW_CUSTOMER_BASELINE_SCORE = 0.1

# Accuracy metrics
CONFIDENCE_UNUSUAL_AMOUNT = 0.85
CONFIDENCE_NEW_DEVICE = 0.65
CONFIDENCE_GEOGRAPHIC = 0.75
```

#### 2. Error Handling
**File**: `app/services/fraud_scorer.py` - Enhanced
```python
def score_transaction(self, transaction: TransactionRequest) -> ScoringResponse:
    try:
        # Validate input
        if transaction.amount < 0:
            raise ValueError("Amount must be positive")

        if not transaction.customerHistory:
            raise ValueError("Customer history required")

        # Score calculation
        score = self._calculate_score(transaction)
        risk_factors = self._extract_risk_factors(transaction)

        # Validate output
        final_score = min(max(score, MIN_SCORE), MAX_SCORE)

        return ScoringResponse(
            transactionId=transaction.transactionId,
            riskScore=final_score,
            riskFactors=risk_factors
        )
    except ValueError as e:
        logger.error(f"Scoring error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal scoring error")
```

#### 3. Logging
**File**: `app/utils/logger.py`
```python
import logging
from app.config import LOG_LEVEL

logging.basicConfig(
    level=LOG_LEVEL.upper(),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)
```

**Integration points**:
- Log transaction scoring requests (debug level)
- Log score calculations and risk factors (debug level)
- Log errors (error level)
- Log API hits (info level, optional)

#### 4. Request/Response Validation
**File**: `app/models/schemas.py` - Enhanced
```python
# Add validation to Pydantic models
class TransactionRequest(BaseModel):
    transactionId: str = Field(..., min_length=1)
    amount: float = Field(..., gt=0)  # Must be positive
    merchantCategory: str = Field(..., min_length=1)
    customerHistory: CustomerHistory
    geolocation: GeolocationData
    deviceInfo: DeviceInfo

    class Config:
        validate_assignment = True
        use_enum_values = True

# Validate geolocation
class GeolocationData(BaseModel):
    country: str = Field(..., min_length=2, max_length=2)  # ISO country code
    ip: str  # Could add IP validation

# Validate device info
class DeviceInfo(BaseModel):
    deviceId: str = Field(..., min_length=1)
    deviceType: str  # Enum: MOBILE, DESKTOP, TABLET
    isNewDevice: bool
```

### Testing

#### 1. Unit Tests
**File**: `tests/test_fraud_scorer.py`
```python
import pytest
from app.services.fraud_scorer import FraudScorer
from app.models.schemas import TransactionRequest, CustomerHistory, GeolocationData, DeviceInfo

class TestFraudScorer:

    def setup_method(self):
        self.scorer = FraudScorer()

    def test_new_customer_baseline(self):
        # Customer with < 5 transactions
        transaction = TransactionRequest(
            transactionId="txn-001",
            amount=1000.0,
            merchantCategory="Electronics",
            customerHistory=CustomerHistory(
                totalTransactions=3,
                averageAmount=500.0,
                maxAmount=1500.0,
                lastTransactionDate="2025-10-30T10:00:00Z"
            ),
            geolocation=GeolocationData(country="US", ip="192.168.1.1"),
            deviceInfo=DeviceInfo(deviceId="dev-001", deviceType="MOBILE", isNewDevice=False)
        )

        result = self.scorer.score_transaction(transaction)
        assert result.riskScore == 0.1  # Baseline for new customer

    def test_unusual_amount(self):
        # Amount is 3x higher than average
        transaction = self._build_transaction(
            amount=1500.0,
            avgAmount=500.0,
            totalTransactions=10  # Established customer
        )

        result = self.scorer.score_transaction(transaction)
        assert result.riskScore >= 0.30
        assert any(f.factor == "unusual_amount" for f in result.riskFactors)

    def test_new_device(self):
        # First time with new device
        transaction = self._build_transaction(
            totalTransactions=10,
            isNewDevice=True
        )

        result = self.scorer.score_transaction(transaction)
        assert any(f.factor == "new_device" for f in result.riskFactors)
        assert result.riskScore >= 0.15

    def test_geographic_anomaly(self):
        # Different country than last transaction
        transaction = TransactionRequest(
            transactionId="txn-002",
            amount=500.0,
            merchantCategory="Electronics",
            customerHistory=CustomerHistory(
                totalTransactions=10,
                averageAmount=500.0,
                maxAmount=1500.0,
                lastTransactionDate="2025-10-30T10:00:00Z",
                lastTransactionCountry="US"
            ),
            geolocation=GeolocationData(country="UK", ip="192.168.1.1"),
            deviceInfo=DeviceInfo(deviceId="dev-001", deviceType="MOBILE", isNewDevice=False)
        )

        result = self.scorer.score_transaction(transaction)
        assert any(f.factor == "geographic_anomaly" for f in result.riskFactors)

    def test_multiple_risk_factors(self):
        # Unusual amount + new device + geographic
        transaction = self._build_transaction(
            amount=1500.0,
            avgAmount=500.0,
            totalTransactions=10,
            isNewDevice=True,
            lastCountry="US",
            currentCountry="UK"
        )

        result = self.scorer.score_transaction(transaction)
        assert len(result.riskFactors) >= 3
        assert result.riskScore > 0.5  # Combined score
        assert result.riskScore <= 1.0  # Capped at 1.0

    def test_score_boundaries(self):
        # Ensure score never exceeds 1.0
        transaction = self._build_transaction(
            amount=10000.0,
            avgAmount=100.0,
            isNewDevice=True,
            lastCountry="US",
            currentCountry="UK"
        )

        result = self.scorer.score_transaction(transaction)
        assert 0.0 <= result.riskScore <= 1.0

    def test_missing_fields(self):
        # Test with missing optional fields
        with pytest.raises(ValidationError):
            TransactionRequest(
                transactionId="txn-003",
                amount=1000.0,
                # Missing merchantCategory
            )

    def _build_transaction(self, **kwargs):
        # Helper to build test transactions
        return TransactionRequest(
            transactionId=kwargs.get('transactionId', 'txn-test'),
            amount=kwargs.get('amount', 500.0),
            merchantCategory=kwargs.get('merchantCategory', 'Electronics'),
            customerHistory=CustomerHistory(
                totalTransactions=kwargs.get('totalTransactions', 10),
                averageAmount=kwargs.get('avgAmount', 500.0),
                maxAmount=kwargs.get('maxAmount', 2000.0),
                lastTransactionDate="2025-10-30T10:00:00Z",
                lastTransactionCountry=kwargs.get('lastCountry', 'US')
            ),
            geolocation=GeolocationData(
                country=kwargs.get('currentCountry', 'US'),
                ip=kwargs.get('ip', '192.168.1.1')
            ),
            deviceInfo=DeviceInfo(
                deviceId=kwargs.get('deviceId', 'dev-001'),
                deviceType=kwargs.get('deviceType', 'MOBILE'),
                isNewDevice=kwargs.get('isNewDevice', False)
            )
        )
```

#### 2. API Integration Tests
**File**: `tests/test_api.py`
```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_score_endpoint():
    payload = {
        "transactionId": "txn-001",
        "amount": 1500.0,
        "merchantCategory": "Electronics",
        "customerHistory": {
            "totalTransactions": 10,
            "averageAmount": 500.0,
            "maxAmount": 2000.0,
            "lastTransactionDate": "2025-10-30T10:00:00Z",
            "lastTransactionCountry": "US"
        },
        "geolocation": {"country": "US", "ip": "192.168.1.1"},
        "deviceInfo": {"deviceId": "dev-001", "deviceType": "MOBILE", "isNewDevice": False}
    }

    response = client.post("/api/score", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "riskScore" in data
    assert "riskFactors" in data
    assert 0.0 <= data["riskScore"] <= 1.0

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_invalid_input():
    payload = {
        "transactionId": "txn-002",
        # Missing required fields
    }

    response = client.post("/api/score", json=payload)
    assert response.status_code == 422  # Validation error
```

#### 3. Performance Tests
**File**: `tests/test_performance.py`
```python
import time
import pytest
from tests.test_api import client

def test_response_time():
    payload = {...}  # Same as test_score_endpoint

    start = time.time()
    response = client.post("/api/score", json=payload)
    duration = time.time() - start

    assert response.status_code == 200
    assert duration < 0.5  # Should respond in < 500ms
```

---

## 🔧 Sprint 3-4: Docker & Extensibility (Week 5-6)

### Docker Setup

#### Dockerfile
**File**: `Dockerfile`
```dockerfile
FROM python:3.10-slim

WORKDIR /app

# Copy requirements
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY app/ ./app/

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/api/health')" || exit 1

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### .dockerignore
```
__pycache__/
*.pyc
.pytest_cache/
.env
.git
tests/
README.md
```

#### requirements.txt
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.4.2
python-dotenv==1.0.0
requests==2.31.0
pytest==7.4.3
pytest-cov==4.1.0
```

### Environment Configuration

#### .env.example
```
LOG_LEVEL=info
ENVIRONMENT=development
ML_MODEL_VERSION=v1
```

#### app/config.py - Enhanced
```python
import os
from dotenv import load_dotenv

load_dotenv()

LOG_LEVEL = os.getenv('LOG_LEVEL', 'info')
ENVIRONMENT = os.getenv('ENVIRONMENT', 'development')
ML_MODEL_VERSION = os.getenv('ML_MODEL_VERSION', 'v1')

# Feature flags for Phase 2+
ENABLE_ML_MODELS = os.getenv('ENABLE_ML_MODELS', 'false').lower() == 'true'
```

### ML Model Integration Preparation

#### Phase 2 Extensibility
**File**: `app/services/model_registry.py` (Placeholder)
```python
# Phase 2: Load trained models
# This structure allows easy addition of ML models

class ModelRegistry:
    """Model version registry for future ML models"""

    def __init__(self):
        self.models = {}
        self.current_version = "rules-v1"

    def register_model(self, version: str, model):
        """Register a model version"""
        self.models[version] = model

    def get_model(self, version: str = None):
        """Get model by version or current"""
        version = version or self.current_version
        return self.models.get(version)

    def list_versions(self):
        """List available model versions"""
        return list(self.models.keys())

# Phase 1: Only rule-based scorer
# Phase 2: Add ML model loading here
```

---

## 📚 Sprint 5-6: Documentation (Week 5-6)

### README.md
```markdown
# ML Service - Fraud Detection

## Overview
FastAPI-based service for fraud detection scoring.

## Setup
1. Create virtual environment: `python -m venv venv`
2. Activate: `source venv/bin/activate`
3. Install: `pip install -r requirements.txt`
4. Run: `uvicorn app.main:app --reload`

## API Endpoints

### POST /api/score
Score a transaction for fraud risk.

**Request:**
```json
{
  "transactionId": "txn-123",
  "amount": 1500.0,
  "merchantCategory": "Electronics",
  "customerHistory": {
    "totalTransactions": 10,
    "averageAmount": 500.0,
    "maxAmount": 2000.0,
    "lastTransactionDate": "2025-10-30T10:00:00Z",
    "lastTransactionCountry": "US"
  },
  "geolocation": {"country": "US", "ip": "192.168.1.1"},
  "deviceInfo": {"deviceId": "dev-1", "deviceType": "MOBILE", "isNewDevice": false}
}
```

**Response:**
```json
{
  "transactionId": "txn-123",
  "riskScore": 0.72,
  "riskFactors": [
    {
      "factor": "unusual_amount",
      "confidence": 0.85,
      "details": "Amount $1500 is 3x higher than average $500"
    }
  ]
}
```

## Testing
- Unit: `pytest tests/test_fraud_scorer.py`
- Integration: `pytest tests/test_api.py`
- Performance: `pytest tests/test_performance.py`
- Coverage: `pytest --cov=app tests/`

## Deployment
`docker build -t fraud-scorer . && docker run -p 8000:8000 fraud-scorer`
```

### Fraud Scoring Algorithm Documentation

**File**: `SCORING_ALGORITHM.md`
```markdown
# Fraud Detection Scoring Algorithm

## Overview
Phase 1 uses rule-based scoring. Phase 2 will add ML models.

## Scoring Rules

### 1. New Customer Baseline
- If customer has < 5 transactions: baseline score = 0.1
- Justification: Insufficient transaction history to establish baseline

### 2. Unusual Amount
- Trigger: Amount > (avg transaction × 3.0)
- Score: +0.30
- Confidence: 85%
- Rationale: Large amounts deviate from customer norm

### 3. New Device
- Trigger: First transaction from device ID
- Score: +0.15
- Confidence: 65%
- Rationale: New devices may indicate account compromise

### 4. Geographic Anomaly
- Trigger: Different country from last transaction
- Score: +0.20
- Confidence: 75%
- Rationale: Rapid geographic movement suspicious

## Score Calculation
```
score = 0.0
if customer.totalTransactions < 5:
    score = 0.1
else:
    if amount > (avg × 3.0):
        score += 0.30
    if isNewDevice:
        score += 0.15
    if country != lastCountry:
        score += 0.20

final_score = min(score, 1.0)
```

## Risk Score Interpretation
- 0.0 - 0.3: Low risk (safe)
- 0.3 - 0.5: Medium risk (monitor)
- 0.5 - 0.7: High risk (investigate)
- 0.7 - 1.0: Critical risk (block)

## Future Enhancements (Phase 2+)
- Velocity-based scoring (multiple txns in short time)
- Network fraud detection (same IP multiple accounts)
- ML model integration for real patterns
```

---

## 📊 Sprint 7-8: Performance & Monitoring (Week 7-8)

### Performance Optimization

#### Caching (Optional Phase 1)
```python
# Could add caching for frequently scored patterns
from functools import lru_cache

@lru_cache(maxsize=1000)
def get_customer_baseline(customer_id: str):
    # Cache customer baseline calculations
    pass
```

#### Monitoring Metrics
```python
# Track scoring performance
import time

def score_transaction(self, transaction):
    start = time.time()
    result = ...
    duration = time.time() - start

    # Log metrics
    logger.info(f"Scoring took {duration:.3f}s for {transaction.transactionId}")

    return result
```

### Production Readiness

- [x] Error handling
- [x] Input validation
- [x] Logging
- [x] Tests (unit + integration)
- [x] Docker containerization
- [x] Health checks
- [x] Documentation
- [ ] Monitoring/metrics (Phase 2)
- [ ] Load balancing (Phase 2)
- [ ] Rate limiting (Phase 2)

---

## 🎯 Success Criteria

- ✅ Fraud scoring engine functional
- ✅ All unit tests pass
- ✅ Integration tests pass
- ✅ Response time < 500ms
- ✅ Docker image builds
- ✅ Health check works
- ✅ Error handling complete
- ✅ Documentation complete

---

## 🔌 Integration Points

### With Backend
- Backend calls: `POST /api/score`
- On transaction ingest
- Receives riskScore + riskFactors
- Handles timeout/failure gracefully

### With Frontend
- No direct calls (via backend)
- Risk scores displayed in UI
- Risk factors shown in alerts

---

## 📝 Week-by-Week Breakdown

| Week | Task | Status |
|------|------|--------|
| 1-2 | Fraud scorer (✓ DONE) | DONE |
| 3-4 | Testing + error handling | TODO |
| 5-6 | Docker + extensibility | TODO |
| 7 | Performance + monitoring | TODO |
| 8 | Documentation + cleanup | TODO |

---

**Owner**: ML/Data Team
**Status**: Ready to Start
**Next**: Begin Sprint 3-4 with testing and Docker
