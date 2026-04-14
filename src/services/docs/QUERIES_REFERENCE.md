# Supabase Queries Reference

This document shows the actual Supabase queries executed by each service.

---

## Authentication Service

### Query: Authenticate Resident

```sql
SELECT id, code, display_name, category, resident_name
FROM units
WHERE code = $1 AND pin = $2
LIMIT 1;
```

**In Service:**

```javascript
const { data, error } = await supabase
  .from("units")
  .select("id, code, display_name, category, resident_name")
  .eq("code", unitCode)
  .eq("pin", pin)
  .single();
```

---

### Query: Authenticate Admin

```sql
SELECT id, username, role, created_at
FROM admins
WHERE username = $1 AND pin = $2
LIMIT 1;
```

**In Service:**

```javascript
const { data, error } = await supabase
  .from("admins")
  .select("id, username, role, created_at")
  .eq("username", username)
  .eq("pin", pin)
  .single();
```

---

## Payment Events Service

### Query: Create Payment Event

```sql
INSERT INTO payment_events
(name, event_type, description, amount, month, year, due_date,
 created_by, created_at, is_active)
VALUES
($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
RETURNING *;
```

### Query: Get Active Events with Filters

```sql
SELECT *
FROM payment_events
WHERE is_active = true
  AND (event_type = $1 OR event_type IS NULL)
  AND (year = $2 OR year IS NULL)
ORDER BY year DESC, month DESC;
```

### Query: Deactivate Event

```sql
UPDATE payment_events
SET is_active = false
WHERE id = $1;
```

---

## Payment Obligations Service

### Query: Generate Obligations for Event

```sql
-- First, get event details
SELECT id, amount, due_date
FROM payment_events
WHERE id = $1;

-- Then get all units
SELECT id FROM units WHERE is_active = true;

-- Then batch insert
INSERT INTO payment_obligations
(event_id, unit_id, amount, due_date, status, created_at)
VALUES
($1, $2, $3, $4, 'pending', NOW()),
($1, $3, $3, $4, 'pending', NOW()),
-- ... repeat for each unit
RETURNING *;
```

### Query: Get Unit Obligations

```sql
SELECT
  po.id, po.event_id, po.unit_id, po.amount,
  po.due_date, po.status, po.created_at,
  pe.id, pe.name, pe.event_type, pe.year, pe.month
FROM payment_obligations po
LEFT JOIN payment_events pe ON po.event_id = pe.id
WHERE po.unit_id = $1
  AND (po.status = $2 OR po.status IS NULL)
  AND (pe.year = $3 OR pe.year IS NULL)
ORDER BY po.created_at DESC;
```

### Query: Get All Pending Obligations

```sql
SELECT
  po.*,
  u.code, u.display_name, u.category,
  pe.name, pe.event_type, pe.year, pe.month, pe.due_date
FROM payment_obligations po
INNER JOIN units u ON po.unit_id = u.id
INNER JOIN payment_events pe ON po.event_id = pe.id
WHERE po.status = 'pending'
ORDER BY pe.due_date ASC;
```

---

## Payment Service

### Query: Record Payment

```sql
INSERT INTO payment_transactions
(obligation_id, unit_id, admin_id, amount,
 payment_date, payment_method, notes, status, created_at)
VALUES
($1, $2, $3, $4, $5, $6, $7, 'completed', NOW())
RETURNING *;
```

### Query: Get Total Paid for Obligation

```sql
SELECT COALESCE(SUM(amount), 0) as total_paid
FROM payment_transactions
WHERE obligation_id = $1;
```

### Query: Get Unit Payment Status (Key Query)

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
  END as computed_status,
  pe.name, pe.year, pe.month
FROM payment_obligations po
LEFT JOIN payment_transactions pt ON po.id = pt.obligation_id
LEFT JOIN payment_events pe ON po.event_id = pe.id
WHERE po.unit_id = $1
GROUP BY po.id, po.amount, pe.id, pe.name, pe.year, pe.month
ORDER BY pe.year DESC, pe.month DESC;
```

**This query is the core of payment status computation:**

```javascript
// The service then processes this data
obligations.forEach((obl) => {
  const remaining = obl.amount_due - obl.amount_paid;
  const percentage = Math.round((obl.amount_paid / obl.amount_due) * 100);
  // Return computed status
});
```

### Query: Get Payment Summary (Admin)

```sql
SELECT
  pt.id, pt.amount, pt.payment_date, pt.payment_method,
  u.code, u.display_name, u.category,
  pe.name, pe.year
