import type { Database } from '~/types/database.types';
import { terbilang } from '~/utils/terbilang';

export const useReceiptService = () => {
  const supabase = useSupabaseClient<Database>();
  const { logAction } = useAuditService();

  /**
   * Get an existing receipt by obligation ID
   */
  async function getReceiptByObligation(obligationId: number) {
    try {
      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .eq('obligation_id', obligationId)
        .maybeSingle();

      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      console.error('❌ Error fetching receipt:', err);
      return { success: false, error: err.message, data: null };
    }
  }

  /**
   * Generate a new receipt for a paid obligation.
   * If one already exists for this obligation, returns it instead.
   */
  async function generateReceipt(params: {
    obligation_id: number;
    unit_id: string;
    unit_code: string;
    owner_name: string;
    amount: number;
    description: string;
  }) {
    try {
      // 1. Check if a receipt already exists for this obligation
      const existing = await getReceiptByObligation(params.obligation_id);
      if (existing.success && existing.data) {
        return { success: true, data: existing.data };
      }

      const created = await $fetch('/api/generate-receipt', {
        method: 'POST',
        body: {
          obligation_id: params.obligation_id,
          unit_id: params.unit_id,
          unit_code: params.unit_code,
          owner_name: params.owner_name,
          amount: params.amount,
          payment_description: params.description,
        },
      });

      if (!created || (created as any).error) {
        throw new Error((created as any)?.error || 'Receipt creation failed.');
      }

      const data = created as any;

      await logAction(
        'GENERATE_RECEIPT',
        { type: 'receipts', id: data.id },
        { receipt_number: data.receipt_number }
      );

      return { success: true, data };
    } catch (err: any) {
      console.error('❌ Error generating receipt:', err);
      return { success: false, error: err.message, data: null };
    }
  }

  return {
    getReceiptByObligation,
    generateReceipt,
  };
};
