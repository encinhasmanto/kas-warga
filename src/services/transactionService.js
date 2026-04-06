/**
 * Transaction Service
 * Handles recording deposits/withdrawals and managing kas (balance) with categorized expenses
 */

import { supabase, getCurrentSession } from "./supabaseClient.js";

/**
 * Record a deposit (kas masuk - uang pemasukan)
 * @param {Object} depositData
 *   - amount: deposit amount
 *   - category_id: optional expense category ID
 *   - description: description of deposit
 *   - transaction_date: date (ISO string)
 * @returns {Promise<Object>} { success: boolean, data: transaction, error: string }
 */
// OLD ONE
// export async function recordDeposit(depositData) {
//   try {
//     const session = getCurrentSession();
//     if (session.type !== "admin") {
//       return {
//         success: false,
//         error: "Only admins can record transactions",
//       };
//     }

//     let catId = depositData.category_id;
//     if (catId === "correction") {
//       // Pass 'deposit' so it creates an Income category!
//       catId = await getOrCreateCorrectionCategory("deposit");
//     }

//     const newTransaction = {
//       type: "deposit",
//       transaction_type: "deposit", // Required for trigger
//       amount: depositData.amount,
//       category_id: catId,
//       // description: depositData.description || "",
//       description: depositData.description.replace(/\[.*?\]\s*/g, '').trim(),
//       transaction_date:
//         depositData.transaction_date || new Date().toISOString(),
//       // recorded_by: session.id,
//     };

//     // Update payment_obligations status to paid if unit_id and month_index are provided
//     if (depositData.unit_id && depositData.month_index) {
//       await supabase
//         .from('payment_obligations')
//         .update({
//           status: 'paid', // Mark as paid
//           updated_at: new Date().toISOString()
//     })
//     .eq('unit_id', depositData.unit_id)
//     .eq('month_index', depositData.month_index)
//     .eq('year', new Date().getFullYear()); // Match current year
// }

//     const { data, error } = await supabase
//       .from("transactions")
//       .insert([newTransaction])
//       .select();

//     if (error) {
//       return {
//         success: false,
//         error: error.message,
//       };
//     }

//     console.log("✅ Deposit recorded:", depositData.amount);
//     return {
//       success: true,
//       data: data[0],
//     };
//   } catch (err) {
//     console.error("❌ Error recording deposit:", err);
//     return {
//       success: false,
//       error: err.message,
//     };
//   }
// }

// OLD NEW ONE
// export async function recordDeposit(depositData) {
//   try {
//     const session = getCurrentSession();

//     let catId = depositData.category_id;
//     if (catId === "correction") {
//       catId = await getOrCreateCorrectionCategory("deposit");
//     }

//     // 1. Create the Transaction
//     const newTransaction = {
//       type: "deposit",
//       transaction_type: "deposit",
//       amount: depositData.amount,
//       category_id: catId,
//       description: depositData.description || "",
//       transaction_date: depositData.transaction_date || new Date().toISOString(),
//       unit_id: depositData.unit_id // Ensure this is being passed
//     };

//     const { data: txData, error: txError } = await supabase
//       .from("transactions")
//       .insert([newTransaction])
//       .select()
//       .single();

//     if (txError) throw txError;

//     // 2. MVP CRITICAL: If this is a monthly payment, update the tracker!
//     if (depositData.unit_id && depositData.month_index) {
//       await supabase
//         .from('payment_obligations')
//         .update({ status: 'paid' })
//         .eq('unit_id', depositData.unit_id)
//         .eq('month_index', depositData.month_index)
//         .eq('year', 2026)
//         .eq('event_id', 2); // 2 is the ID for IPL
//     }