FROM payment_transactions pt
LEFT JOIN units u ON pt.unit_id = u.id
LEFT JOIN payment_obligations po ON pt.obligation_id = po.id
LEFT JOIN payment_events pe ON po.event_id = pe.id
ORDER BY pt.payment_date DESC;
```

---

## Transaction Service

### Query: Record Deposit

```sql
INSERT INTO transactions
(type, amount, category_id, description,
 transaction_date, recorded_by, created_at)
VALUES
('deposit', $1, $2, $3, $4, $5, NOW())
RETURNING *;
```

### Query: Record Withdrawal

```sql
INSERT INTO transactions
(type, amount, category_id, description, recipient,
 transaction_date, recorded_by, created_at)
VALUES
('withdrawal', -$1, $2, $3, $4, $5, $6, NOW())
RETURNING *;
```

### Query: Get Current Kas Balance

```sql
SELECT COALESCE(SUM(amount), 0) as balance
FROM transactions;
```

### Query: Get Transactions with Filters

```sql
SELECT
  t.*,
  ec.id as category_id, ec.name as category_name
FROM transactions t
LEFT JOIN expense_categories ec ON t.category_id = ec.id
WHERE
  (t.type = $1 OR t.type IS NULL)
  AND (t.category_id = $2 OR t.category_id IS NULL)
  AND (t.transaction_date >= $3 OR t.transaction_date IS NULL)
  AND (t.transaction_date <= $4 OR t.transaction_date IS NULL)
ORDER BY t.transaction_date DESC
LIMIT $5;
```

### Query: Get Kas Balance by Date Range

```sql
SELECT
  COALESCE(SUM(amount), 0) as balance,
  COALESCE(SUM(CASE WHEN type = 'deposit' THEN amount ELSE 0 END), 0) as deposits,
  COALESCE(SUM(CASE WHEN type = 'withdrawal' THEN ABS(amount) ELSE 0 END), 0) as withdrawals
FROM transactions
WHERE transaction_date >= $1 AND transaction_date <= $2;
```

### Query: Get Expense Summary by Category

```sql
SELECT
  ec.name,
  COALESCE(SUM(ABS(t.amount)), 0) as total,
  COUNT(*) as count
FROM transactions t
LEFT JOIN expense_categories ec ON t.category_id = ec.id
WHERE
  t.type = 'withdrawal'
  AND (t.transaction_date >= $1 OR t.transaction_date IS NULL)
  AND (t.transaction_date <= $2 OR t.transaction_date IS NULL)
GROUP BY ec.id, ec.name
ORDER BY total DESC;
```

---

## Expense Service

### Query: Get Expense Categories

```sql
SELECT *
FROM expense_categories
WHERE is_active = true
ORDER BY name ASC;
```

### Query: Create Expense Category

```sql
INSERT INTO expense_categories
(name, description, code, is_active, created_at)
VALUES
($1, $2, $3, true, NOW())
RETURNING *;
```

### Query: Generate Expense Report

```sql
SELECT
  t.id, t.amount, t.description, t.recipient, t.transaction_date,
  ec.id as category_id, ec.name
FROM transactions t
LEFT JOIN expense_categories ec ON t.category_id = ec.id
WHERE
  t.type = 'withdrawal'
  AND (t.transaction_date >= $1 OR t.transaction_date IS NULL)
  AND (t.transaction_date <= $2 OR t.transaction_date IS NULL)
ORDER BY t.transaction_date ASC;
```

### Query: Get Top Expense Categories

```sql
SELECT
  ec.name,
  COALESCE(SUM(ABS(t.amount)), 0) as total
FROM transactions t
LEFT JOIN expense_categories ec ON t.category_id = ec.id
WHERE
  t.type = 'withdrawal'
  AND (t.transaction_date >= $1 OR t.transaction_date IS NULL)
  AND (t.transaction_date <= $2 OR t.transaction_date IS NULL)
GROUP BY ec.id, ec.name
ORDER BY total DESC
LIMIT $3;
```

---

## Performance Optimization Tips

### 1. Add Indexes

```sql
-- For authentication lookups
CREATE INDEX idx_units_code_pin ON units(code, pin);
CREATE INDEX idx_admins_username_pin ON admins(username, pin);

-- For payment queries
CREATE INDEX idx_obligations_unit_status ON payment_obligations(unit_id, status);
CREATE INDEX idx_transactions_obligation ON payment_transactions(obligation_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);

