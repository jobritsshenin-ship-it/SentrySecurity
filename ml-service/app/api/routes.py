from fastapi import APIRouter, HTTPException
from app.models.schemas import TransactionRequest, ScoringResponse
from app.services.fraud_scorer import FraudScorer

router = APIRouter()
scorer = FraudScorer()

@router.post("/score", response_model=ScoringResponse)
async def score_transaction(transaction: TransactionRequest):
    """Score a transaction for fraud risk"""
    try:
        result = scorer.score_transaction(transaction)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}
