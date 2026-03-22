# DompetWarga Services - Complete Documentation Index

## 📦 Project Structure

```
services/
├── Core Services
│   ├── supabaseClient.js              # Supabase client & session management
│   ├── authService.js                 # Authentication (residents & admins)
│   ├── eventService.js                # Payment events management
│   ├── obligationService.js           # Payment obligations
│   ├── paymentService.js              # Payment recording & status
│   ├── transactionService.js          # Kas management
│   └── expenseService.js              # Expense tracking & reporting
│
└── Documentation
    ├── README.md                      # Architecture & overview
    ├── USAGE_EXAMPLES.js              # Complete code examples
    ├── QUICK_REFERENCE.md             # Cheatsheet & common operations
    ├── QUERIES_REFERENCE.md           # Supabase queries breakdown
    ├── UI_INTEGRATION_PATTERNS.md    # Ready-to-use UI components
    └── INDEX.md                       # This file
```

---

## 🎯 Quick Start

### 1. **First Time Setup**

Read: `README.md` → Architecture overview and database schema

### 2. **Understand the Services**

Read: `QUICK_REFERENCE.md` → See what each service can do

### 3. **Start Coding**

Use: `USAGE_EXAMPLES.js` → Copy examples for your features

### 4. **Build UI**

Use: `UI_INTEGRATION_PATTERNS.md` → Ready-to-use HTML/CSS/JS

### 5. **Debug Queries**

Reference: `QUERIES_REFERENCE.md` → See actual Supabase queries

---

## 📚 Documentation Guide

### README.md (400+ lines)

**What:** Complete architecture documentation
**Contains:**

- Database schema for all 7 tables
- Service descriptions with parameters
- Payment flow explanation
- Payment status computation details
- Security considerations
- Feature highlights

**When to read:**

- Onboarding new developers
- Understanding system architecture
- Database schema reference

---

### QUICK_REFERENCE.md (200+ lines)

**What:** Cheatsheet for developers
**Contains:**

- Code snippets for all services
- Common operations (login, payments, reporting)
- Common workflows (monthly collection, reporting)
- Error handling template
- Database query examples in SQL
- Tips & tricks

**When to use:**

- Quick lookup while coding
- Copy-paste ready code
- Common operation reference

---

### USAGE_EXAMPLES.js (450+ lines)

**What:** Complete runnable examples
**Contains:**

- Authentication examples (resident & admin)
- Event creation and retrieval
- Obligation generation
- Payment recording and status
- Kas management
- Expense reporting
- Complete end-to-end workflow

**When to use:**

- Learning how to use services
- Understanding data flow
- Copy entire workflow examples

---

### QUERIES_REFERENCE.md (250+ lines)

**What:** Breakdown of Supabase queries
**Contains:**

- SQL AND JavaScript for each query
- Performance optimization tips
- Real-time subscriptions
- Query chaining patterns
- Error handling in queries
- Sample result structures

**When to use:**

- Understanding what queries do
- Performance optimization
- Debugging query issues
- Learning Supabase best practices

---

### UI_INTEGRATION_PATTERNS.md (400+ lines)

**What:** Ready-to-integrate UI components
**Contains:**

- Login page (tab switching, form handling)
- Resident payment dashboard
- Admin payment entry form
- Admin analytics dashboard
- Complete HTML/CSS/JavaScript

**When to use:**

- Building new pages/features
- Integrating service functions
- Using standard UI patterns

---

## 🔄 Common Tasks

### Add User Login

1. Read: `QUICK_REFERENCE.md` → Authentication section
2. Copy: `UI_INTEGRATION_PATTERNS.md` → Login Page Integration
3. Use: `authService.js` → `authenticateResident()` or `authenticateAdmin()`

### Display Payment Status

1. Read: `README.md` → Payment Status Computation section
2. Copy: `USAGE_EXAMPLES.js` → `getPaymentStatusExample()`
3. Integrate: `paymentService.js` → `getUnitPaymentStatus()`

