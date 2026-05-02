import type { Database } from '~/types/database';
import type { UserSession, UserRole } from '~/types/auth';

export const useAuthService = () => {
  const supabase = useSupabaseClient<Database>();
  const authStore = useAuthStore();

  /**
   * Authenticate resident with unit_code and PIN
   */
  async function authenticateResident(unitCode: string, pin: string) {
    try {
      const { data, error } = await supabase
        .from('units')
        .select('id, code, name, category, avatar_url')
        .eq('code', unitCode)
        .eq('pin', pin)
        .single();

      if (error) {
        return { success: false, error: 'Invalid unit code or PIN' };
      }

      const session: UserSession = {
        id: data.id,
        unitCode: data.code,
        displayName: data.name,
        category: data.category,
        avatarUrl: data.avatar_url,
        role: 'resident',
        isGuest: false
      };

      authStore.setSession(session);
      return { success: true, data: session };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Authenticate admin with username and PIN
   */
  async function authenticateAdmin(username: string, pin: string) {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('id, username, role, avatar_url')
        .eq('username', username)
        .eq('pin', pin)
        .single();

      if (error) {
        return { success: false, error: 'Invalid username or PIN' };
      }

      const session: UserSession = {
        id: data.id,
        unitCode: '', // Admins don't have a unit code
        displayName: data.username,
        avatarUrl: data.avatar_url,
        role: data.role.toLowerCase() as UserRole,
      };

      authStore.setSession(session);
      return { success: true, data: session };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Logout
   */
  async function logout() {
    authStore.logout();
  }

  return {
    authenticateResident,
    authenticateAdmin,
    logout
  };
};
