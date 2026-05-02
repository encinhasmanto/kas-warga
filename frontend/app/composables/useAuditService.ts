import type { Database } from '~/types/database';

export const useAuditService = () => {
  const supabase = useSupabaseClient<Database>();
  const authStore = useAuthStore();

  /**
   * Log an action to the audit_logs table
   */
  async function logAction(action: string, entityInfo: { type?: string; id?: string } = {}, details: any = {}) {
    try {
      const user = authStore.currentUser;
      
      // If impersonating, the actor is the ORIGINAL admin, but we note the impersonation
      const actor = authStore.originalAdminSession || user;
      
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          actor_id: actor?.id,
          actor_name: actor?.displayName || (actor as any)?.username || 'Unknown',
          actor_type: (actor as any)?.type || 'unknown',
          action: action,
          entity_type: entityInfo.type,
          entity_id: entityInfo.id,
          details: {
            ...details,
            impersonated: authStore.isImpersonating,
            resident_id: authStore.isImpersonating ? user?.id : null
          }
        });

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.warn('⚠️ Audit logging failed:', err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Fetch audit logs (Super Admin only)
   */
  async function getLogs(filters: any = {}, limit = 50) {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (filters.action) query = query.eq('action', filters.action);
      if (filters.entity_type) query = query.eq('entity_type', filters.entity_type);
      if (filters.actor_id) query = query.eq('actor_id', filters.actor_id);

      const { data, error } = await query;
      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      console.error('❌ Error fetching audit logs:', err);
      return { success: false, error: err.message };
    }
  }

  return {
    logAction,
    getLogs
  };
};