### Create Monthly Event

1. Read: `QUICK_REFERENCE.md` → Payment Events section
2. Copy: `USAGE_EXAMPLES.js` → `createPaymentEventExample()`
3. Follow: `USAGE_EXAMPLES.js` → `completeWorkflowExample()`

### Generate Report

1. Read: `README.md` → expenseService section
2. Copy: `USAGE_EXAMPLES.js` → `generateMonthlyReportExample()`
3. Reference: `QUERIES_REFERENCE.md` → Expense queries

### Build Admin Dashboard

1. Copy: `UI_INTEGRATION_PATTERNS.md` → Admin Dashboard section
2. Import services from `paymentService.js`, `transactionService.js`
3. Reference: `USAGE_EXAMPLES.js` → `getPaymentSummaryExample()`

---

## 📖 Service Reference

### **authService.js** (108 lines)

**Handles:** User authentication and sessions

#### Functions:

```
✓ authenticateResident(unitCode, pin)
✓ authenticateAdmin(username, pin)
✓ verifySession()
✓ getCurrentUser()
✓ logout()
```

**When to use:**

- Login page
- Session verification
- Logout

**Example:**

```javascript
const result = await authenticateResident("R1", "1234");
if (result.success) showDashboard();
```

---

### **eventService.js** (185 lines)

**Handles:** Payment event creation and management

#### Functions:

```
✓ createPaymentEvent(eventData)
✓ getPaymentEvents(filters)
✓ getPaymentEventById(eventId)
✓ updatePaymentEvent(eventId, updates)
✓ deactivatePaymentEvent(eventId)
```

**When to use:**

- Create monthly payment events
- View upcoming collections
- Update event details

**Example:**

```javascript
const event = await createPaymentEvent({
  name: "Iuran IPL Maret 2025",
  amount: 170000,
  month: 3,
  year: 2025,
  due_date: "2025-03-31T23:59:59Z",
});
```

---

### **obligationService.js** (245 lines)

**Handles:** Payment obligation generation and tracking

#### Functions:

```
✓ createObligation(obligationData)
✓ generateObligationsForEvent(eventId)
✓ getUnitObligations(unitId, filters)
✓ getAllPendingObligations()
✓ updateObligationStatus(obligationId, status)
✓ calculateUnitObligations(unitId, filters)
```

**When to use:**

- Generate obligations after creating event
- See what a unit owes
- View all pending obligations

**Example:**

```javascript
// Create obligations for all units
await generateObligationsForEvent("evt_12345");

// Check what unit owes
const total = await calculateUnitObligations("unit_123");
```

---

### **paymentService.js** (218 lines)

**Handles:** Payment recording and status computation

#### Functions:

```
✓ recordPayment(paymentData)
✓ getTotalPaidForObligation(obligationId)
✓ getUnitPaymentStatus(unitId)        ← KEY FUNCTION
✓ getUnitPayments(unitId)
✓ getPaymentSummary()
```

**When to use:**

- Record payment from resident
- Display payment status
- View payment history

**Key Feature:** Payment status is **computed from** payment_transactions vs payment_obligations

**Example:**

```javascript
// Record payment
await recordPayment({
  obligation_id: "obl_123",
  amount: 170000,
  payment_method: "cash",
});

// Get status (automatically computed)
const status = await getUnitPaymentStatus("unit_123");
// Shows: paid %, amount remaining, breakdown by obligation
```

---

### **transactionService.js** (237 lines)

**Handles:** Kas (community fund) deposits and withdrawals

#### Functions:

```
✓ recordDeposit(depositData)
✓ recordWithdrawal(withdrawalData)
✓ getKasBalance()                     ← KEY FUNCTION
✓ getTransactions(filters)
✓ getKasBalanceByDateRange(start, end)
✓ getExpenseSummaryByCategory(filters)
```

**When to use:**

- Add money to kas (deposits)
- Spend from kas (withdrawals)
- Check current balance

