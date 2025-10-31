# Frontend Sprint Plan - Phase 1

**Team**: Frontend Developers (2-3)
**Duration**: 8 weeks
**Framework**: React 18 + TypeScript + Redux Toolkit + Vite

---

## ✅ Completed (Week 1-2 Preparation)

### Foundation Setup
- [x] Vite configuration with React plugin
- [x] TypeScript configuration
- [x] Redux Toolkit store setup (4 slices)
- [x] Axios HTTP client with JWT interceptor
- [x] Socket.io WebSocket service
- [x] Type definitions for all models
- [x] Utility functions (formatters, constants)
- [x] Custom hooks (useAuth, useNotification)
- [x] Environment variables (.env.example)

---

## 🚀 Sprint 1: Authentication UI (Week 1-2)

### Components to Build

#### 1. LoginForm Component
**File**: `src/components/Auth/LoginForm.tsx`
```typescript
Props:
- onSubmit: (email, password) => void
- isLoading: boolean
- error?: string

Features:
- Email input field
- Password input with show/hide toggle
- Remember me checkbox
- Forgot password link
- Submit button
- Error display
- Loading state
```

#### 2. MFAVerification Component
**File**: `src/components/Auth/MFAVerification.tsx`
```typescript
Props:
- userId: string
- onSuccess: (token) => void
- onError: (error) => void

Features:
- 6-digit OTP input
- Submit button
- Biometric option (placeholder)
- Backup code option (placeholder)
- Timer for resend
```

#### 3. ForgotPasswordModal Component
**File**: `src/components/Auth/ForgotPasswordModal.tsx`
```typescript
Props:
- isOpen: boolean
- onClose: () => void
- onSubmit: (email) => void

Features:
- Email input
- Submit button
- Success message
- Error display
```

#### 4. OAuthButtons Component
**File**: `src/components/Auth/OAuthButtons.tsx`
```typescript
Features:
- Google sign-in button
- Microsoft sign-in button (placeholder)
- Error handling
```

#### 5. ProtectedRoute Component
**File**: `src/components/Auth/ProtectedRoute.tsx`
```typescript
Props:
- children: React.ReactNode
- requiredRole?: string
- requiredPermission?: string

Features:
- Check authentication
- Check authorization
- Redirect to /login if needed
- Show error if unauthorized
```

### Pages to Build

#### 1. LoginPage (`/login`)
**File**: `src/pages/LoginPage.tsx`
```typescript
State:
- email, password (form state)
- isLoading
- error
- mfaRequired (redirect to MFA)
- rememberMe

Flow:
1. User enters credentials
2. Call authService.login()
3. If MFA required → show MFAVerification
4. If success → redirect to /dashboard
5. Handle errors (rate limit, invalid)
6. Save token to localStorage
```

### Hooks to Implement

#### 1. useAuth Hook
**File**: `src/hooks/useAuth.ts`
```typescript
Returns:
- user (from Redux)
- isAuthenticated
- login(credentials) → Promise
- register(data) → Promise
- logout() → Promise
- hasPermission(permission) → boolean
- isLoading
- error
```

### Redux Integration

#### 1. authSlice Usage
```typescript
Actions to dispatch:
- setAuthData(token, refreshToken, user)
- setToken(newToken) // for refresh
- logout()
- setLoading(true/false)
- setError(message)
- setMFARequired(true/false)

Selectors to create:
- selectUser
- selectToken
- selectPermissions
- selectIsAuthenticated
- selectMFARequired
```

### Testing

- [ ] LoginForm: Form submission, validation, error display
- [ ] MFAVerification: OTP input, submission
- [ ] Redux auth state updates
- [ ] useAuth hook: login/logout/hasPermission
- [ ] Integration: Login → Dashboard redirect

---

## 🏠 Sprint 2: Dashboard & Navigation (Week 3-4)

### Layout Components

#### 1. MainLayout Component
**File**: `src/components/Layout/MainLayout.tsx`
```typescript
Props:
- children: React.ReactNode

Structure:
- TopNav (fixed top)
- SideNav (left sidebar)
- MainContent (flex grow)
- Responsive mobile layout

Features:
- Sidebar collapse toggle
- Mobile hamburger menu
- Protected routes
```

#### 2. TopNav Component
**File**: `src/components/Layout/TopNav.tsx`
```typescript
Features:
- Logo (clickable → /dashboard)
- Global search bar
- Connection status indicator
- Notifications bell (with unread count)
- User profile dropdown
- Logout button

Search Bar:
- Placeholder: "Search transactions, alerts..."
- Search on Enter (not real-time)
- Dropdown with results
- Categories: Transactions, Alerts
- "No results" message
```

