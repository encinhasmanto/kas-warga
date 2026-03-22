/**
 * Expense Service
 * Handles expense categories and generates expense reports
 */

import { supabase, getCurrentSession } from "./supabaseClient.js";

/**
 * Get all expense categories
 * @returns {Promise<Object>} { success: boolean, data: categories, error: string }
 */
export async function getExpenseCategories() {
  try {
    const { data, error } = await supabase
      .from("expense_categories")
      .select("*")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (err) {
    console.error("❌ Error fetching expense categories:", err);
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Get single expense category by ID
 * @param {string} categoryId - Category ID
 * @returns {Promise<Object>} { success: boolean, data: category, error: string }
 */
export async function getExpenseCategoryById(categoryId) {
  try {
    const { data, error } = await supabase
      .from("expense_categories")
      .select("*")
      .eq("id", categoryId)
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (err) {
    console.error("❌ Error fetching expense category:", err);
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Create new expense category (admin only)
 * @param {Object} categoryData
 *   - name: category name
 *   - description: category description
 *   - code: optional category code
 * @returns {Promise<Object>} { success: boolean, data: category, error: string }
 */
export async function createExpenseCategory(categoryData) {
  try {
    const session = getCurrentSession();

    if (session.type !== "admin") {
      return {
        success: false,
        error: "Only admins can create categories",
      };
    }

    const newCategory = {
      name: categoryData.name,
      description: categoryData.description,
      code: categoryData.code,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("expense_categories")
      .insert([newCategory])
      .select();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    console.log("✅ Expense category created:", categoryData.name);
    return {
      success: true,
      data: data[0],
    };
  } catch (err) {
    console.error("❌ Error creating expense category:", err);
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Update expense category (admin only)
 * @param {string} categoryId - Category ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} { success: boolean, error: string }
 */
export async function updateExpenseCategory(categoryId, updates) {
  try {
    const session = getCurrentSession();

    if (session.type !== "admin") {
      return {
        success: false,
        error: "Only admins can update categories",
      };
    }

    const { error } = await supabase
      .from("expense_categories")
      .update(updates)
      .eq("id", categoryId);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    console.log("✅ Expense category updated");
    return { success: true };
  } catch (err) {
    console.error("❌ Error updating category:", err);
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Generate expense report by category for a period
 * @param {Object} filters
 *   - start_date: start date (ISO string)
 *   - end_date: end date (ISO string)
 * @returns {Promise<Object>} { success: boolean, data: report, error: string }
 */
export async function generateExpenseReport(filters = {}) {
  try {
    const session = getCurrentSession();

    if (session.type !== "admin") {
      return {
        success: false,
        error: "Only admins can generate expense reports",
      };
    }

    // Get all withdrawal transactions in the period
    let query = supabase
      .from("transactions")
      .select(
        `
        *,
        category:expense_categories(id, name, code)
      `,
      )
      .eq("type", "withdrawal");

    if (filters.start_date && filters.end_date) {
      query = query
        .gte("transaction_date", filters.start_date)
        .lte("transaction_date", filters.end_date);
    }

    const { data, error } = await query.order("transaction_date", {
      ascending: true,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Aggregate data
    const byCategory = {};
    let totalExpense = 0;

    data.forEach((tx) => {
      const categoryName = tx.category?.name || "Uncategorized";
      const categoryId = tx.category?.id;

      if (!byCategory[categoryName]) {
        byCategory[categoryName] = {
          category_id: categoryId,
          total: 0,
          transactions: [],
          count: 0,
        };
      }

      const amount = Math.abs(tx.amount);
      byCategory[categoryName].total += amount;
      byCategory[categoryName].count++;
      byCategory[categoryName].transactions.push({
        date: tx.transaction_date,
        amount,
        description: tx.description,
        recipient: tx.recipient,
      });

      totalExpense += amount;
    });

    return {
      success: true,
      data: {
        period: {
          start_date: filters.start_date,
          end_date: filters.end_date,
        },
        total_expense: totalExpense,
        by_category: byCategory,
        transaction_count: data.length,
      },
    };
  } catch (err) {
    console.error("❌ Error generating expense report:", err);
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Generate monthly expense summary
 * @param {number} month - Month number (1-12)
 * @param {number} year - Year
 * @returns {Promise<Object>} { success: boolean, data: summary, error: string }
 */
export async function generateMonthlyExpenseSummary(month, year) {
  try {
    const session = getCurrentSession();

    if (session.type !== "admin") {
      return {
        success: false,
        error: "Only admins can generate expense summaries",
      };
    }

    // Create date range for the month
    const startDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

    return generateExpenseReport({
      start_date: startDate,
      end_date: endDate,
    });
  } catch (err) {
    console.error("❌ Error generating monthly summary:", err);
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Get top expense categories by amount
 * @param {Object} filters - Optional date range filters
 * @param {number} limit - Number of top categories to return (default: 10)
 * @returns {Promise<Object>} { success: boolean, data: topCategories, error: string }
 */
export async function getTopExpenseCategories(filters = {}, limit = 10) {
  try {
    let query = supabase
      .from("transactions")
      .select(
        `
        amount,
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
    const categoryTotals = {};
    data.forEach((tx) => {
      const categoryName = tx.category?.name || "Uncategorized";
      categoryTotals[categoryName] =
        (categoryTotals[categoryName] || 0) + Math.abs(tx.amount);
    });

    // Sort and limit
    const topCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([name, total]) => ({
        category: name,
        total,
      }));

    return {
      success: true,
      data: topCategories,
    };
  } catch (err) {
    console.error("❌ Error getting top expense categories:", err);
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Compare expense categories between two periods
 * @param {string} period1Start - First period start (ISO string)
 * @param {string} period1End - First period end (ISO string)
 * @param {string} period2Start - Second period start (ISO string)
 * @param {string} period2End - Second period end (ISO string)
 * @returns {Promise<Object>} { success: boolean, data: comparison, error: string }
 */
export async function compareExpensePeriods(
  period1Start,
  period1End,
  period2Start,
  period2End,
) {
  try {
    const session = getCurrentSession();

    if (session.type !== "admin") {
      return {
        success: false,
        error: "Only admins can compare periods",
      };
    }

    // Get first period
    const report1 = await generateExpenseReport({
      start_date: period1Start,
      end_date: period1End,
    });

    // Get second period
    const report2 = await generateExpenseReport({
      start_date: period2Start,
      end_date: period2End,
    });

    if (!report1.success || !report2.success) {
      return {
        success: false,
        error: "Error generating comparison reports",
      };
    }

    // Compare
    const comparison = {
      period_1: {
        range: { start: period1Start, end: period1End },
        total_expense: report1.data.total_expense,
      },
      period_2: {
        range: { start: period2Start, end: period2End },
        total_expense: report2.data.total_expense,
      },
      difference: report2.data.total_expense - report1.data.total_expense,
      percentage_change:
        ((report2.data.total_expense - report1.data.total_expense) /
          report1.data.total_expense) *
        100,
    };

    return {
      success: true,
      data: comparison,
    };
  } catch (err) {
    console.error("❌ Error comparing periods:", err);
    return {
      success: false,
      error: err.message,
    };
  }
}
