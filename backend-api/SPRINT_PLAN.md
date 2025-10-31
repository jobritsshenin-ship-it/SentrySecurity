# Backend Sprint Plan - Phase 1

**Team**: Backend Developers (2-3)
**Duration**: 8 weeks
**Framework**: Express.js + Node.js 18+ + TypeScript + MongoDB + Redis

---

## ✅ Completed (Week 1-2 Preparation)

### Foundation
- [x] Express app initialization
- [x] TypeScript configuration
- [x] Middleware setup (helmet, CORS, rate limiting)
- [x] MongoDB connection + models
- [x] Redis client initialization
- [x] Winston logger setup
- [x] Custom error classes
- [x] Global error middleware

### Authentication Service
- [x] User registration
- [x] User login with rate limiting
- [x] MFA (TOTP) verification
- [x] Token refresh logic
- [x] Logout functionality
- [x] Audit logging integration

### Database Models
- [x] User schema (with indexes)
- [x] Transaction schema
- [x] Alert schema
- [x] AuditLog schema

---

## 🚀 Sprint 1: Complete Authentication (Week 1-2)

### Auth Route Implementation

#### POST /auth/register
```typescript
Validation (Zod):
- email: valid email, unique
- password: min 12 chars, 1 uppercase, 1 number, 1 special
- firstName, lastName: 1-50 chars

Response:
{
  success: true,
  data: {
    userId, email, firstName, lastName, role, createdAt
  }
}

HTTP: 201 Created

Side effects:
- Hash password with bcrypt
- Create user with role ANALYST
- Send welcome email (placeholder)
- Log to auditLog
```

#### POST /auth/login
```typescript
Validation:
- email: valid email format
- password: not empty

Rate Limiting:
- 5 attempts per 15 minutes per email
- Redis key: login_attempts:{email}
- Return 429 if exceeded

Response (no MFA):
{
  success: true,
  data: {
    accessToken, refreshToken, expiresIn, user: {...}
  }
}

Response (MFA required):
{
  success: true,
  data: {
    mfaRequired: true, userId
  }
}

Side effects:
- Update user.lastLogin
- Add to user.loginHistory (max 10)
- Log to auditLog
- Check session count (max 3)
```

#### POST /auth/mfa/verify
```typescript
Validation:
- otp: exactly 6 digits
- Requires userId from session/body

Verification:
- Get user by userId
- Verify MFA not enabled → 400
- Verify TOTP code (±1 time window)
- If invalid → return 401

Response:
{
  success: true,
  data: {
    accessToken, refreshToken, expiresIn
  }
}

Side effects:
- Generate JWT tokens
- Store refreshToken in Redis
- Log to auditLog
```

#### POST /auth/refresh
```typescript
Validation:
- refreshToken: required, valid JWT format

Verification:
- Verify token signature
- Check if in Redis (not revoked)
- If not valid → 401

Response:
{
  success: true,
  data: {
    accessToken, expiresIn
  }
}

Notes:
- Don't rotate refresh token in Phase 1
- Return new access token only
```

#### POST /auth/logout
```typescript
Requires: authMiddleware (JWT verification)

Response:
{
  success: true,
  message: "Logged out successfully"
}

Side effects:
- Delete refreshToken from Redis
- Log to auditLog
```

### Middleware Implementation

#### Rate Limiting Middleware
```typescript
For /auth/login:
- 5 attempts per 15 minutes per email
- Use express-rate-limit with Redis store
- Return 429 with custom message
- Skip successful requests? Optional
```

#### Input Validation Middleware
```typescript
Create Zod schemas:
- RegisterRequest
- LoginRequest
- MFAVerifyRequest
- RefreshTokenRequest

Validation middleware:
- Check body against schema
- Return 400 with validation errors if invalid
- Log validation failures
```

---

## 💾 Sprint 2: Transactions Module (Week 3-4)

### Transaction Service Implementation

#### getTransactions(filters, page, limit)
```typescript
MongoDB query:
- Build filter object from query params
- Apply sorting (default: riskScore DESC)
- Skip: (page - 1) * limit
- Limit: limit
- Count total for pagination

Example filters:
- amount: {$gte: amountMin, $lte: amountMax}
- timestamp: {$gte: dateFrom, $lte: dateTo}
- riskScore: {$gte: riskScoreMin}
- status: {$in: [FLAGGED, COMPLETED]}

Return:
- transactions: [...]
- pagination: {page, limit, total, totalPages, hasNext}
```