#### 3. SideNav Component
**File**: `src/components/Layout/SideNav.tsx`
```typescript
Features:
- Menu items (role-based visibility)
- Active page highlight
- Icons for each section
- Collapse/expand toggle
- Smooth animations

Menu Items:
- Dashboard (all roles)
- Transactions (ANALYST, MANAGER, ADMIN)
- Alerts (ANALYST, MANAGER, ADMIN, AUDITOR)
- Cases (Phase 2)
- Rules (Phase 2)
- Analytics (Phase 2)
- Admin (ADMIN only)
  - Users
  - Settings
```

### Dashboard Page

#### 1. Dashboard Component
**File**: `src/pages/DashboardPage.tsx`

**KPI Cards Section**:
```typescript
Components:
- KPICard (reusable)
  - Title
  - Large number
  - Trend indicator (↑/↓ with %)
  - Optional subtitle

Cards (4):
1. Total Transactions Today
2. Active Alerts (with severity breakdown)
3. Detection Accuracy %
4. Cases Pending (shows 0, Phase 2)

Refresh:
- Fetch every 5 seconds
- Redux: store cached data
- Show old data while fetching
- Update when response arrives
```

**Charts Section**:
```typescript
1. Transaction Trend Chart
   - Type: Line chart (Recharts)
   - Data: Last 24 hours (hourly)
   - X-axis: Time
   - Y-axis: Transaction count
   - Interactive: Hover tooltips
   - Area fill under line

2. Alert Distribution Pie Chart
   - Type: Pie chart
   - Categories: 5 alert types
   - Colors: Different per type
   - Legend: Below chart
   - Interactive: Click slice to filter
   - Doughnut style (optional)
```

**Activity Feed**:
```typescript
- Title: "Recent Activity"
- Display: Last 10 events
- Sort: Reverse chronological
- Event types:
  - Transaction flagged
  - Alert resolved
  - Case created (Phase 2)
- Relative time: "2 minutes ago"
- Click to navigate to detail
```

**Quick Actions**:
```typescript
Buttons:
- "View All Transactions"
- "View All Alerts"
- Full width or side by side
- Positioned at bottom
```

### Redux Integration

```typescript
Actions needed:
- fetchKPIs() thunk
- fetchAnalytics() thunk
- setKPIData(data)
- setAnalyticsData(data)

Selectors:
- selectKPIs
- selectAnalytics
- selectLoading
- selectError
```

### Settings Page

**File**: `src/pages/SettingsPage.tsx`

```typescript
Sections:
1. Profile
   - Display: Name, Email, Role
   - Profile picture placeholder

2. Logout Button
   - Call useAuth.logout()
   - Redirect to /login

3. Placeholders
   - "Notification Preferences (Coming Phase 2)"
   - "Password Change (Coming Phase 2)"
```

---

## 📊 Sprint 3: Transactions Module (Week 5-6)

### Transactions Page

**File**: `src/pages/TransactionsPage.tsx`

#### Filter Panel
```typescript
Components:
- AmountRangeSlider ($0 - $1M)
- DateRangePicker (start/end dates)
- MerchantCategorySelect (multi-select)
- RiskScoreThresholdSlider (0.0 - 1.0)
- StatusCheckboxes (COMPLETED, FLAGGED, BLOCKED)
- ApplyFiltersButton
- ResetButton

Features:
- Collapsible (default open)
- Persist filters in Redux
- Reset clears all
```

#### Search Bar
```typescript
Features:
- Placeholder: "Search by ID, customer, or merchant"
- Search on Enter key (not real-time)
- Dropdown results (max 50)
- Click result → open detail
- "No results" message
```

#### Transactions Table
```typescript
Columns:
1. Checkbox (for bulk select)
2. Transaction ID (truncate, hover tooltip)
3. Customer Name
4. Amount (formatted currency)
5. Merchant Name
6. Timestamp (formatted date/time)
7. Status (badge: color-coded)
8. Risk Score (0-1, color-coded)
9. Actions (3-dot menu)

Features:
- Sortable: Click header to sort
- Sort indicators (↑ ↓)
- Virtualized rendering (React-Window)
- Row color-coding:
  - Risk < 0.5: Green tint
  - Risk 0.5-0.7: Yellow tint
  - Risk > 0.7: Red tint
- Pagination: 25/50/100 rows
- Infinite scroll: Load next page when scroll to bottom
- Row click: Open side panel

Default Sort: riskScore DESC (highest risk first)
```

