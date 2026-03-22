/**
 * SERVICE USAGE EXAMPLES
 * Comprehensive examples showing how to use all services
 */

// ============================================================
// 1. AUTHENTICATION SERVICE EXAMPLES
// ============================================================

import {
  authenticateResident,
  authenticateAdmin,
  verifySession,
  logout,
  getCurrentUser,
} from "./services/authService.js";

/**
 * Example: Resident Login
 */
async function residentLoginExample() {
  const result = await authenticateResident("R1", "1234");

  if (result.success) {
    console.log("✅ Logged in as resident:", result.data.display_name);
    // User can now access resident functions
  } else {
    console.error("❌ Login failed:", result.error);
  }
}

/**
 * Example: Admin Login
 */
async function adminLoginExample() {
  const result = await authenticateAdmin("admin_user", "admin_pin");

  if (result.success) {
    console.log("✅ Logged in as admin:", result.data.username);
    // Admin can now access admin functions
  } else {
    console.error("❌ Login failed:", result.error);
  }
}

/**
 * Example: Check User Is Logged In
 */
function checkAuthenticationExample() {
  if (verifySession()) {
    const user = getCurrentUser();
    console.log("Current user:", user);
  } else {
    console.log("Not logged in");
  }
}

/**
 * Example: Logout
 */
function logoutExample() {
  logout();
  console.log("Logged out successfully");
}

// ============================================================
// 2. PAYMENT EVENT SERVICE EXAMPLES
// ============================================================

import {
  createPaymentEvent,
  getPaymentEvents,
  getPaymentEventById,
  updatePaymentEvent,
  deactivatePaymentEvent,
} from "./services/eventService.js";

/**
 * Example: Create Payment Event (Iuran IPL for January 2025)
 */
async function createPaymentEventExample() {
  const result = await createPaymentEvent({
    name: "Iuran IPL Januari 2025",
    event_type: "IPL",
    description: "Monthly iuran for January 2025",
    amount: 170000, // Rumah, 250000 for Ruko
    month: 1,
    year: 2025,
    due_date: "2025-01-31T23:59:59Z",
  });

  if (result.success) {
    console.log("✅ Event created with ID:", result.data.id);
  }
}

/**
 * Example: Get Active Events
 */
async function getPaymentEventsExample() {
  const result = await getPaymentEvents({
    year: 2025,
    eventType: "IPL",
  });

  if (result.success) {
    console.log("✅ Found events:", result.data.length);
    result.data.forEach((event) => {
      console.log(`- ${event.name} (${event.event_type}): Rp${event.amount}`);
    });
  }
}

// ============================================================
// 3. PAYMENT OBLIGATION SERVICE EXAMPLES
// ============================================================

import {
  createObligation,
  generateObligationsForEvent,
  getUnitObligations,
  getAllPendingObligations,
  calculateUnitObligations,
} from "./services/obligationService.js";

/**
 * Example: Generate Obligations for All Units (after creating an event)
 */
async function generateObligationsExample() {
  // Assuming event was created with ID: evt_12345
  const result = await generateObligationsForEvent("evt_12345");

  if (result.success) {
    console.log(`✅ Created ${result.created} obligations`);
  }
}

/**
 * Example: Get Unit Obligations
 */
async function getUnitObligationsExample() {
  const result = await getUnitObligations("unit_12345", {
    status: "pending",
    year: 2025,
  });

  if (result.success) {
    result.data.forEach((obl) => {
      console.log(`
        Event: ${obl.event.name}
        Amount Due: Rp${obl.amount}
        Status: ${obl.status}
        Due Date: ${obl.due_date}
      `);
    });
  }
}

/**
 * Example: Calculate Total Obligations for Unit
 */
async function calculateObligationsExample() {
  const result = await calculateUnitObligations("unit_12345", {
    status: "pending",
  });

  if (result.success) {
    console.log(`
      Total Pending Obligations: Rp${result.total}
      Number of Obligations: ${result.count}
    `);
  }
}

/**
 * Example: Get All Pending Obligations (Admin Dashboard)
 */
async function getAllPendingObligationsExample() {
  const result = await getAllPendingObligations();

  if (result.success) {
    result.data.forEach((obl) => {
      console.log(`
        Unit: ${obl.unit.code} - ${obl.unit.display_name}
        Event: ${obl.event.name}
        Amount: Rp${obl.amount}
        Due: ${obl.due_date}
      `);
    });
  }
}

// ============================================================
// 4. PAYMENT SERVICE EXAMPLES
// ============================================================

import {
  recordPayment,
  getUnitPaymentStatus,
  getUnitPayments,
  getPaymentSummary,
} from "./services/paymentService.js";

/**
 * Example: Record Payment (Admin records payment from resident)
 */
