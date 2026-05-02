import type { Database } from '~/types/database';

export const useEventService = () => {
  const supabase = useSupabaseClient<Database>();
  const authStore = useAuthStore();

  const isAdmin = computed(() => authStore.isAdmin || authStore.isSuperAdmin);

  /**
   * Create a new payment event
   */
  async function createPaymentEvent(eventData: any) {
    try {
      if (!isAdmin.value) {
        return { success: false, error: "Only admins can create payment events" };
      }

      const newEvent = {
        name: eventData.name,
        event_type: eventData.event_type,
        description: eventData.description,
        amount: eventData.amount,
        month: eventData.month,
        year: eventData.year,
        due_date: eventData.due_date,
        created_by: authStore.currentUser?.id,
        created_at: new Date().toISOString(),
        is_active: true,
      };

      const { data, error } = await supabase
        .from("payment_events")
        .insert([newEvent])
        .select();

      if (error) throw error;

      return { success: true, data: data[0] };
    } catch (err: any) {
      console.error("❌ Error creating payment event:", err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Get all active payment events
   */
  async function getPaymentEvents(filters: any = {}) {
    try {
      let query = supabase
        .from("payment_events")
        .select("*")
        .eq("is_active", true)
        .order("year", { ascending: false })
        .order("month", { ascending: false });

      if (filters.eventType) query = query.eq("event_type", filters.eventType);
      if (filters.year) query = query.eq("year", filters.year);

      const { data, error } = await query;
      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (err: any) {
      console.error("❌ Error fetching payment events:", err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Get payment event by ID
   */
  async function getPaymentEventById(eventId: string) {
    try {
      const { data, error } = await supabase
        .from("payment_events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      console.error("❌ Error fetching payment event:", err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Update payment event
   */
  async function updatePaymentEvent(eventId: string, updates: any) {
    try {
      if (!isAdmin.value) {
        return { success: false, error: "Only admins can update payment events" };
      }

      const { data, error } = await supabase
        .from("payment_events")
        .update(updates)
        .eq("id", eventId)
        .select();

      if (error) throw error;
      return { success: true, data: data[0] };
    } catch (err: any) {
      console.error("❌ Error updating payment event:", err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Deactivate payment event
   */
  async function deactivatePaymentEvent(eventId: string) {
    try {
      if (!isAdmin.value) {
        return { success: false, error: "Only admins can deactivate events" };
      }

      const { error } = await supabase
        .from("payment_events")
        .update({ is_active: false })
        .eq("id", eventId);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error("❌ Error deactivating payment event:", err);
      return { success: false, error: err.message };
    }
  }

  return {
    createPaymentEvent,
    getPaymentEvents,
    getPaymentEventById,
    updatePaymentEvent,
    deactivatePaymentEvent
  };
};
