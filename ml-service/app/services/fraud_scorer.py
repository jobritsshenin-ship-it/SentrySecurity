from app.models.schemas import TransactionRequest, ScoringResponse, RiskFactor

class FraudScorer:
    """Rule-based fraud scoring service"""

    UNUSUAL_AMOUNT_THRESHOLD_MULTIPLIER = 3.0
    NEW_DEVICE_SCORE = 0.15
    GEOGRAPHIC_ANOMALY_SCORE = 0.20
    UNUSUAL_AMOUNT_SCORE = 0.30

    def score_transaction(self, transaction: TransactionRequest) -> ScoringResponse:
        """Calculate fraud risk score for a transaction"""
        score = 0.0
        risk_factors = []

        # Rule 1: New Customers (insufficient history)
        if transaction.customerHistory.totalTransactions < 5:
            score = 0.1  # Low risk for new customers, insufficient baseline

        # Rule 2: Unusual Amount
        if transaction.amount > (transaction.customerHistory.averageAmount * self.UNUSUAL_AMOUNT_THRESHOLD_MULTIPLIER):
            score += self.UNUSUAL_AMOUNT_SCORE
            risk_factors.append(RiskFactor(
                factor="unusual_amount",
                confidence=0.85,
                details=f"Amount ${transaction.amount:.2f} is {transaction.amount / transaction.customerHistory.averageAmount:.1f}x higher than customer average ${transaction.customerHistory.averageAmount:.2f}"
            ))

        # Rule 3: New Device
        if transaction.deviceInfo.isNewDevice:
            score += self.NEW_DEVICE_SCORE
            risk_factors.append(RiskFactor(
                factor="new_device",
                confidence=0.65,
                details="First transaction from new device"
            ))

        # Rule 4: Geographic Anomaly
        if (transaction.customerHistory.lastTransactionCountry and
            transaction.geolocation.country != transaction.customerHistory.lastTransactionCountry):
            score += self.GEOGRAPHIC_ANOMALY_SCORE
            risk_factors.append(RiskFactor(
                factor="geographic_anomaly",
                confidence=0.75,
                details=f"Transaction from {transaction.geolocation.country}, last from {transaction.customerHistory.lastTransactionCountry}"
            ))

        # Cap at 1.0
        final_score = min(score, 1.0)

        return ScoringResponse(
            transactionId=transaction.transactionId,
            riskScore=final_score,
            riskFactors=risk_factors
        )
