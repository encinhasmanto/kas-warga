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
export async function recordDeposit(depositData) {
  try {
    const session = getCurrentSession();

    if (session.type !== "admin") {
      return {
        success: false,
        error: "Only admins can record deposits",
      };
    }

    const newTransaction = {
      type: "deposit",
      amount: depositData.amount,
      category_id: depositData.category_id,
      description: depositData.description || "",
      transaction_date:
        depositData.transaction_date || new Date().toISOString(),
      recorded_by: session.id,
      created_at: new Date().toISOString(),
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

    console.log("✅ Deposit recorded:", depositData.amount);
    return {
      success: true,
      data: data[0],
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
 *   - category_id: expense category ID (required for tracking expenses)
 *   - description: description of withdrawal
 *   - transaction_date: date (ISO string)
 *   - recipient: who received the money
 * @returns {Promise<Object>} { success: boolean, data: transaction, error: string }
 */
export async function recordWithdrawal(withdrawalData) {
  try {
    const session = getCurrentSession();

    if (session.type !== "admin") {
      return {
        success: false,
        error: "Only admins can record withdrawals",
      };
    }

    if (!withdrawalData.category_id) {
      return {
        success: false,
        error: "Expense category is required for withdrawals",
      };
    }

    const newTransaction = {
      type: "withdrawal",
      amount: -Math.abs(withdrawalData.amount), // Store as negative
      category_id: withdrawalData.category_id,
      description: withdrawalData.description || "",
      recipient: withdrawalData.recipient,
      transaction_date:
        withdrawalData.transaction_date || new Date().toISOString(),
      recorded_by: session.id,
      created_at: new Date().toISOString(),
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
        category:expense_categories(id, name, description)
      `,
      )
      .order("transaction_date", { ascending: false });

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
        category:expense_categories(id, name)
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
