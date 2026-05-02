import type { Database } from '~/types/database';

export const useTransactionService = () => {
  const supabase = useSupabaseClient<Database>();
  const authStore = useAuthStore();
  const { logAction } = useAuditService();

  /**
   * Record a deposit (kas masuk)
   */
  async function recordDeposit(depositData: { amount: number; category_id?: string; description?: string; unit_id?: string }) {
    try {
      if (!authStore.isLoggedIn || !authStore.isSuperAdmin) {
        return { success: false, error: "Only Super Admins can record deposits" };
      }

      let catId = depositData.category_id;
      if (catId === "correction") {
        catId = await getOrCreateCorrectionCategory("deposit");
      }

      const { data: tx, error: txErr } = await supabase
        .from("transactions")
        .insert([
          {
            type: "deposit",
            transaction_type: "deposit",
            amount: depositData.amount,
            category_id: catId || null,
            description: depositData.description || "",
            transaction_date: new Date().toISOString(),
            unit_id: depositData.unit_id || null,
          },
        ])
        .select()
        .single();

      if (txErr) throw txErr;

      await logAction('RECORD_DEPOSIT', { type: 'transactions', id: (tx as any).id }, {
        amount: depositData.amount,
        unit_id: depositData.unit_id,
        description: depositData.description
      });

      return { success: true, data: tx };
    } catch (err: any) {
      console.error("❌ Error recording deposit:", err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Record a withdrawal (kas keluar)
   */
  async function recordWithdrawal(withdrawalData: { amount: number; category_id: string; description?: string; transaction_date?: string; recipient?: string; unit_id?: string }) {
    try {
      if (!authStore.isLoggedIn || !authStore.isSuperAdmin) {
        return { success: false, error: "Only Super Admins can record withdrawals" };
      }

      if (!withdrawalData.category_id) {
        return { success: false, error: "Expense category is required for withdrawals" };
      }

      let catId = withdrawalData.category_id;
      if (catId === "correction") {
        catId = await getOrCreateCorrectionCategory("withdrawal");
      }

      const { data: txs, error: txErr } = await supabase
        .from("transactions")
        .insert([
          {
            type: "withdrawal",
            transaction_type: "withdrawal",
            amount: -Math.abs(withdrawalData.amount),
            category_id: catId || null,
            description: withdrawalData.description || "",
            transaction_date: withdrawalData.transaction_date || new Date().toISOString(),
            unit_id: withdrawalData.unit_id || null,
          }
        ])
        .select();

      if (txErr) throw txErr;

      const tx = txs[0];
      await logAction('RECORD_WITHDRAWAL', { type: 'transactions', id: tx.id }, {
        amount: withdrawalData.amount,
        recipient: withdrawalData.recipient,
        description: withdrawalData.description
      });

      return { success: true, data: tx };
    } catch (err: any) {
      console.error("❌ Error recording withdrawal:", err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Get current kas balance
   */
  async function getKasBalance(unitId: string | null = null) {
    try {
      const { data, error } = await supabase.rpc("get_kas_balance", {
        p_unit_id: unitId as any, // RPC might expect UUID
      });

      if (error) throw error;
      const balance = (data as any)?.[0]?.balance || 0;

      return { success: true, balance: Number(balance) };
    } catch (err: any) {
      console.error("❌ Error calculating kas balance:", err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Get all transactions with optional filtering
   */
  async function getTransactions(filters: any = {}) {
    try {
      let query = supabase
        .from("transactions")
        .select(`
          *,
          category:transaction_categories(id, name, description),
          unit:units(id, code)
        `)
        .order("transaction_date", { ascending: false })
        .limit(filters.limit || 100);

      if (filters.type) query = query.eq("type", filters.type);
      if (filters.category_id) query = query.eq("category_id", filters.category_id);

      if (filters.start_date && filters.end_date) {
        query = query.gte("transaction_date", filters.start_date).lte("transaction_date", filters.end_date);
      }

      const { data, error } = await query;
      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (err: any) {
      console.error("❌ Error fetching transactions:", err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Get or create a 'Correction' category
   */
  async function getOrCreateCorrectionCategory(type: "deposit" | "withdrawal" = "withdrawal") {
    const categoryName = type === "deposit" ? "Income Correction" : "Expense Correction";
    const categoryType = type === "deposit" ? "income" : "expense";

    try {
      const { data: existing } = await supabase
        .from("transaction_categories")
        .select("id")
        .eq("name", categoryName)
        .maybeSingle();

      if (existing) return existing.id;

      const { data: created, error } = await supabase
        .from("transaction_categories")
        .insert([
          {
            name: categoryName,
            description: `Financial adjustments for ${categoryType}`,
            category_type: categoryType,
            is_active: true,
            created_at: new Date().toISOString(),
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return (created as any).id;
    } catch (err) {
      console.error("❌ Error creating correction category:", err);
      return null;
    }
  }

  return {
    recordDeposit,
    recordWithdrawal,
    getKasBalance,
    getTransactions,
    getOrCreateCorrectionCategory
  };
};