async function recordPaymentExample() {
  const result = await recordPayment({
    obligation_id: "obl_12345",
    amount: 170000,
    payment_date: new Date().toISOString(),
    payment_method: "cash",
    notes: "Payment from R1 - Seblak Nasir",
  });

  if (result.success) {
    console.log("✅ Payment recorded");
  }
}

/**
 * Example: Get Payment Status (Computed from transactions vs obligations)
 */
async function getPaymentStatusExample() {
  const result = await getUnitPaymentStatus("unit_12345");

  if (result.success) {
    const status = result.data;
    console.log(`
      Unit: ${status.unit_id}
      Total Due: Rp${status.total_due}
      Total Paid: Rp${status.total_paid}
      Remaining: Rp${status.total_remaining}
      Payment %: ${status.payment_percentage}%
    `);

    // Show each obligation
    status.obligations.forEach((obl) => {
      console.log(`
        ${obl.event_name}:
        - Amount: Rp${obl.amount_due}
        - Paid: Rp${obl.amount_paid}
        - Remaining: Rp${obl.amount_remaining}
        - Status: ${obl.status}
      `);
    });
  }
}

/**
 * Example: Get Payment Summary (Admin view)
 */
async function getPaymentSummaryExample() {
  const result = await getPaymentSummary();

  if (result.success) {
    console.log(`
      Total Collected: Rp${result.data.total_collected}
      Total Transactions: ${result.data.total_transactions}

      By Payment Method:
      ${JSON.stringify(result.data.payments_by_method, null, 2)}

      By Unit:
      ${JSON.stringify(result.data.payments_by_unit, null, 2)}
    `);
  }
}

// ============================================================
// 5. TRANSACTION SERVICE EXAMPLES
// ============================================================

import {
  recordDeposit,
  recordWithdrawal,
  getKasBalance,
  getTransactions,
  getExpenseSummaryByCategory,
} from "./services/transactionService.js";

/**
 * Example: Record Deposit (Kas Masuk)
 */
async function recordDepositExample() {
  const result = await recordDeposit({
    amount: 500000,
    description: "Payments from residents (Weekly collection)",
    transaction_date: new Date().toISOString(),
  });

  if (result.success) {
    console.log("✅ Deposit recorded: Rp500,000");
  }
}

/**
 * Example: Record Withdrawal (Kas Keluar) with Expense Category
 */
async function recordWithdrawalExample() {
  const result = await recordWithdrawal({
    category_id: "cat_maintenance", // Must have expense category
    amount: 150000,
    description: "Gate maintenance and repair",
    recipient: "Tukang Service",
    transaction_date: new Date().toISOString(),
  });

  if (result.success) {
    console.log("✅ Withdrawal recorded: Rp150,000");
  }
}

/**
 * Example: Get Current Kas Balance
 */
async function getKasBalanceExample() {
  const result = await getKasBalance();

  if (result.success) {
    console.log(`Current Kas Balance: Rp${result.balance}`);
  }
}

/**
 * Example: Get Transactions with Filters
 */
async function getTransactionsExample() {
  const result = await getTransactions({
    start_date: "2025-01-01T00:00:00Z",
    end_date: "2025-01-31T23:59:59Z",
    limit: 50,
  });

  if (result.success) {
    result.data.forEach((tx) => {
      console.log(`
        ${tx.type.toUpperCase()}: Rp${tx.amount}
        Category: ${tx.category?.name}
        Date: ${tx.transaction_date}
        Description: ${tx.description}
      `);
    });
  }
}

/**
 * Example: Get Expense Summary by Category
 */
async function getExpenseSummaryExample() {
  const result = await getExpenseSummaryByCategory({
    start_date: "2025-01-01T00:00:00Z",
    end_date: "2025-01-31T23:59:59Z",
  });

  if (result.success) {
    console.log("Expense Summary by Category:");
    Object.entries(result.data).forEach(([category, summary]) => {
      console.log(`
        ${category}:
        - Total: Rp${summary.total}
        - Transactions: ${summary.count}
      `);
    });
  }
}

// ============================================================
// 6. EXPENSE SERVICE EXAMPLES
// ============================================================

import {
  getExpenseCategories,
  createExpenseCategory,
  generateExpenseReport,
  generateMonthlyExpenseSummary,
  getTopExpenseCategories,
  compareExpensePeriods,
} from "./services/expenseService.js";

/**
 * Example: Get All Expense Categories
 */
async function getExpenseCategoriesExample() {
  const result = await getExpenseCategories();

  if (result.success) {
    result.data.forEach((cat) => {
      console.log(`- ${cat.name}: ${cat.description}`);
    });
  }
}

/**
 * Example: Create New Expense Category (Admin Only)
 */
