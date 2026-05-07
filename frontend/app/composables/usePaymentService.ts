import type { Database } from '~/types/database';

export const usePaymentService = () => {
  const supabase = useSupabaseClient<Database>();
  const authStore = useAuthStore();

  /**
   * Record a payment
   */
  async function recordPayment(paymentData: { obligation_id: string; amount: number; payment_date: string; payment_method: string; notes?: string }) {
    try {
      const { data: obligation, error: oblErr } = await supabase
        .from("payment_obligations")
        .select("*")
        .eq("id", Number(paymentData.obligation_id))
        .single();

      if (oblErr || !obligation) throw new Error("Obligation not found");

      // Mark obligation as paid (status true)
      const { data: updated, error: obStatusErr } = await supabase
        .from("payment_obligations")
        .update({ status: true } as any)
        .eq("id", Number(paymentData.obligation_id))
        .select();

      if (obStatusErr) throw obStatusErr;

      return { success: true, data: updated?.[0] };
    } catch (err: any) {
      console.error("❌ Error recording payment:", err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Get payment status for a unit
   */
  async function getUnitPaymentStatus(unitId: string) {
    try {
      const { data: obligations, error: oblErr } = await supabase
        .from("payment_obligations")
        .select(`
          id, 
          amount, 
          status, 
          year, 
          month_index, 
          event_id, 
          unit_id,
          event:payment_events(id, display_name, key),
          unit:units(category)
        `)
        .eq("unit_id", unitId);

      if (oblErr) throw oblErr;

      const paymentStatus = obligations.map((obl: any) => {
        const isPaid = obl.status === true;
        let baseAmount = obl.amount;
        if (baseAmount === null || baseAmount === 0) {
          const category = obl.unit?.category || 'Rumah';
          baseAmount = category === 'Ruko' ? 250000 : 170000;
        }
        
        return {
          obligation_id: obl.id,
          event_id: obl.event_id || obl.event?.id,
          event_key: obl.event?.key,
          event_name: obl.event?.display_name || obl.event?.key || 'Payment',
          year: obl.year,
          month: obl.month_index,
          amount_due: baseAmount,
          amount_paid: isPaid ? baseAmount : 0,
          amount_remaining: isPaid ? 0 : baseAmount,
          status: isPaid,
          payment_percentage: isPaid ? 100 : 0,
        };
      });

      const totalDue = paymentStatus.reduce((sum, p) => sum + p.amount_due, 0);
      const totalPaid = paymentStatus.reduce((sum, p) => sum + p.amount_paid, 0);

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      const currentDueTotal = paymentStatus
        .filter((p) => {
          if (p.status) return false;
          return (p.year < currentYear) || (p.year === currentYear && (p.month <= currentMonth || !p.month));
        })
        .reduce((sum, p) => sum + p.amount_remaining, 0);

      return {
        success: true,
        data: {
          unit_id: unitId,
          total_due: totalDue,
          total_paid: totalPaid,
          total_remaining: totalDue - totalPaid,
          current_due_total: currentDueTotal,
          payment_percentage: totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0,
          obligations: paymentStatus,
        },
      };
    } catch (err: any) {
      console.error("❌ Error getting status:", err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Get unified history for a resident
   */
  async function getUnitFullHistory(unitId: string) {
    try {
      const { data: pt, error: ptErr } = await supabase.from("payment_transactions").select('*, event:payment_events(display_name, key)').eq("unit_id", unitId);
      const { data: t, error: tErr } = await supabase.from("transactions").select("*, category:transaction_categories(name)").or(`type.eq.withdrawal,unit_id.eq.${unitId}`);

      if (ptErr || tErr) throw (ptErr || tErr);

      const unified = [
        ...(pt || []).map(item => ({
          id: item.id,
          date: item.created_at,
          amount: item.amount,
          description: item.event?.display_name || item.event?.key || 'Payment',
          type: 'ipl_thr',
          category_name: item.event?.key === 'thr' ? 'THR Payment' : 'Monthly Payment',
          status: 'Completed'
        })),
        ...(t || []).filter(item => {
          const isCorrection = (item.category?.name || '').toLowerCase().includes('correction');
          if (isCorrection) return false;
          if (item.type === "withdrawal") return true;
          return item.type === "deposit" && item.unit_id === unitId;
        }).map(item => ({
          id: item.id,
          date: item.transaction_date,
          amount: item.amount,
          description: item.description,
          type: item.type,
          category_name: item.category?.name || 'Social',
          status: 'Completed'
        }))
      ];

      unified.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
      return { success: true, data: unified.slice(0, 100) };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  return {
    recordPayment,
    getUnitPaymentStatus,
    getUnitFullHistory
  };
};
