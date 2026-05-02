/**
 * Audit Service
 * Handles recording of application-wide actions for traceability.
 */

import { supabase } from './supabaseClient';
import { useAuthStore } from '@/stores/authStore';

export const auditService = {
  /**
   * Log an action to the audit_logs table
   * @param {string} action - The action name (e.g. 'UPDATE_TRANSACTION')
   * @param {Object} entityInfo - { type: 'transactions', id: 'uuid' }
   * @param {Object} details - Any metadata or before/after data
   */
  async logAction(action, entityInfo = {}, details = {}) {
    try {
      const authStore = useAuthStore();
      const user = authStore.currentUser;
      
      // If impersonating, the actor is the ORIGINAL admin, but we note the impersonation
      const actor = authStore.originalAdminSession || user;
      
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          actor_id: actor?.id,
          actor_name: actor?.displayName || actor?.username || 'Unknown',
          actor_type: actor?.type || 'unknown',
          action: action,
          entity_type: entityInfo.type,
          entity_id: entityInfo.id,
          details: {
            ...details,
            impersonated: authStore.isImpersonating,
            resident_id: authStore.isImpersonating ? user.id : null
          }
        });

      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.warn('⚠️ Audit logging failed:', err.message);
      return { success: false, error: err.message };
    }
  },

  /**
   * Fetch audit logs (Super Admin only)
   */
  async getLogs(filters = {}, limit = 50) {
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
    } catch (err) {
      console.error('❌ Error fetching audit logs:', err);
      return { success: false, error: err.message };
    }
  }
};
