# Quick Reference Guide

## Common Operations Cheatsheet

### Authentication

```javascript
import {
  authenticateResident,
  authenticateAdmin,
  verifySession,
  logout,
  getCurrentUser,
} from "./services/authService.js";

// Resident login
await authenticateResident("R1", "1234");

// Admin login
await authenticateAdmin("admin_user", "1111");

// Check if logged in
if (verifySession()) {
  const user = getCurrentUser();
  console.log(user.type); // "resident" or "admin"
}

// Logout
logout();
```

---

### Payment Events (Admin Only)

```javascript
import {
  createPaymentEvent,
  getPaymentEvents,
  updatePaymentEvent,
} from "./services/eventService.js";

// Create monthly iuran event
await createPaymentEvent({
  name: "Iuran IPL Maret 2025",
  event_type: "IPL",
  amount: 170000,
  month: 3,
  year: 2025,
  due_date: "2025-03-31T23:59:59Z",
});

// Get active events
const events = await getPaymentEvents({ year: 2025 });

// Update event
await updatePaymentEvent(eventId, {
  due_date: "2025-03-15T23:59:59Z",
});
```

---

### Payment Obligations

```javascript
import {
  generateObligationsForEvent,
  getUnitObligations,
  calculateUnitObligations,
  getAllPendingObligations,
} from "./services/obligationService.js";

// Generate obligations for all units after creating event
await generateObligationsForEvent("evt_12345");

// See what a unit owes
const obligations = await getUnitObligations("unit_123", {
  status: "pending",
});

// Calculate total owed by unit
const total = await calculateUnitObligations("unit_123");
console.log(`Total owed: Rp${total.data.total}`);

// Admin view: all pending obligations
const pending = await getAllPendingObligations();
```

---

### Recording Payments

```javascript
import {
  recordPayment,
  getUnitPaymentStatus,
} from "./services/paymentService.js";

// Record payment
await recordPayment({
  obligation_id: "obl_123",
  amount: 170000,
  payment_method: "cash",
  notes: "Paid by unit owner",
});

// Check payment status
const status = await getUnitPaymentStatus("unit_123");
console.log(`Paid: ${status.data.payment_percentage}%`);
console.log(`Remaining: Rp${status.data.total_remaining}`);
```

---

### Kas Management

```javascript
import {
  recordDeposit,
  recordWithdrawal,
  getKasBalance,
  getTransactions,
} from "./services/transactionService.js";

// Record deposit (payment in)
await recordDeposit({
  amount: 1000000,
  description: "Monthly collections",
});

// Record withdrawal (payment out)
await recordWithdrawal({
  category_id: "cat_utilities",
  amount: 200000,
  description: "Electricity bill",
  recipient: "PLN",
});

// Get current balance
const { balance } = await getKasBalance();
console.log(`Balance: Rp${balance}`);

// Get transaction history
const txs = await getTransactions({
  start_date: "2025-01-01T00:00:00Z",
  end_date: "2025-01-31T23:59:59Z",
  limit: 50,
});
```

---

### Expense Categories

```javascript
import {
  getExpenseCategories,
  createExpenseCategory,
} from "./services/expenseService.js";

// Get all categories
const categories = await getExpenseCategories();

// Create category (admin only)
await createExpenseCategory({
  name: "Maintenance",
  description: "Building and ground maintenance",
  code: "MAINT",
});
```

---

### Financial Reports

```javascript
import {
  generateMonthlyExpenseSummary,
  getTopExpenseCategories,
  compareExpensePeriods,
} from "./services/expenseService.js";

// Generate January 2025 expense report
const report = await generateMonthlyExpenseSummary(1, 2025);
console.log(`Total expenses: Rp${report.data.total_expense}`);

// Top 5 expense categories
const top = await getTopExpenseCategories({}, 5);

// Compare two periods
const comparison = await compareExpensePeriods(
  "2024-12-01T00:00:00Z", // Dec 2024
  "2024-12-31T23:59:59Z",
  "2025-01-01T00:00:00Z", // Jan 2025
  "2025-01-31T23:59:59Z",
);
console.log(`Change: ${comparison.data.percentage_change}%`);
```

---

## Response Structure

All services return:

```javascript
// Success
{
  success: true,
  data: { /* actual data */ }
}

// Error
{
  success: false,
  error: "Error message"
}
```

---

## Common Filters

### Date Range Filter

```javascript
{
  start_date: "2025-01-01T00:00:00Z",
  end_date: "2025-01-31T23:59:59Z"
}
```

### Status Filter

```javascript
{
  status: "pending"; // or "paid", "overdue"
}
```

### Category Filter

```javascript
{
  category_id: "cat_12345";
}
```