async function createExpenseCategoryExample() {
  const result = await createExpenseCategory({
    name: "Gate Maintenance",
    description: "Maintenance and repair of community gate",
    code: "MAINTENANCE",
  });

  if (result.success) {
    console.log("✅ Category created with ID:", result.data.id);
  }
}

/**
 * Example: Generate Monthly Expense Report
 */
async function generateMonthlyReportExample() {
  const result = await generateMonthlyExpenseSummary(1, 2025); // January 2025

  if (result.success) {
    console.log(`
      Total Expenses: Rp${result.data.total_expense}
      Transactions: ${result.data.transaction_count}

      By Category:
    `);

    Object.entries(result.data.by_category).forEach(([category, data]) => {
      console.log(`
        ${category}:
        - Total: Rp${data.total}
        - Count: ${data.count}
      `);
    });
  }
}

/**
 * Example: Get Top Expense Categories
 */
async function getTopCategoriesExample() {
  const result = await getTopExpenseCategories(
    {
      start_date: "2025-01-01T00:00:00Z",
      end_date: "2025-01-31T23:59:59Z",
    },
    5, // Top 5
  );

  if (result.success) {
    console.log("Top 5 Expense Categories:");
    result.data.forEach((item, idx) => {
      console.log(`${idx + 1}. ${item.category}: Rp${item.total}`);
    });
  }
}

/**
 * Example: Compare Expenses Between Two Periods
 */
async function comparePeriodExample() {
  const result = await compareExpensePeriods(
    "2024-12-01T00:00:00Z", // December 2024
    "2024-12-31T23:59:59Z",
    "2025-01-01T00:00:00Z", // January 2025
    "2025-01-31T23:59:59Z",
  );

  if (result.success) {
    console.log(`
      December 2024: Rp${result.data.period_1.total_expense}
      January 2025: Rp${result.data.period_2.total_expense}
      Difference: Rp${result.data.difference}
      Change: ${result.data.percentage_change}%
    `);
  }
}

// ============================================================
// COMPLETE WORKFLOW EXAMPLE
// ============================================================

/**
 * Complete Workflow: Creating a payment event and collecting payments
 */
async function completeWorkflowExample() {
  console.log("=== Complete Payment Workflow ===\n");

  // 1. Admin creates a payment event
  console.log("1️⃣ Creating payment event...");
  const eventResult = await createPaymentEvent({
    name: "Iuran IPL Februari 2025",
    event_type: "IPL",
    description: "February 2025 monthly iuran",
    amount: 170000,
    month: 2,
    year: 2025,
    due_date: "2025-02-28T23:59:59Z",
  });

  if (!eventResult.success) {
    console.error("Failed to create event");
    return;
  }

  const eventId = eventResult.data.id;
  console.log("✅ Event created:", eventId)\n;

  // 2. Admin generates obligations for all units
  console.log("2️⃣ Generating obligations for all units...");
  const oblResult = await generateObligationsForEvent(eventId);

  if (oblResult.success) {
    console.log(`✅ Created ${oblResult.created} obligations\n`);
  }

  // 3. Verify pending obligations
  console.log("3️⃣ Checking pending obligations...");
  const pendingResult = await getAllPendingObligations();

  if (pendingResult.success) {
    console.log(`✅ Total pending: Rp${pendingResult.data.reduce((sum, o) => sum + o.amount, 0)}\n`);
  }

  // 4. Resident makes payment
  console.log("4️⃣ Resident makes payment...");
  // Assume first obligation from pendingResult
  if (pendingResult.data.length > 0) {
    const paymentResult = await recordPayment({
      obligation_id: pendingResult.data[0].id,
      amount: 170000,
      payment_method: "transfer",
      notes: "Payment via bank transfer",
    });

    if (paymentResult.success) {
      console.log("✅ Payment recorded\n");
    }
  }

  // 5. Check payment status
  console.log("5️⃣ Checking payment status...");
  const statusResult = await getUnitPaymentStatus(pendingResult.data[0]?.unit_id);

  if (statusResult.success) {
    console.log(`✅ Payment status: ${statusResult.data.payment_percentage}% complete\n`);
  }

  // 6. Record kas transaction
  console.log("6️⃣ Recording kas deposit...");
  const depositResult = await recordDeposit({
    amount: 170000,
    description: "Payment from unit",
  });

  if (depositResult.success) {
    console.log("✅ Kas updated\n");
  }

  // 7. Get current balance
  console.log("7️⃣ Getting current kas balance...");
  const balanceResult = await getKasBalance();

  if (balanceResult.success) {
    console.log(`✅ Current Balance: Rp${balanceResult.balance}\n`);
  }

  console.log("=== Workflow Complete ===");
}

// Run examples (uncomment to test)
// residentLoginExample();
// adminLoginExample();
// completeWorkflowExample();