#### Row Actions Menu
```typescript
Actions:
1. View Detail (same as row click)
2. Flag as Suspicious
3. Unflag
4. Assign to Analyst [dropdown]
5. Create Case (Phase 2)
6. Add Note

Behavior:
- Execute action immediately
- Show toast on success/error
- Close menu after action
```

#### Bulk Actions Toolbar
```typescript
Appears when rows selected:
- "X selected" counter
- Select all checkbox
- Bulk Flag/Unflag buttons
- Bulk Assign [analyst dropdown]
- Export Selected (CSV)
- Confirmation dialog before action

Dialog:
- Title: "Confirm Bulk Action"
- Message: "Are you sure? This will [action] X transactions."
- Buttons: Cancel, Confirm
```

#### TransactionDetailPanel
```typescript
Position: Right side drawer (40% width)
Features:
- Keeps table visible
- Close button (X, top-right)
- Smooth slide-in animation

Sections:
1. Transaction Info
   - ID, Customer, Amount, Merchant
   - Timestamp, Status
   - Geolocation (country, city)

2. Risk Factors
   - Collapsible
   - List of factors with confidence %

3. Customer History
   - Collapsible
   - Table: Last 5 transactions
   - Columns: ID, Amount, Merchant, Timestamp

4. Action Buttons
   - Flag/Unflag
   - Assign to Analyst
   - Add Note (opens input)
```

### Hooks & Services

```typescript
Custom hooks:
- useTransactions(filters, page) → {transactions, pagination, isLoading}
- useBulkActions() → {selected, toggle, selectAll, clearAll}
- usePagination() → {page, setPage, hasNext}

Service calls (already exist):
- transactionService.getTransactions()
- transactionService.getTransactionById()
- transactionService.flagTransaction()
- transactionService.unflagTransaction()
- transactionService.searchTransactions()
- transactionService.bulkAction()
- transactionService.exportTransactions()
```

### Redux Integration

```typescript
Redux:
- transactionSlice: items, selectedIds, filters, pagination
- Selectors: selectTransactions, selectSelectedIds, selectFilters
- Thunks: fetchTransactions, flagTransaction, bulkAction
```

---

## 🚨 Sprint 4: Alerts Module (Week 5-6)

### Alerts Page

**File**: `src/pages/AlertsPage.tsx`

#### Filter Panel
```typescript
Default behavior:
- Severity: Show CRITICAL + HIGH (unchecked MEDIUM, LOW)

Components:
- SeverityCheckboxes (with color badges)
- StatusCheckboxes (NEW, IN_REVIEW, RESOLVED, FALSE_POSITIVE)
- AlertTypeCheckboxes (multi-select)
- AssignedToDropdown ("All analysts", or select one)
- DateRangePicker
- RiskScoreRangeSlider
- ApplyButton, ResetButton

Collapsible: Default open
```

#### Alerts Table
```typescript
Columns:
1. Checkbox (bulk select)
2. Alert ID
3. Transaction ID (link to transaction detail)
4. Severity (badge, color-coded)
5. Alert Type
6. Status (badge, color-coded)
7. Risk Score (0-1)
8. Created At (formatted)
9. Assigned To (analyst name or "Unassigned")
10. Actions (3-dot menu)

Features:
- Sortable columns
- Virtualized rendering
- Pagination: 25/50/100 rows
- Row click: Open side panel
- Default sort: createdAt DESC (newest first)
```

#### Row Actions Menu
```typescript
Actions:
1. View Detail
2. Assign to Me
3. Assign to [analyst dropdown]
4. Mark as Reviewed
5. Resolve [dropdown: FRAUD_CONFIRMED, LEGITIMATE, DUPLICATE]
6. Dismiss as False Positive
7. Create Case (Phase 2)

Confirmation dialogs:
- Resolve: Ask for resolution type
- Dismiss: Ask for reason
```

#### Bulk Actions
```typescript
When rows selected:
- "X selected" counter
- Select all checkbox
- Bulk assign: [analyst dropdown]
- Bulk status: Mark Reviewed, Resolve, Dismiss
- Confirmation before action
```

#### AlertDetailPanel
```typescript
Position: Right side drawer (35% width)
Features:
- Close button (X)
- Smooth animation
- Scrollable content

Sections:

1. Alert Metadata
   - Alert ID, Created, Updated
   - Assigned To (with Reassign link)

2. Risk Explanation
   - Red text, larger font
   - Explain why alert was created

3. Risk Factors
   - List with collapsible
   - Factor name, Confidence %, Details

4. Transaction Details
   - Collapsible
   - ID, Customer, Amount, Merchant
   - Timestamp, Location

5. Customer Transaction History
   - Collapsible
   - Table: Last 5 transactions
   - Columns: ID, Amount, Merchant, Timestamp, Status
   - Sortable

6. Action Buttons
   - "Mark as Reviewed" (blue)
   - "Resolve" (green, shows dialog)
   - "Dismiss as False Positive" (gray)
   - "Create Case" (Phase 2)

7. Notes Section
   - Read-only in Phase 1
   - Display existing notes (if any)
   - Add note in Phase 2
```