#### getTransactionById(id)
```typescript
MongoDB:
- Find transaction by ID
- If not found → 404
- Query: Transaction.findById(id)

Populate:
- Get customer history (last 5 txns same customer)
- Calculate: totalTransactions, avg, max, minAmount
- Add customerHistory to response

Return:
{
  transactionId, customerId, amount, ...
  customerHistory: {
    totalTransactions, averageAmount, maxAmount,
    lastTransactionDate
  }
}
```

#### flagTransaction(id, reason, userId)
```typescript
Query:
- Find transaction by ID
- If not found → 404

Check idempotency:
- If already flagged (status === FLAGGED)
- Return success without creating duplicate alert

Update transaction:
- Set status to FLAGGED
- Add to flags array: {flaggedBy: userId, reason, flaggedAt}

Create alert (only if not exists):
- alertId: generate UUID
- transactionId: ObjectId
- severity: HIGH (always)
- status: NEW
- riskScore: from transaction
- riskExplanation: from transaction

WebSocket broadcast:
- Emit NEW_ALERT to all clients
- Payload: {alertId, severity, transactionId, riskScore, timestamp}

Invalidate cache:
- Delete redis key: dashboard:kpis

Return:
{
  transactionId, status: FLAGGED, alertId
}

Side effects:
- Log to auditLog: action=DATA_MODIFY
```

#### unflagTransaction(id)
```typescript
Query:
- Find transaction by ID
- If not found → 404

Update:
- Set status to COMPLETED
- Keep flag history (for audit)

Invalidate cache:
- Delete redis: dashboard:kpis

Return:
{
  transactionId, status: COMPLETED
}

Audit log:
- action=DATA_MODIFY
```

#### searchTransactions(query)
```typescript
Full-text search:
- Search across:
  - transactionId (contains)
  - customerName (contains)
  - merchantName (contains)
- Case-insensitive
- Limit to 50 results
- Sort by relevance

Return:
{
  transactions: [
    {transactionId, customerId, amount, ...}
  ]
}
```

#### exportTransactions(format, filters)
```typescript
Steps:
1. Query transactions with filters
2. Format based on requested type:

CSV:
- Headers: transactionId, customerId, amount, merchant, timestamp, riskScore, status
- One transaction per line
- Use CSV library

JSON:
- Array of transaction objects
- Pretty print

XLSX:
- One sheet with headers
- Columns as above
- Format amounts as currency

Return:
- File stream with appropriate headers
- Content-Type: application/octet-stream
- Content-Disposition: attachment; filename=...

Audit log:
- action=EXPORT
- details: "Exported X transactions"
```

#### bulkAction(ids, action, params)
```typescript
Actions:
- FLAG: flag all transactions
- UNFLAG: unflag all
- ASSIGN: assign to analyst

Loop:
- For each ID:
  - Apply action
  - Catch errors
  - Continue to next

Count:
- processed: successful updates
- failed: errors encountered

Return:
{
  processed: 45,
  failed: 2
}

Invalidate cache:
- Delete redis: dashboard:kpis (once, not per update)

Audit log:
- action=DATA_MODIFY
- details: "Bulk action: FLAG X transactions"
```

### Transaction Routes Implementation

#### GET /transactions
```typescript
Query params:
- page (default 1)
- limit (default 25)
- sortBy (default riskScore)
- sortOrder (asc|desc, default desc)
- amountMin, amountMax
- dateFrom, dateTo
- merchantCategory
- riskScoreMin, riskScoreMax
- status
- customerId

Middleware:
- authMiddleware (require JWT)
- requirePermission('view_transactions')

Handler:
- Call transactionService.getTransactions()
- Return data with pagination
- Log to auditLog: action=DATA_ACCESS

Example:
GET /transactions?page=1&limit=25&riskScoreMin=0.7&sortBy=riskScore&sortOrder=desc
```

#### GET /transactions/:id
```typescript
Params:
- id: transaction ID

Middleware:
- authMiddleware
- requirePermission('view_transactions')

Handler:
- Call transactionService.getTransactionById()
- Return transaction with customer history
- Log audit

Error cases:
- 404 if transaction not found
```

