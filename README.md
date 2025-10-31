# SentrySecurity - Intelligent Fraud Detection & Alert Management Platform

A comprehensive fraud detection system for financial institutions with real-time transaction monitoring, AI-powered risk analysis, and analyst alert management.

## Phase 1 - MVP Overview

Phase 1 delivers a production-ready MVP focused on:
- **Authentication**: JWT + OAuth 2.0 + MFA (TOTP)
- **Dashboard**: Real-time KPI cards with Redis caching
- **Transactions**: Browse, filter, search, and flag suspicious transactions
- **Alerts**: View, assign, resolve, and dismiss alerts
- **Real-time Updates**: WebSocket-based alert streaming
- **Fraud Scoring**: Rule-based detection (ML in Phase 2)
- **Audit Logging**: Complete user action tracking

## Repository Structure

```
SentrySecurity/
├── frontend-app/          # React 18 + TypeScript + Redux frontend
├── backend-api/           # Express.js + MongoDB + Redis API
├── ml-service/            # Python FastAPI fraud scoring service
└── README.md              # This file
```

## Prerequisites

- Node.js v18+
- Python 3.10+
- MongoDB 5.0+
- Redis 6.0+

## Quick Start

### 1. Backend Setup

```bash
cd backend-api
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### 2. ML Service Setup

```bash
cd ml-service
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd frontend-app
npm install
cp .env.example .env
# Edit .env with API URLs
npm run dev
```

## Architecture

### Frontend Technologies
- **React 18** with TypeScript for type safety
- **Redux Toolkit** for state management
- **Axios** with interceptors for API calls
- **Socket.io-client** for real-time updates
- **Recharts** for data visualization
- **Material-UI** for component library
- **Vite** for fast development builds

### Backend Technologies
- **Express.js** for HTTP API
- **MongoDB** with Mongoose ODM
- **Redis** for caching and sessions
- **Socket.io** for WebSocket connections
- **JWT** for authentication
- **Winston** for structured logging

### ML Service
- **FastAPI** for high-performance API
- **Pydantic** for data validation
- **Rule-based** fraud scoring (Phase 1)
- **Extensible** for ML models (Phase 2+)

## Implementation Status

### ✅ Completed

**Frontend:**
- Redux store configuration (auth, transaction, alert, notification slices)
- Type definitions for all data models
- Axios service with JWT token handling and automatic refresh
- WebSocket service for real-time alerts
- Custom hooks (useAuth, useNotification)
- Utility functions (formatters, constants, helpers)
- Directory structure and configuration files

**Backend:**
- MongoDB connection and configuration
- Redis client setup
- Authentication service with JWT, password hashing, MFA support
- Database models (User, Transaction, Alert, AuditLog)
- Express middleware (auth, error handling, request ID, CORS)
- Route structure for auth, transactions, alerts, dashboard
- Error handling with custom error classes
- Logging with Winston

**ML Service:**
- FastAPI application setup
- Fraud scoring engine with rule-based logic
- Pydantic schemas for request/response validation
- Rule implementations:
  - Unusual amount detection
  - New device detection
  - Geographic anomaly detection
  - Configurable thresholds

### 🚧 In Progress

- Frontend component implementations
- Backend controller implementations with full business logic
- Database query optimization
- Real-time alert broadcasting via WebSocket
- Redis KPI caching strategy

### 📋 To Be Completed

- End-to-end integration testing
- Performance optimization and load testing
- Security hardening (rate limiting per endpoint, input validation)
- API documentation (Swagger/OpenAPI)
- Docker containerization
- Kubernetes manifests
- Advanced analytics (Phase 2)
- Case management system (Phase 2)
- Advanced rule engine UI (Phase 2)

## API Endpoints (Phase 1)

### Base URL
`http://localhost:3001/api/v1`

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/mfa/verify` - MFA verification
- `POST /auth/refresh` - Token refresh
- `POST /auth/logout` - User logout

### Transactions (Placeholder)
- `GET /transactions` - List transactions
- `GET /transactions/:id` - Transaction detail
- `POST /transactions/:id/flag` - Flag suspicious
- `POST /transactions/bulk-action` - Bulk operations
- `POST /transactions/ingest` - Webhook from banking system

### Alerts (Placeholder)
- `GET /alerts` - List alerts
- `GET /alerts/:id` - Alert detail
- `PUT /alerts/:id` - Update alert
- `POST /alerts/:id/resolve` - Resolve alert
- `POST /alerts/:id/dismiss` - Dismiss alert

### Dashboard
- `GET /dashboard/kpis` - KPI metrics (Redis cached)
- `GET /dashboard/analytics` - Analytics data

## Database Models

### User
- Email (unique, indexed)
- Password (bcrypt hashed)
- Role (ADMIN, ANALYST, AUDITOR, MANAGER, READONLY)
- Permissions array
- MFA settings
- Login history

### Transaction
- transactionId (unique)
- customerId (indexed)
- amount, currency, merchant
- riskScore (0-1, indexed)
- status (COMPLETED, FLAGGED, BLOCKED)
- geolocation, device info, card info
- flags and notes

### Alert
- alertId (unique)
- transactionId (ref)
- severity (CRITICAL, HIGH, MEDIUM, LOW)
- status (NEW, IN_REVIEW, RESOLVED, FALSE_POSITIVE)
- riskFactors with confidence scores
- assignedTo analyst

### AuditLog
- userId, action, resource, details
- Automatic 2-year TTL cleanup
- Used for compliance tracking

## Development Guidelines

### Frontend
1. Components in `src/components/` organized by feature
2. Redux slices in `src/store/` for state management
3. Services in `src/services/` for API calls
4. Types in `src/types/` for TypeScript definitions
5. Use hooks for component logic

### Backend
1. Routes in `src/routes/` for endpoint definitions
2. Controllers in `src/controllers/` for request handling
3. Services in `src/services/` for business logic
4. Models in `src/models/` for database schemas
5. Middleware in `src/middleware/` for request processing

### ML Service
1. Models in `app/models/` for Pydantic schemas
2. Services in `app/services/` for scoring logic
3. Routes in `app/api/` for FastAPI endpoints

## Security Features

- **JWT Authentication** with RS256 signature
- **Password Hashing** with bcrypt (10 rounds)
- **Rate Limiting** on login attempts (5/15min)
- **CORS** properly configured
- **Helmet** for security headers
- **Input Validation** with Zod
- **Audit Logging** for compliance
- **MFA Support** with TOTP

## Performance Considerations

- Dashboard KPIs cached in Redis (5s TTL)
- Database indexes on commonly queried fields
- Virtual scrolling for large tables
- WebSocket for real-time updates
- Batch operations for bulk actions
- Exponential backoff for retries

## Next Steps (Phase 2)

1. **Case Management** - Multi-analyst investigation workflows
2. **Advanced Rules Engine** - Visual rule builder UI
3. **ML Models** - Real ML-based fraud detection
4. **Analytics Dashboard** - Advanced reporting
5. **User Management** - Admin interface
6. **Document Upload** - Case evidence management

## Troubleshooting

### Backend won't start
- Check MongoDB connection: `mongodb://localhost:27017`
- Check Redis connection: `redis://localhost:6379`
- Verify `.env` variables are set

### Frontend API errors
- Verify backend is running on port 3001
- Check `VITE_API_BASE_URL` in `.env`
- Look for CORS errors in browser console

### ML Service not responding
- Verify Python service is running: `http://localhost:8000`
- Check `ML_SERVICE_URL` in backend `.env`
- Review logs for Pydantic validation errors

## Resources

- [Fraud Detection Platform Specification](../planning.md)
- [Research & Architecture](../research.md)
- [Express.js Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [FastAPI Docs](https://fastapi.tiangolo.com/)

## Contributing

1. Read the development guidelines above
2. Follow the existing code structure
3. Test your changes locally
4. Submit PRs with clear descriptions

## License

[Add license here]

---

**Last Updated**: 2025-10-31
**Phase**: 1 (MVP)
**Status**: Active Development