**Balance = SUM(all transactions)**

**Example:**

```javascript
// Record incoming payment
await recordDeposit({
  amount: 500000,
  description: "Weekly collection",
});

// Record expense
await recordWithdrawal({
  category_id: "cat_maintenance",
  amount: 150000,
  description: "Gate repair",
});

// Get balance
const { balance } = await getKasBalance();
```

---

### **expenseService.js** (328 lines)

**Handles:** Expense categories and financial reporting

#### Functions:

```
✓ getExpenseCategories()
✓ getExpenseCategoryById(categoryId)
✓ createExpenseCategory(categoryData)
✓ generateExpenseReport(filters)
✓ generateMonthlyExpenseSummary(month, year)
✓ getTopExpenseCategories(filters, limit)
✓ compareExpensePeriods(...)
```

**When to use:**

- Manage expense categories
- Generate monthly reports
- Compare spending periods

**Example:**

```javascript
// Generate January report
const report = await generateMonthlyExpenseSummary(1, 2025);

// Top 5 categories
const top = await getTopExpenseCategories({}, 5);

// Compare months
const comparison = await compareExpensePeriods(
  "2024-12-01",
  "2024-12-31",
  "2025-01-01",
  "2025-01-31",
);
```

---

### **supabaseClient.js** (39 lines)

**Handles:** Supabase client and session management

#### Functions:

```
✓ setCurrentSession(session)
✓ getCurrentSession()
✓ clearSession()
```

**When to use:**

- Centralized Supabase client
- Track logged-in user
- Session verification

---

## 🔐 Authentication Flow

```
User Input (code + pin)
        ↓
authenticateResident/Admin()
        ↓
Query Supabase
        ↓
✅ Match found → setCurrentSession()
❌ No match → return error

Later:
getCurrentUser() → User info
verifySession() → Is logged in?
logout() → Clear session
```

---

## 💰 Payment Flow

```
1. createPaymentEvent()
   ↓ Admin creates "Iuran IPL Maret 2025"

2. generateObligationsForEvent()
   ↓ Creates 1 obligation per unit

3. getAllPendingObligations()
   ↓ View what needs to be collected

4. recordPayment()
   ↓ Admin records payment from unit

5. getUnitPaymentStatus()
   ↓ Status auto-computed from transactions
   ↓ Shows: Paid %, Remaining, Breakdown

6. recordDeposit()
   ↓ Add to kas balance
```

---

## 📊 Payment Status Computation

This is the key differentiator of this system.

**Status is computed from:**

- `payment_obligations` (what units owe)
- `payment_transactions` (what they paid)

**SQL Query:**

```sql
SELECT
  po.amount as amount_due,
  COALESCE(SUM(pt.amount), 0) as amount_paid,
  po.amount - COALESCE(SUM(pt.amount), 0) as amount_remaining,
  CASE
    WHEN SUM(pt.amount) >= po.amount THEN 'paid'
    WHEN SUM(pt.amount) > 0 THEN 'partial'
    ELSE 'pending'
  END as status
FROM payment_obligations po
LEFT JOIN payment_transactions pt ON po.id = pt.obligation_id
GROUP BY po.id;
```

**Result Example:**

```javascript
{
  obligation_id: "obl_1",
  amount_due: 500000,
  amount_paid: 300000,
  amount_remaining: 200000,
  status: "partial",        // Auto-computed
  payment_percentage: 60
}
```

---

## 🚀 Integration Checklist

- [ ] Copy `supabaseClient.js` configuration
- [ ] Import all services in main app
- [ ] Build login page (use UI_INTEGRATION_PATTERNS.md)
- [ ] Protect routes with `verifySession()`
- [ ] Build resident dashboard (use USAGE_EXAMPLES.js)
- [ ] Build admin dashboard (use UI_INTEGRATION_PATTERNS.md)
- [ ] Add payment entry form
- [ ] Add reporting page
- [ ] Test all workflows
- [ ] Add real-time updates (Supabase subscriptions)
- [ ] Build mobile-responsive UI

