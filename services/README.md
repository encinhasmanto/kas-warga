# DompetWarga Backend Services Architecture

## Overview

This refactored backend architecture supports a comprehensive payment and expense management system for residential communities (DompetWarga). The system handles resident authentication, payment obligations, payment tracking, and expense categorization with detailed reporting capabilities.

## Database Schema

### Tables

#### **units**

Stores residential/commercial unit information.

```sql
- id (PK)
- code (VARCHAR, unique) - Unit code (e.g., "R1", "A3", "B5")
- display_name (VARCHAR) - Resident/owner name
- category (VARCHAR) - "Ruko", "Rumah"
- resident_name (VARCHAR)
- pin (VARCHAR) - 4-digit PIN for resident login
- is_active (BOOLEAN)
- no_sequence_unit (INTEGER) - Ordering
- created_at (TIMESTAMP)
```

#### **admins**

Stores administrator credentials.

```sql
- id (PK)
- username (VARCHAR, unique)
- pin (VARCHAR) - Admin PIN
- role (VARCHAR) - Admin role/permissions
- created_at (TIMESTAMP)
```

#### **payment_events**

Records payment events (e.g., monthly iuran, THR collections).

```sql
- id (PK)
- name (VARCHAR) - Event name (e.g., "Iuran IPL Januari 2025")
- event_type (VARCHAR) - "IPL", "THR", "Iuran_Lain"
- description (TEXT)
- amount (DECIMAL) - Standard amount per unit
- month (INTEGER) - Month number (1-12)
- year (INTEGER) - Year
- due_date (TIMESTAMP)
- is_active (BOOLEAN)
- created_by (FK -> admins.id)
- created_at (TIMESTAMP)
```

#### **payment_obligations**

Individual payment obligations for each unit per event.

```sql
- id (PK)
- event_id (FK -> payment_events.id)
- unit_id (FK -> units.id)
- amount (DECIMAL) - Amount due
- due_date (TIMESTAMP)
- status (VARCHAR) - "pending", "paid", "overdue"
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### **payment_transactions**

Records actual payments made by residents.

```sql
- id (PK)
- obligation_id (FK -> payment_obligations.id)
- unit_id (FK -> units.id)
- admin_id (FK -> admins.id) - Admin who recorded payment
- amount (DECIMAL) - Amount paid
- payment_date (TIMESTAMP)
- payment_method (VARCHAR) - "cash", "transfer", "check"
- notes (TEXT)
- status (VARCHAR) - "completed", "pending"
- created_at (TIMESTAMP)
```

#### **transactions**

General ledger for kas (community fund) deposits and withdrawals.

```sql
- id (PK)
- type (VARCHAR) - "deposit", "withdrawal"
- amount (DECIMAL) - Positive for deposits, negative for withdrawals
- category_id (FK -> expense_categories.id)
- description (TEXT)
- recipient (VARCHAR) - Who received payment (for withdrawals)
- transaction_date (TIMESTAMP)
- recorded_by (FK -> admins.id)
- created_at (TIMESTAMP)
```

#### **expense_categories**

Categories for tracking expense types.

```sql
- id (PK)
- name (VARCHAR) - Category name
- description (TEXT)
- code (VARCHAR) - Short code
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
```

## Service Architecture

### Directory Structure

```
services/
├── supabaseClient.js         # Supabase client configuration
├── authService.js            # Authentication (residents & admins)
├── eventService.js           # Payment event management
├── obligationService.js      # Payment obligation generation
├── paymentService.js         # Payment recording & status
├── transactionService.js     # Kas deposits/withdrawals
├── expenseService.js         # Expense categories & reporting
├── USAGE_EXAMPLES.js         # Comprehensive examples
└── README.md                 # This file
```

## Services Overview

### 1. **authService.js**

Handles all authentication for residents and admins.

**Key Functions:**

- `authenticateResident(unitCode, pin)` - Login with unit code + PIN
- `authenticateAdmin(username, pin)` - Login with username + PIN
- `verifySession()` - Check if user is still authenticated
- `getCurrentUser()` - Get current session info
- `logout()` - Clear session

**Usage:**

```javascript
// Resident login
const result = await authenticateResident("R1", "1234");
if (result.success) {
  console.log("Welcome", result.data.display_name);
}

