import type { Database } from '~/types/database';

export const useExpenseService = () => {
  const supabase = useSupabaseClient<Database>();
  const authStore = useAuthStore();

  const isAdmin = computed(() => authStore.isAdmin || authStore.isSuperAdmin);

  /**
   * Get all transaction categories (income or expense)
   */
  async function getTransactionCategories(type: 'income' | 'expense' = 'expense') {
    try {
      const { data, error } = await supabase
        .from("transaction_categories")
        .select("*")
        .eq("category_type", type)
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (err: any) {
      console.error("❌ Error fetching categories:", err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Generate expense report by category for a period
   */
  async function generateExpenseReport(filters: { start_date?: string; end_date?: string } = {}) {
    try {
      if (!isAdmin.value) {
        return { success: false, error: "Only admins can generate expense reports" };
      }

      let query = supabase
        .from("transactions")
        .select(`
          *,
          category:transaction_categories(id, name, code)
        `)
        .eq("type", "withdrawal");

      if (filters.start_date && filters.end_date) {
        query = query.gte("transaction_date", filters.start_date).lte("transaction_date", filters.end_date);
      }

      const { data, error } = await query.order("transaction_date", { ascending: true });

      if (error) throw error;

      // Aggregate data
      const byCategory: any = {};
      let totalExpense = 0;

      data.forEach((tx: any) => {
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
          recipient: (tx as any).recipient,
        });

        totalExpense += amount;
      });

      return {
        success: true,
        data: {
          period: filters,
          total_expense: totalExpense,
          by_category: byCategory,
          transaction_count: data.length,
        },
      };
    } catch (err: any) {
      console.error("❌ Error generating expense report:", err);
      return { success: false, error: err.message };
    }
  }

  return {
    getTransactionCategories,
    generateExpenseReport
  };
};