#### POST /transactions/:id/flag
```typescript
Params:
- id: transaction ID

Body:
{
  reason: string (required)
}

Validation:
- reason: 1-500 chars
- id: valid ObjectId

Middleware:
- authMiddleware
- requirePermission('flag_transactions')

Handler:
- Call transactionService.flagTransaction()
- Broadcast NEW_ALERT
- Return alert ID

Errors:
- 400: Invalid input
- 404: Transaction not found
```

#### POST /transactions/:id/unflag
```typescript
Params:
- id: transaction ID

Middleware:
- authMiddleware
- requirePermission('flag_transactions')

Handler:
- Call transactionService.unflagTransaction()
- Return updated transaction

Errors:
- 404: Transaction not found
```

#### GET /transactions/search
```typescript
Query params:
- q: search query (required)

Middleware:
- authMiddleware
- requirePermission('view_transactions')

Handler:
- Call transactionService.searchTransactions()
- Return results

Errors:
- 400: Missing query param
```

#### GET /transactions/export
```typescript
Query params:
- format: csv|json|xlsx (required)
- [all filter params from GET /transactions]

Middleware:
- authMiddleware
- requirePermission('view_transactions')

Handler:
- Call transactionService.exportTransactions()
- Stream file response
- Log audit: action=EXPORT

Errors:
- 400: Invalid format
```

#### POST /transactions/bulk-action
```typescript
Body:
{
  transactionIds: string[] (required),
  action: 'FLAG'|'UNFLAG'|'ASSIGN' (required),
  assignTo?: string (required if action=ASSIGN)
}

Validation:
- transactionIds: array, non-empty
- action: valid enum
- assignTo: valid analyst ID if ASSIGN

Middleware:
- authMiddleware
- Appropriate permission based on action

Handler:
- Call transactionService.bulkAction()
- Show confirmation in UI
- Return results

Errors:
- 400: Invalid input
- 403: Insufficient permission
```

#### POST /transactions/ingest
```typescript
Body:
{
  customerId: string,
  amount: number,
  currency: string (default USD),
  merchantId: string,
  merchantName: string,
  merchantCategory: string,
  timestamp: ISO8601 date,
  geolocation: {country, city, ip, coordinates?},
  deviceInfo: {deviceId, deviceType, osType, browserType},
  cardInfo: {cardId, cardType, maskedCard, issuedCountry}
}

Authentication:
- API key validation (TODO: implement)
- OR: HMAC webhook signature verification

Validation:
- amount > 0
- timestamp: valid ISO date
- Required fields present
- Sanitize string inputs

Processing:
1. Create transaction document
2. Call ML service POST /api/score
   - Build request: transactionId, amount, merchantCategory, customerHistory, geolocation, deviceInfo
   - Handle timeout (5s max)
   - Fallback: default score if ML down
3. Update transaction.riskScore + riskFactors
4. If riskScore >= 0.7:
   - Create alert (status NEW, severity based on score)
   - Broadcast NEW_ALERT
   - Invalidate cache
5. Return transactionId, riskScore, alertCreated, alertId

Audit log:
- action=TRANSACTION_INGESTED
- status: SUCCESS|FAILURE

Response:
{
  transactionId, riskScore, alertCreated: bool, alertId?: string
}

HTTP: 201 Created
```

---

## 🚨 Sprint 3: Alerts Module (Week 5-6)

### Alert Service Implementation

#### getAlerts(filters, page, limit)
```typescript
Query:
- Build MongoDB query from filters
- Default filters: severity IN [CRITICAL, HIGH]

Filters:
- severity: {$in: [...]}
- status: {$in: [...]}
- alertType: {$in: [...]}
- assignedTo: userId
- dateFrom, dateTo
- riskScoreMin, riskScoreMax

Sort: createdAt DESC (newest first)

Pagination:
- skip, limit
- count total

Return:
{
  alerts: [...],
  pagination: {page, limit, total, totalPages, hasNext}
}
```

#### getAlertById(id)
```typescript
Query:
- Find alert by ID
- If not found → 404

Populate:
- Transaction details (full)
- Risk factors from alert

Get customer history:
- Find transaction.customerId
- Query last 5 transactions for customer
- Add to response

Get action history:
- Query auditLog where resourceId = alertId
- Filter action = ALERT_*

Return:
{
  alertId, transactionId, severity, status, riskScore,
  riskFactors: [{factor, confidence, details}],
  transactionDetails: {...},
  customerHistory: [...],
  actionHistory: [...]
}
```