// Admin login
const adminResult = await authenticateAdmin("admin", "1111");
```

---

### 2. **eventService.js**

Creates and manages payment events (monthly collections, THR, etc).

**Key Functions:**

- `createPaymentEvent(eventData)` - Create new payment event (admin only)
- `getPaymentEvents(filters)` - Get active events
- `getPaymentEventById(eventId)` - Get event details
- `updatePaymentEvent(eventId, updates)` - Update event
- `deactivatePaymentEvent(eventId)` - Archive event

**Usage:**

```javascript
// Create event for January 2025
const event = await createPaymentEvent({
  name: "Iuran IPL Januari 2025",
  event_type: "IPL",
  amount: 170000,
  month: 1,
  year: 2025,
  due_date: "2025-01-31T23:59:59Z",
});

// Get all pending events
const events = await getPaymentEvents({ year: 2025 });
```

---

### 3. **obligationService.js**

Generates payment obligations for units based on events.

**Key Functions:**

- `createObligation(obligationData)` - Create single obligation
- `generateObligationsForEvent(eventId)` - Create obligations for all units
- `getUnitObligations(unitId, filters)` - Get unit's obligations
- `getAllPendingObligations()` - Get all pending (admin dashboard)
- `calculateUnitObligations(unitId, filters)` - Calculate total owed
- `updateObligationStatus(obligationId, status)` - Update status

**Usage:**

```javascript
// Generate obligations for all units when event is created
const result = await generateObligationsForEvent("evt_12345");
console.log(`Created ${result.created} obligations`);

// See what a unit owes
const status = await calculateUnitObligations("unit_123");
console.log(`Total owed: Rp${status.total}`);
```

---

### 4. **paymentService.js**

Records payments and computes payment status.

**Key Functions:**

- `recordPayment(paymentData)` - Record payment from resident
- `getUnitPaymentStatus(unitId)` - Get detailed payment status
- `getUnitPayments(unitId)` - Get payment history
- `getPaymentSummary()` - Admin view of all payments
- `getTotalPaidForObligation(obligationId)` - Calculate paid amount

**Payment Status Computation:**
Payment status is computed dynamically from:

- `payment_obligations` - What units owe
- `payment_transactions` - What they've paid

**Example:**

```
Obligation: Rp500,000
Payments Recorded: Rp500,000
Status: PAID (100%)

Obligation: Rp500,000
Payments Recorded: Rp300,000
Status: PENDING (60% paid, Rp200,000 remaining)
```

**Usage:**

```javascript
// Record a payment
await recordPayment({
  obligation_id: "obl_123",
  amount: 170000,
  payment_method: "cash",
});

// Check payment status
const status = await getUnitPaymentStatus("unit_123");
console.log(`Paid: Rp${status.data.total_paid}`);
console.log(`Remaining: Rp${status.data.total_remaining}`);
```

---

### 5. **transactionService.js**

Manages kas (community fund) deposits and withdrawals.

**Key Functions:**

- `recordDeposit(depositData)` - Add money to kas
- `recordWithdrawal(withdrawalData)` - Remove money from kas
- `getKasBalance()` - Get current balance
- `getTransactions(filters)` - Get transaction history
- `getKasBalanceByDateRange(start, end)` - Balance report by period
- `getExpenseSummaryByCategory(filters)` - Expenses breakdown

**Usage:**

```javascript
// Record payment received from units
await recordDeposit({
  amount: 500000,
  description: "Weekly collection",
});

// Record expense (with expense category)
await recordWithdrawal({
  category_id: "cat_maintenance",
  amount: 150000,
  description: "Gate repair",
  recipient: "Tukang Servis",
});

// Check current balance
const { balance } = await getKasBalance();
console.log(`Current Kas: Rp${balance}`);
```

---

### 6. **expenseService.js**

Manages expense categories and generates financial reports.

**Key Functions:**

- `getExpenseCategories()` - Get all expense types
- `createExpenseCategory(data)` - Create new category (admin)
- `generateExpenseReport(filters)` - Generate expense report
- `generateMonthlyExpenseSummary(month, year)` - Monthly report
- `getTopExpenseCategories(filters, limit)` - Top spending categories
- `compareExpensePeriods()` - Compare two time periods

**Usage:**

```javascript
// Get expense categories
const categories = await getExpenseCategories();

// Generate January 2025 report
const report = await generateMonthlyExpenseSummary(1, 2025);
console.log(`Total expenses: Rp${report.data.total_expense}`);