---

## Payment Status States

| Status  | Meaning                      |
| ------- | ---------------------------- |
| pending | No payment made yet          |
| partial | Part of obligation paid      |
| paid    | Full amount paid             |
| overdue | Past due date, still pending |

---

## Transaction Types

| Type       | Direction                   |
| ---------- | --------------------------- |
| deposit    | Money IN (positive amount)  |
| withdrawal | Money OUT (negative amount) |

---

## Event Types

| Type       | Description                                    |
| ---------- | ---------------------------------------------- |
| IPL        | Monthly iuran for houses/shops                 |
| THR        | Holiday bonus collection (usually once yearly) |
| Iuran_Lain | Other special collections                      |

---

## Common Workflows

### Workflow 1: Monthly Collection

```javascript
// 1. Create event
const event = await createPaymentEvent({
  name: "Iuran IPL April 2025",
  event_type: "IPL",
  amount: 170000,
  month: 4,
  year: 2025,
  due_date: "2025-04-30T23:59:59Z",
});

// 2. Generate obligations
await generateObligationsForEvent(event.data.id);

// 3. Check pending obligations
const pending = await getAllPendingObligations();

// 4. When payment received
await recordPayment({
  obligation_id: pending[0].id,
  amount: 170000,
  payment_method: "cash",
});

// 5. Record in kas
await recordDeposit({
  amount: 170000,
  description: "Iuran from unit",
});

// 6. Verify payment
const status = await getUnitPaymentStatus(unit_id);
```

### Workflow 2: Monthly Expense Report

```javascript
// Generate report for January 2025
const report = await generateMonthlyExpenseSummary(1, 2025);

// Show total expenses
console.log(`Total: Rp${report.data.total_expense}`);

// Show by category
report.data.by_category.forEach(([cat, data]) => {
  console.log(`${cat}: Rp${data.total}`);
});

// Top expenses
const top = await getTopExpenseCategories(
  { start_date: "2025-01-01", end_date: "2025-01-31" },
  10,
);
```

### Workflow 3: Admin Dashboard View

```javascript
// Current status
const balance = await getKasBalance();

// Recent transactions
const recent = await getTransactions({ limit: 10 });

// Payment summary
const payments = await getPaymentSummary();

// Pending obligations
const pending = await getAllPendingObligations();

// Display:
// - Current balance: Rp{balance.balance}
// - Collections this month: Rp{payments.total_collected}
// - Pending payments: ${pending.length}
```

---

## Error Handling Template

```javascript
async function safeOperation(operation) {
  const result = await operation;

  if (!result.success) {
    console.error("Operation failed:", result.error);
    // Show user-friendly error message
    alert(`Error: ${result.error}`);
    return null;
  }

  return result.data;
}

// Usage
const user = await safeOperation(
  authenticateResident("R1", userPinInput.value),
);
```

---

## Database Query Examples

### Get Payment Status for Unit (SQL equivalent)

```sql
SELECT
  po.id,
  po.amount,
  COALESCE(SUM(pt.amount), 0) as paid,
  po.amount - COALESCE(SUM(pt.amount), 0) as remaining
FROM payment_obligations po
LEFT JOIN payment_transactions pt ON po.id = pt.obligation_id
WHERE po.unit_id = 'unit_123'
GROUP BY po.id, po.amount;
```

### Get Current Kas Balance

```sql
SELECT SUM(amount) as balance FROM transactions;
```

### Monthly Expense Summary

```sql
SELECT
  ec.name,
  SUM(ABS(t.amount)) as total,
  COUNT(*) as count
FROM transactions t
LEFT JOIN expense_categories ec ON t.category_id = ec.id
WHERE t.type = 'withdrawal'
  AND t.transaction_date >= '2025-01-01'
  AND t.transaction_date <= '2025-01-31'
GROUP BY ec.name;
```

---

## Tips & Tricks

1. **Check session before protected operations**

   ```javascript
   if (!verifySession()) {
     // redirect to login
   }
   ```

2. **Use filters to reduce data**

   ```javascript
   // Good: only get Jan 2025
   const txs = await getTransactions({
     start_date: "2025-01-01T00:00:00Z",
     end_date: "2025-01-31T23:59:59Z",
   });

   // Avoid: getting all transactions
   const allTxs = await getTransactions();
   ```

3. **Cache categories on load**

   ```javascript
   window.expenseCategories = await getExpenseCategories();
   // Reuse: window.expenseCategories
   ```

4. **Format currency in UI**
   ```javascript
   function formatRp(amount) {
     return new Intl.NumberFormat("id-ID", {
       style: "currency",
       currency: "IDR",
     }).format(amount);
   }
   ```
