import type { Database } from '~/types/database.types';

export const useFeedbackService = () => {
  const supabase = useSupabaseClient<Database>();
  const authStore = useAuthStore();
  const { logAction } = useAuditService();

  /**
   * Submit new feedback (any authenticated user)
   */
  async function submitFeedback(feedbackData: {
    type: 'issue' | 'question' | 'suggestion';
    subject: string;
    message: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .insert({
          type: feedbackData.type,
          subject: feedbackData.subject,
          message: feedbackData.message,
          submitted_by_unit_id: authStore.unitId ?? null,
          submitted_by_name: authStore.displayName ?? null,
        })
        .select()
        .single();

      if (error) throw error;

      await logAction('SUBMIT_FEEDBACK', { type: 'feedback', id: data.id }, {
        feedback_type: data.type,
      });

      return { success: true, data };
    } catch (err: any) {
      console.error('❌ Error submitting feedback:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Get feedback list.
   * Admins see all, residents see only their own submissions.
   */
  async function getFeedbackList() {
    try {
      let query = supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (!authStore.isAdmin) {
        // Filter by unit_id for non-admin users
        query = query.eq('submitted_by_unit_id', authStore.unitId as string);
      }

      const { data, error } = await query;
      if (error) throw error;

      return { success: true, data: data ?? [] };
    } catch (err: any) {
      console.error('❌ Error fetching feedback:', err);
      return { success: false, error: err.message, data: [] };
    }
  }

  /**
   * Update feedback status and admin notes (Admin only)
   */
  async function updateFeedbackStatus(
    id: string,
    status: string,
    adminNotes?: string
  ) {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .update({
          status,
          admin_notes: adminNotes ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await logAction('UPDATE_FEEDBACK_STATUS', { type: 'feedback', id: data.id }, {
        status,
      });

      return { success: true, data };
    } catch (err: any) {
      console.error('❌ Error updating feedback:', err);
      return { success: false, error: err.message };
    }
  }

  return {
    submitFeedback,
    getFeedbackList,
    updateFeedbackStatus,
  };
};