// See top spending categories
const top = await getTopExpenseCategories({}, 5);
// Output: Maintenance, Security, Utilities, etc.

// Compare January vs December
const comparison = await compareExpensePeriods(
  "2024-12-01T00:00:00Z",
  "2024-12-31T23:59:59Z",
  "2025-01-01T00:00:00Z",
  "2025-01-31T23:59:59Z",
);
```

---

### 7. **supabaseClient.js**

Centralized Supabase configuration and session management.

**Features:**

- Single Supabase instance for all services
- Session management (stores logged-in user info)
- `setCurrentSession()` - Set user session
- `getCurrentSession()` - Get current user info
- `clearSession()` - Logout user

---

## Complete Payment Flow

```
1. Admin creates payment event
   ↓
2. System generates obligations for each unit
   ↓
3. Residents see payment due
   ↓
4. Admin records payment from resident
   ↓
5. Payment status automatically updated
   ↓
6. Admin records kas deposit
   ↓
7. Kas balance updated (sum of all transactions)
```

## Payment Status Computation Example

**Database Query (Payment Status):**

```sql
SELECT
  po.id as obligation_id,
  po.amount as amount_due,
  COALESCE(SUM(pt.amount), 0) as amount_paid,
  po.amount - COALESCE(SUM(pt.amount), 0) as amount_remaining,
  CASE
    WHEN COALESCE(SUM(pt.amount), 0) >= po.amount THEN 'paid'
    WHEN COALESCE(SUM(pt.amount), 0) > 0 THEN 'partial'
    ELSE 'pending'
  END as status
FROM payment_obligations po
LEFT JOIN payment_transactions pt ON po.id = pt.obligation_id
WHERE po.unit_id = $1
GROUP BY po.id, po.amount
```

**Result Example:**

```javascript
{
  unit_id: "unit_123",
  total_obligations: 12,
  total_due: 2_040_000,
  total_paid: 1_700_000,
  total_remaining: 340_000,
  payment_percentage: 83,
  obligations: [
    {
      obligation_id: "obl_1",
      event_name: "Iuran IPL Januari 2025",
      amount_due: 170_000,
      amount_paid: 170_000,
      amount_remaining: 0,
      status: "paid",
      payment_percentage: 100
    },
    {
      obligation_id: "obl_2",
      event_name: "Iuran IPL Februari 2025",
      amount_due: 170_000,
      amount_paid: 0,
      amount_remaining: 170_000,
      status: "pending",
      payment_percentage: 0
    },
    // ... more obligations
  ]
}
```

## Error Handling

All services return consistent response format:

```javascript
{
  success: boolean,
  data: any,           // On success
  error: string        // On error
}
```

Example:

```javascript
const result = await authenticateResident("R1", "wrong_pin");
// {
//   success: false,
//   error: "Invalid unit code or PIN"
// }
```

## Security Considerations

1. **Authentication**: PINs should be hashed in database (use bcrypt)
2. **Authorization**: Check `session.type` and `session.id` before operations
3. **Data Access**: Residents can only see their own data
4. **Audit Trail**: All transactions recorded with `recorded_by` field

## Usage Flow

1. Import services:

```javascript
import { authenticateResident } from "./services/authService.js";
import { recordPayment } from "./services/paymentService.js";
import { getKasBalance } from "./services/transactionService.js";
```

2. Authenticate user:

```javascript
const auth = await authenticateResident("R1", "1234");
if (!auth.success) return alert(auth.error);
```

3. Use services:

```javascript
const status = await getUnitPaymentStatus("unit_123");
const balance = await getKasBalance();
```

## Key Features

✅ **Dual Authentication**: Residents (unit_code + PIN) and Admins (username + PIN)
✅ **Dynamic Payment Status**: Computed from transactions vs obligations
✅ **Expense Categorization**: Track spending by category
✅ **Financial Reports**: Monthly summaries, period comparisons, top expenses
✅ **Audit Trail**: All transactions recorded with user and timestamp
✅ **Flexible Events**: Support for IPL, THR, and other payment types
✅ **Error Handling**: Consistent error responses across all services

## Next Steps

1. Integrate services into UI components
2. Build admin dashboard for payment tracking
3. Create resident portal for viewing payment status
4. Implement real-time updates using Supabase subscriptions
5. Add payment reminders and notifications
6. Generate PDF financial reports