### Redux Integration

```typescript
Redux:
- alertSlice: items, selectedIds, filters, pagination, unreadCount
- Default filters: severity=[CRITICAL, HIGH]
- Selectors: selectAlerts, selectSelectedIds, selectUnreadCount
- Thunks: fetchAlerts, resolveAlert, dismissAlert, bulkAction
```

---

## ⚙️ Sprint 5: Integration & Optimization (Week 7-8)

### Global Components

#### 1. Error Boundary
**File**: `src/components/Common/ErrorBoundary.tsx`
```typescript
Features:
- Catch React errors
- Display error message
- Show retry button
- Log to console
```

#### 2. Toast Notification System
**File**: `src/components/Common/ToastContainer.tsx`
```typescript
Features:
- Display multiple toasts
- Position: top-right
- Auto-dismiss after duration
- Success/error/warning/info types
- Close button on each toast
- Queue system
```

#### 3. Loading Spinner
**File**: `src/components/Common/LoadingSpinner.tsx`
```typescript
Props:
- size (small, medium, large)
- fullscreen?: boolean

Features:
- Centered spinner
- Smooth animation
- Optional overlay
```

### Performance Optimization

#### 1. Code Splitting
```typescript
Use React.lazy() for pages:
- Dashboard (lazy loaded)
- Transactions (lazy loaded)
- Alerts (lazy loaded)
- Settings (lazy loaded)
- Use Suspense fallback
```

#### 2. Component Memoization
```typescript
React.memo for:
- TransactionRow (high-frequency renders)
- AlertRow (high-frequency renders)
- KPICard (prevents unnecessary re-renders)
```

#### 3. Redux Optimization
```typescript
Use selectors with shallowEqual:
- Prevent selector-based re-renders
- Memoize selector functions
- Use useCallback for callbacks
```

#### 4. Image Optimization
```typescript
- Optimize logo (SVG)
- Cache strategy for avatars
- WebP format (with fallbacks)
```

### Testing & Documentation

#### Component Tests
```typescript
Test files to create:
- LoginForm.test.tsx
- Dashboard.test.tsx
- TransactionTable.test.tsx
- AlertTable.test.tsx
- TopNav.test.tsx
- SideNav.test.tsx

Coverage target: 60%+
```

#### E2E Tests (Cypress)
```typescript
Test scenarios:
1. Login flow
2. Forgot password
3. Dashboard loads
4. Transaction browsing
5. Transaction filtering
6. Transaction flagging
7. Alert viewing
8. Alert resolving
9. WebSocket alert notification
```

#### Documentation
```typescript
Files to create:
- README.md (setup, structure)
- CONTRIBUTING.md (guidelines)
- Component guide (patterns)
- State management (Redux patterns)
- Styling guide (Tailwind/MUI usage)
```

---

## 📦 Dependencies (Already in package.json)

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.17.0",
  "@reduxjs/toolkit": "^1.9.7",
  "react-redux": "^8.1.3",
  "axios": "^1.6.2",
  "socket.io-client": "^4.7.2",
  "@mui/material": "^5.14.13",
  "recharts": "^2.10.3",
  "react-hook-form": "^7.48.0",
  "zod": "^3.22.4",
  "date-fns": "^2.30.0",
  "react-hot-toast": "^2.4.1",
  "react-window": "^8.10.0"
}
```

---

## ✅ Definition of Done

Each task is complete when:
- [ ] Code written and locally tested
- [ ] Unit tests pass (60%+ coverage)
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Follows Redux patterns
- [ ] Error handling implemented
- [ ] Loading states shown
- [ ] Responsive design verified
- [ ] Accessibility checked (WCAG)
- [ ] Code reviewed and merged

---

## 🎯 Week-by-Week Breakdown

| Week | Component | Status |
|------|-----------|--------|
| 1-2 | Auth (Login, MFA, OAuth) | WIP |
| 3-4 | Dashboard + Navigation | TODO |
| 5 | Transactions (half) | TODO |
| 6 | Alerts (half) | TODO |
| 7 | Performance + Integration | TODO |
| 8 | Testing + Documentation | TODO |

---

**Owner**: Frontend Team
**Status**: Ready to Start
**Next**: Begin Sprint 1 implementation