#### updateAlert(id, updates)
```typescript
Params:
- id: alert ID
- updates: {status?, assignedTo?, notes?}

Validation:
- status: valid enum if provided
- assignedTo: valid user ID if provided

Update:
- Set provided fields
- Update timestamp: updatedAt = now

If status changed:
- Add to actionHistory:
  {action: 'STATUS_CHANGED', actor: userId, timestamp, details: newStatus}
- Broadcast ALERT_UPDATED event

Return:
- Updated alert object

Audit log:
- action=DATA_MODIFY
- details: "Alert status updated to {newStatus}"
```

#### resolveAlert(id, resolution, notes)
```typescript
Params:
- id: alert ID
- resolution: FRAUD_CONFIRMED|LEGITIMATE|DUPLICATE
- notes: optional string

Update:
- Set status to RESOLVED
- Set resolution reason
- Add to actionHistory

Auto-block transaction:
- If resolution === FRAUD_CONFIRMED:
  - Find related transaction
  - Update transaction.status to BLOCKED
  - Add note about auto-block

Broadcast:
- Emit ALERT_UPDATED to all clients

Audit log:
- action=DATA_MODIFY
- details: "Alert resolved as {resolution}"

Return:
- Updated alert
```

#### dismissAlert(id, reason, notes)
```typescript
Params:
- id: alert ID
- reason: string (dismissal reason)
- notes: optional

Update:
- Set status to FALSE_POSITIVE
- Store dismissal reason
- Add to actionHistory

Broadcast:
- Emit ALERT_UPDATED

Audit log:
- action=DATA_MODIFY
- details: "Alert dismissed: {reason}"

Return:
- Updated alert
```

#### getTransactionHistory(alertId)
```typescript
Query:
- Find alert by ID
- Get related transaction
- Get customerId from transaction
- Query last 5 transactions for customer

Return:
{
  transactions: [
    {transactionId, amount, timestamp, merchant, status}
  ]
}
```

#### bulkAction(ids, action, params)
```typescript
Actions:
- ASSIGN: Assign to analyst
- RESOLVE: Resolve with resolution type
- DISMISS: Dismiss with reason

Loop through IDs:
- Apply action
- Catch errors
- Continue

Count processed/failed

Batch broadcast:
- Emit ALERT_UPDATED for each (or batch emit)

Return:
{
  processed: X,
  failed: Y
}
```

### Alert Routes Implementation

Similar to transactions:
- GET /alerts (with default filters)
- GET /alerts/:id
- PUT /alerts/:id
- POST /alerts/:id/resolve
- POST /alerts/:id/dismiss
- POST /alerts/bulk-action
- GET /alerts/:id/transaction-history

---

## 📊 Sprint 4: Dashboard & Caching (Week 5-6)

### Cache Service

#### getKPIs()
```typescript
Check Redis:
- Key: dashboard:kpis
- If exists: return cached

Else calculate (cache miss):
- Count transactions today: Transaction.countDocuments({timestamp: {$gte: today}})
- Count active alerts: Alert.countDocuments({status: {$in: [NEW, IN_REVIEW]}})
- Get accuracy: Call ML service or calculate
- Calculate trends: Compare to yesterday/last week
- Build KPI object

Cache in Redis:
- Key: dashboard:kpis
- TTL: 5 seconds

Return KPI object
```

#### setKPIs(data, ttl)
```typescript
Store in Redis:
- redisClient.setEx(key, ttl, JSON.stringify(data))
```

#### invalidateKPIs()
```typescript
Delete cache:
- redisClient.del(key)
```

### Dashboard Service

#### calculateKPIs()
```typescript
Use cacheService.getKPIs()

If cache miss, calculate:
- Today's transactions: count({timestamp >= today})
- Active alerts: count({status: NEW or IN_REVIEW})
- Detection accuracy: ML service or (true positives / total alerts)
- Trends: compare current vs yesterday/last week

Return:
{
  todayMetrics: {
    totalTransactions: number,
    activeAlerts: number,
    detectionAccuracy: number (0-100),
    pendingCases: 0, // Phase 1: always 0
    systemUptime: 99.9 // hardcoded for Phase 1
  },
  trends: {
    transactionsTrend: number,
    alertsTrend: number,
    accuracyTrend: number
  }
}
```