-- For reporting
CREATE INDEX idx_transactions_type_date ON transactions(type, transaction_date);
CREATE INDEX idx_obligations_event_unit ON payment_obligations(event_id, unit_id);
```

### 2. Use Pagination

Instead of:

```javascript
const { data } = await supabase.from("transactions").select("*");
```

Use:

```javascript
const { data } = await supabase
  .from("transactions")
  .select("*")
  .range(0, 99) // First 100 records
  .order("transaction_date", { ascending: false });
```

### 3. Cache Results

```javascript
// Cache categories on app load
const categories = await getExpenseCategories();
window.expenseCategories = categories.data;

// Reuse in dropdowns
categories.forEach((cat) => {
  // add to select without re-querying
});
```

### 4. Batch Operations

Instead of inserting one obligation at a time:

```javascript
// Good: Batch insert
const obligations = units.map((u) => ({
  event_id: eventId,
  unit_id: u.id,
  amount: eventAmount,
  due_date: dueDate,
  status: "pending",
}));
await supabase.from("payment_obligations").insert(obligations);
```

---

## Real-Time Subscriptions

### Subscribe to Payment Obligations Changes

```javascript
supabase
  .channel("obligations-channel")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "payment_obligations" },
    (payload) => {
      console.log("Obligation changed:", payload);
      refreshPaymentStatus();
    },
  )
  .subscribe();
```

### Subscribe to Transaction Changes

```javascript
supabase
  .channel("transactions-channel")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "transactions" },
    (payload) => {
      console.log("Transaction changed:", payload);
      updateKasBalance();
    },
  )
  .subscribe();
```

---

## Query Chaining Examples

### Complex: Get monthly payment summary

```javascript
// Get all payments for a month
const { data } = await supabase
  .from("payment_transactions pt")
  .select(
    `
    amount,
    payment_method,
    unit:units(code, category),
    obligation:payment_obligations(
      event:payment_events(name, year, month)
    )
  `,
  )
  .gte("payment_date", "2025-01-01")
  .lte("payment_date", "2025-01-31")
  .order("payment_date", { ascending: false });

// Process in JavaScript
const summary = {
  total: 0,
  byMethod: {},
  byUnit: {},
};

data.forEach((payment) => {
  summary.total += payment.amount;
  summary.byMethod[payment.payment_method] =
    (summary.byMethod[payment.payment_method] || 0) + payment.amount;
});
```

---

## Error Handling in Queries

### Check for errors in all queries:

```javascript
const { data, error } = await supabase
  .from("payment_obligations")
  .select("*")
  .eq("unit_id", unitId);

if (error) {
  console.error("Query error:", error);
  // Handle: network error, permissions, etc.
  return { success: false, error: error.message };
}

if (!data) {
  // No results found
  return { success: true, data: [] };
}

return { success: true, data };
```

---

## Common Query Patterns

### Pattern 1: Filter with Optional Parameters

```javascript
let query = supabase.from("table").select("*");

if (filters.status) query = query.eq("status", filters.status);
if (filters.year) query = query.eq("year", filters.year);
if (filters.start_date) query = query.gte("date", filters.start_date);
if (filters.end_date) query = query.lte("date", filters.end_date);

const { data } = await query.order("created_at", { ascending: false });
```

### Pattern 2: Count Records

```javascript
const { count } = await supabase
  .from("payment_obligations")
  .select("*", { count: "exact", head: true })
  .eq("status", "pending");

console.log(`Pending obligations: ${count}`);
```

### Pattern 3: Update Multiple Records

```javascript
await supabase
  .from("payment_obligations")
  .update({ status: "overdue" })
  .lt("due_date", new Date().toISOString())
  .eq("status", "pending");
```

---

## Sample Query Results

### Payment Status Query Result

```javascript
{
  "obligations": [
    {
      "obligation_id": "obl_001",
      "amount_due": 170000,
      "amount_paid": 170000,
      "amount_remaining": 0,
      "computed_status": "paid",
      "name": "Iuran IPL Januari 2025",
      "year": 2025,
      "month": 1
    },
    {
      "obligation_id": "obl_002",
      "amount_due": 170000,
      "amount_paid": 0,
      "amount_remaining": 170000,
      "computed_status": "pending",
      "name": "Iuran IPL Februari 2025",
      "year": 2025,
      "month": 2
    }
  ],
  "total_due": 340000,
  "total_paid": 170000,
  "total_remaining": 170000,
  "payment_percentage": 50
}
```

---

This reference shows exactly what queries are executed behind each service function, helping you understand performance characteristics and how to optimize if needed.
