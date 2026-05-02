import type { Database } from '~/types/database';

export const useObligationService = () => {
  const supabase = useSupabaseClient<Database>();
  const authStore = useAuthStore();

  const isAdmin = computed(() => authStore.isAdmin || authStore.isSuperAdmin);

  /**
   * Create obligation for a unit
   */
  async function createObligation(obligationData: any) {
    try {
      if (!isAdmin.value) throw new Error("Only admins can create obligations");

      let unitId = obligationData.unit_id;
      if (!unitId && obligationData.unit_code) {
        const { data: unit } = await supabase.from("units").select("id").eq("code", obligationData.unit_code).single();
        if (!unit) throw new Error("Unit not found");
        unitId = unit.id;
      }

      const { data, error } = await supabase
        .from("payment_obligations")
        .insert([{
          event_id: obligationData.event_id,
          unit_id: unitId,
          amount: obligationData.amount,
          due_date: obligationData.due_date,
          status: "pending",
          created_at: new Date().toISOString(),
        }])
        .select();

      if (error) throw error;
      return { success: true, data: data[0] };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Get obligations for a unit
   */
  async function getUnitObligations(unitId: string, filters: any = {}) {
    try {
      let query = supabase
        .from("payment_obligations")
        .select("*, event:payment_events(*)")
        .eq("unit_id", unitId)
        .order("created_at", { ascending: false });

      if (filters.status) query = query.eq("status", filters.status);

      const { data, error } = await query;
      if (error) throw error;

      let filtered = data;
      if (filters.year) filtered = data.filter((o: any) => o.event && o.event.year === filters.year);

      return { success: true, data: filtered };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Update obligation status
   */
  async function updateObligationStatus(obligationId: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from("payment_obligations")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", obligationId);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  return {
    createObligation,
    getUnitObligations,
    updateObligationStatus
  };
};