//     return { success: true, data: txData };
//   } catch (err) {
//     console.error("❌ Error recording deposit:", err);
//     return { success: false, error: err.message };
//   }
// }
// NEW ONE
export async function recordDeposit(depositData) {
  try {
    const session = getCurrentSession();
    if (!session || !session.isSuperAdmin) {
      console.warn("❌ Permission Denied: User is not a Super Admin", {
        role: session?.role,
        isSuperAdmin: session?.isSuperAdmin,
      });
      return { success: false, error: "Only Super Admins can record deposits" };
    }

    let catId = depositData.category_id;
    if (catId === "correction") {
      catId = await getOrCreateCorrectionCategory("deposit");
    }

    // 1. Create the Transaction Record
    const { data: tx, error: txErr } = await supabase
      .from("transactions")
      .insert([
        {
          type: "deposit",
          transaction_type: "deposit",
          amount: depositData.amount,
          category_id: catId,
          description: depositData.description || "",
          transaction_date: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (txErr) throw txErr;

    // Success
    console.log("✅ Deposit recorded:", depositData.amount);
    return {
      success: true,
      data: tx,
    };
  } catch (err) {
    console.error("❌ Error recording deposit:", err);
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Record a withdrawal (kas keluar - pengeluaran)
 * @param {Object} withdrawalData
 *   - amount: withdrawal amount
 *   - category_id: expense category ID (required for tracking expenses, can be 'correction')
 *   - description: description of withdrawal
 *   - transaction_date: date (ISO string)
 *   - recipient: who received the money
 * @returns {Promise<Object>} { success: boolean, data: transaction, error: string }
 */
export async function recordWithdrawal(withdrawalData) {
  try {
    const session = getCurrentSession();
    if (!session || !session.isSuperAdmin) {
      console.warn("❌ Permission Denied: User is not a Super Admin", {
        role: session?.role,
        isSuperAdmin: session?.isSuperAdmin,
      });
      return {
        success: false,
        error: "Only Super Admins can record withdrawals",
      };
    }

    if (!withdrawalData.category_id) {
      return {
        success: false,
        error: "Expense category is required for withdrawals",
      };
    }

    let catId = withdrawalData.category_id;
    if (catId === "correction") {
      // Pass 'withdrawal' so it creates an Expense category!
      catId = await getOrCreateCorrectionCategory("withdrawal");
    }

    const newTransaction = {
      type: "withdrawal",
      transaction_type: "withdrawal", // Required for trigger
      amount: -Math.abs(withdrawalData.amount), // Store as negative
      category_id: catId,
      // description: withdrawalData.description.replace(/\[.*?\]\s*/g, '').trim(),
      description: withdrawalData.description || "",
      transaction_date:
        withdrawalData.transaction_date || new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("transactions")
      .insert([newTransaction])
      .select();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    console.log("✅ Withdrawal recorded:", withdrawalData.amount);
    return {
      success: true,
      data: data[0],
    };
  } catch (err) {
    console.error("❌ Error recording withdrawal:", err);
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Get current kas balance (sum of all transactions)
 * @returns {Promise<Object>} { success: boolean, balance: number, error: string }
 */
export async function getKasBalance() {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select("amount");

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    const balance = data.reduce((sum, tx) => sum + (tx.amount || 0), 0);

    return {
      success: true,
      balance,
    };
  } catch (err) {
    console.error("❌ Error calculating kas balance:", err);
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Get all transactions with optional filtering
 * @param {Object} filters
 *   - type: "deposit" or "withdrawal"
 *   - category_id: filter by expense category
 *   - start_date: start date (ISO string)
 *   - end_date: end date (ISO string)
 *   - limit: number of recent transactions
 * @returns {Promise<Object>} { success: boolean, data: transactions, error: string }
 */
export async function getTransactions(filters = {}) {
  try {
    let query = supabase
      .from("transactions")
      .select(
        `
        *,
        category:transaction_categories(id, name, description)
      `,
      )
      .order("transaction_date", { ascending: false })
      .limit(100); // Added default limit

    if (filters.type) {
      query = query.eq("type", filters.type);
    }

    if (filters.category_id) {
      query = query.eq("category_id", filters.category_id);
    }

    if (filters.start_date && filters.end_date) {
      query = query
        .gte("transaction_date", filters.start_date)
        .lte("transaction_date", filters.end_date);
    }

    let { data, error } = await query;

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Apply limit if specified
    if (filters.limit) {
      data = data.slice(0, filters.limit);
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (err) {
    console.error("❌ Error fetching transactions:", err);
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Get kas balance by date range
 * @param {string} startDate - Start date (ISO string)
 * @param {string} endDate - End date (ISO string)
 * @returns {Promise<Object>} { success: boolean, balance: number, deposits: number, withdrawals: number, error: string }
 */
export async function getKasBalanceByDateRange(startDate, endDate) {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select("amount, type")
      .gte("transaction_date", startDate)
      .lte("transaction_date", endDate);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    const balance = data.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    const deposits = data
      .filter((tx) => tx.type === "deposit")
      .reduce((sum, tx) => sum + tx.amount, 0);
    const withdrawals = data
      .filter((tx) => tx.type === "withdrawal")
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    return {
      success: true,
      balance,
      deposits,
      withdrawals,
    };
  } catch (err) {
    console.error("❌ Error fetching balance by date range:", err);
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Get expense summary by category
 * @param {Object} filters - Optional date range filters
 * @returns {Promise<Object>} { success: boolean, data: categorizedExpenses, error: string }
 */
export async function getExpenseSummaryByCategory(filters = {}) {
  try {
    let query = supabase
      .from("transactions")
      .select(
        `
        amount,
        type,
        category:transaction_categories(id, name)
      `,
      )
      .eq("type", "withdrawal");

    if (filters.start_date && filters.end_date) {
      query = query
        .gte("transaction_date", filters.start_date)
        .lte("transaction_date", filters.end_date);
    }

    const { data, error } = await query;

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Aggregate by category
    const summary = {};
    data.forEach((tx) => {
      const categoryName = tx.category?.name || "Uncategorized";
      if (!summary[categoryName]) {
        summary[categoryName] = { total: 0, count: 0 };
      }
      summary[categoryName].total += Math.abs(tx.amount);
      summary[categoryName].count++;
    });

    return {
      success: true,
      data: summary,
    };
  } catch (err) {
    console.error("❌ Error getting expense summary:", err);
    return {
      success: false,
      error: err.message,
    };
  }
}
/**
 * Get monthly performance summary for a specific year
 * @param {number} year
 * @returns {Promise<Object>} { success, data: Array of { month, income, expense } }
 */
export async function getMonthlyPerformance(year) {
  try {
    const startOfYear = new Date(year, 0, 1).toISOString();
    const endOfYear = new Date(year, 11, 31, 23, 59, 59).toISOString();

    const { data, error } = await supabase
      .from("transactions")
      .select("amount, type, transaction_date")
      .gte("transaction_date", startOfYear)
      .lte("transaction_date", endOfYear);

    if (error) throw error;

    const summary = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      income: 0,
      expense: 0,
    }));

    data.forEach((tx) => {
      const month = new Date(tx.transaction_date).getMonth();
      if (tx.type === "deposit") {
        summary[month].income += tx.amount;
      } else if (tx.type === "withdrawal") {
        summary[month].expense += Math.abs(tx.amount);
      }
    });

    return { success: true, data: summary };
  } catch (err) {
    console.error("❌ Error getting monthly performance:", err);
    return { success: false, error: err.message };
  }
}

// OLD ONE
// /**
//  * Get or create the 'Correction' category
//  * @returns {Promise<string|null>} Category ID
//  */
// async function getOrCreateCorrectionCategory() {
//   try {
//     const { data: existing } = await supabase
//       .from("transaction_categories")
//       .select("id")
//       .eq("name", "Correction")
//       .maybeSingle();

//     if (existing) return existing.id;

//     const { data: created, error } = await supabase
//       .from("transaction_categories")
//       .insert([
//         {
//           name: "Correction",
//           description: "Financial adjustments and corrections",
//           category_type: "expense",
//           is_active: true,
//           created_at: new Date().toISOString(),
//         },
//       ])
//       .select()
//       .single();

//     if (error) throw error;
//     return created?.id || null;
//   } catch (err) {
//     console.error("❌ Error ensuring Correction category:", err);
//     return null;
//   }
// }

// NEW ONE
/**
 * Get or create a 'Correction' category dynamically based on transaction type
 * @param {string} type - 'deposit' or 'withdrawal'
 * @returns {Promise<string|null>} Category ID
 */
async function getOrCreateCorrectionCategory(type = "expense") {
  // 1. Determine the right name and DB type
  const categoryName =
    type === "deposit" ? "Income Correction" : "Expense Correction";
  const categoryType = type === "deposit" ? "income" : "expense";

  try {
    // 2. Check if this specific correction category exists
    const { data: existing } = await supabase
      .from("transaction_categories")
      .select("id")
      .eq("name", categoryName)
      .maybeSingle();

    if (existing) return existing.id;

    // 3. Create it if it doesn't exist!
    const { data: created, error } = await supabase
      .from("transaction_categories")
      .insert([
        {
          name: categoryName,
          description: `Financial adjustments for ${categoryType}`,
          category_type: categoryType, // Now it's dynamic!
          is_active: true,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return created.id;
  } catch (err) {
    console.error("❌ Error creating correction category:", err);
    return null;
  }
}