---

## 📞 Finding Answers

**"How do I...?"**

| Question                 | Answer in                                          |
| ------------------------ | -------------------------------------------------- |
| Login a resident?        | QUICK_REFERENCE.md → Authentication                |
| Check payment status?    | README.md → Payment Status Computation             |
| Generate a report?       | USAGE_EXAMPLES.js → generateMonthlyReportExample() |
| Record a payment?        | UI_INTEGRATION_PATTERNS.md → Payment Entry Form    |
| Build a dashboard?       | UI_INTEGRATION_PATTERNS.md → Admin Dashboard       |
| Understand the queries?  | QUERIES_REFERENCE.md → Each service's queries      |
| See a complete workflow? | USAGE_EXAMPLES.js → completeWorkflowExample()      |

---

## 💻 Development Tips

1. **Always check `result.success` first:**

   ```javascript
   const result = await someService();
   if (!result.success) {
     console.error(result.error);
     return;
   }
   ```

2. **Use consistent formatting:**

   ```javascript
   function formatRp(amount) {
     return new Intl.NumberFormat("id-ID", {
       style: "currency",
       currency: "IDR",
     }).format(amount);
   }
   ```

3. **Cache categories on load:**

   ```javascript
   window.categories = await getExpenseCategories();
   ```

4. **Verify session in protected routes:**

   ```javascript
   if (!verifySession()) {
     window.location.href = "/login.html";
   }
   ```

5. **Use date filters for performance:**
   ```javascript
   // Good: Limited date range
   await getTransactions({
     start_date: "2025-01-01",
     end_date: "2025-01-31",
   });
   ```

---

## 📈 Stats

| Metric              | Count  |
| ------------------- | ------ |
| Total Services      | 6      |
| Total Functions     | 36+    |
| Total Lines of Code | 1,360+ |
| Documentation Files | 6      |
| UI Components       | 4      |
| Database Tables     | 7      |

---

## ✅ What's Included

✅ **Complete backend services** - All 6 major services
✅ **Production-ready code** - Error handling, authorization
✅ **Comprehensive documentation** - 6 detailed guides
✅ **Code examples** - 10+ complete workflows
✅ **UI patterns** - 4 ready-to-use components
✅ **Query reference** - SQL + JavaScript for all queries
✅ **Quick reference** - Cheatsheet for developers

---

## 🎓 Learning Path

**Suggested learning order:**

1. **Day 1:** Read `README.md` → Understand architecture
2. **Day 2:** Read `QUICK_REFERENCE.md` → See available functions
3. **Day 3:** Copy examples from `USAGE_EXAMPLES.js`
4. **Day 4:** Build login page from `UI_INTEGRATION_PATTERNS.md`
5. **Day 5:** Build dashboards and integrate services
6. **Day 6:** Reference `QUERIES_REFERENCE.md` for optimization
7. **Day 7:** Add real-time features and testing

---

## 🔧 Next Steps

1. **Integrate into existing HTML:**

   ```html
   <script type="module">
     import { authenticateResident } from "./services/authService.js";
     // Use in your code
   </script>
   ```

2. **Set up proper authentication flow:**
   - Session storage
   - Route protection
   - Token management

3. **Add real-time updates:**

   ```javascript
   supabase.channel().on('postgres_changes', ...).subscribe();
   ```

4. **Implement responsive design:**
   - Mobile-first UI
   - Touch-friendly inputs
   - Optimized for Indonesia time zones

---

## 📞 Support Resources

- **Architecture Questions:** See `README.md`
- **Code Examples:** See `USAGE_EXAMPLES.js`
- **Quick Lookup:** See `QUICK_REFERENCE.md`
- **Query Details:** See `QUERIES_REFERENCE.md`
- **UI Building:** See `UI_INTEGRATION_PATTERNS.md`

---

**All files are ready to use. Start with `README.md` and follow the learning path above.**