#### getAnalytics()
```typescript
Return aggregated data for charts:

1. transactionTrend:
   - Hourly transaction count for last 24 hours
   - Pipeline: group by hour, count

2. alertDistribution:
   - Count by alertType
   - Returns: {UNUSUAL_AMOUNT: 450, VELOCITY: 320, ...}

3. accuracyTrend:
   - Daily for last 7 days
   - accuracy, precision, recall
```

### Dashboard Routes

#### GET /dashboard/kpis
```typescript
Middleware:
- authMiddleware

Handler:
- Call dashboardService.calculateKPIs()
- Return KPI data
- Log: cache hit or miss

HTTP: 200 OK
```

#### GET /dashboard/analytics
```typescript
Middleware:
- authMiddleware

Handler:
- Call dashboardService.getAnalytics()
- Return chart data

HTTP: 200 OK
```

---

## 🔗 Sprint 5: WebSocket & Real-Time (Week 7)

### WebSocket Broadcasting

#### On New Alert (transaction ingest or manual flag)
```typescript
In controller after alert created:
- Get socket.io instance from app
- io.emit('alert', {
    type: 'NEW_ALERT',
    data: {
      alertId, transactionId, severity, riskScore, timestamp
    }
  })
```

#### On Alert Updated (resolve, dismiss, assign)
```typescript
In alertService.updateAlert():
- After status changes, emit:
- io.emit('alert', {
    type: 'ALERT_UPDATED',
    data: {
      alertId, status, updatedAt
    }
  })
```

---

## 📝 Sprint 6: Audit Logging (Week 7)

### Audit Service

```typescript
async log(userId, action, resource, resourceId, details, ip, status) {
  Create AuditLog:
  - timestamp: now
  - userId: from JWT
  - action: LOGIN, LOGOUT, DATA_ACCESS, DATA_MODIFY, EXPORT, etc.
  - resource: TRANSACTION, ALERT, USER, SYSTEM
  - resourceId: optional
  - details: descriptive
  - ip: from req.ip
  - status: SUCCESS or FAILURE
  - retentionExpiry: now + 2 years

  await AuditLog.create(auditLogDoc)
}
```

### Integration Points

```typescript
Audit all:
- LOGIN, LOGOUT: authController
- MFA_VERIFY: authController
- DATA_ACCESS: transactionController, alertController
- DATA_MODIFY: flag, resolve, dismiss, update operations
- EXPORT: exportTransactions
- USER_CREATED, USER_DELETED: userController (Phase 2)
```

---

## 🧪 Sprint 7: Testing (Week 8)

### Unit Tests (60% coverage target)

#### authService.test.ts
```typescript
Tests:
- register: valid input, duplicate email, invalid password
- login: valid, invalid credentials, rate limiting
- verifyMFA: valid/invalid OTP
- refreshToken: valid/invalid token
- Permission assignment for roles
```

#### transactionService.test.ts
```typescript
Tests:
- getTransactions: various filters, pagination
- flagTransaction: idempotency check
- unflagTransaction: state transition
- bulkAction: loop and count
```

#### alertService.test.ts
```typescript
Tests:
- getAlerts: default filters, custom filters
- resolveAlert: auto-block transaction
- dismissAlert: status update
```

### Integration Tests

```typescript
Test files:
- auth.integration.test.ts: Full login flow
- transactions.integration.test.ts: Ingest → Flag → Alert
- alerts.integration.test.ts: Get → Resolve
- cache.integration.test.ts: KPI caching
```

### Documentation

```typescript
Files to create:
- README.md: Setup, structure, running
- API_SPEC.md: Endpoint details
- DEVELOPMENT.md: How to add endpoints
- TESTING.md: How to run tests
```

---

## ✅ Definition of Done

- [ ] Code implemented
- [ ] Unit tests written (60%+ coverage)
- [ ] No TypeScript errors
- [ ] Error handling complete
- [ ] Validation implemented
- [ ] Audit logging added
- [ ] WebSocket integration (if applicable)
- [ ] Redis caching (if applicable)
- [ ] Integration tests pass
- [ ] Middleware applied
- [ ] Code reviewed
- [ ] Deployed to staging

---

**Owner**: Backend Team
**Status**: Ready to Start
**Next**: Begin Sprint 1 implementation
