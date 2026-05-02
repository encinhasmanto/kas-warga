import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/services/supabaseClient';

export const useAuthStore = defineStore('auth', () => {
  // --- State ---
  const session = ref(null);
  const originalAdminSession = ref(null);

  // --- Getters ---
  const isLoggedIn = computed(() => !!session.value);
  const isImpersonating = computed(() => !!originalAdminSession.value);
  
  const currentUser = computed(() => session.value);
  const role = computed(() => session.value?.role || null);
  const displayName = computed(() => session.value?.displayName || 'User');
  const unitCode = computed(() => session.value?.unitCode || null);
  const avatarUrl = computed(() => session.value?.avatarUrl || null);
  
  const isSuperAdmin = computed(() => {
    const activeRole = session.value?.role;
    return activeRole === 'Super Admin' || activeRole === 'super_admin';
  });

  const isAdmin = computed(() => {
    const activeRole = session.value?.role;
    return activeRole === 'Admin' || activeRole === 'admin' || isSuperAdmin.value;
  });


  const isResident = computed(() => role.value === 'Resident' || role.value === 'resident');
  const unitId = computed(() => session.value?.unit_id || session.value?.id || null);


  // --- Actions ---
  function setSession(newSession) {
    session.value = newSession;
  }

  function logout() {
    session.value = null;
    originalAdminSession.value = null;
    window.location.href = '/';
  }

  /**
   * Admin impersonation logic
   * Allows Super Admin to "log in" as a unit
   */
  async function impersonateUnit(unitId) {
    if (!isSuperAdmin.value) return { success: false, error: 'Unauthorized' };

    try {
      const { data, error } = await supabase
        .from('units')
        .select('id, code, name, category, avatar_url')
        .eq('id', unitId)
        .single();

      if (error) {
        return { success: false, error: 'Database error: ' + error.message };
      }

      // Backup current admin session if not already impersonating
      if (!isImpersonating.value) {
        originalAdminSession.value = { ...session.value };
      }

      // Set resident session
      const residentSession = {
        type: 'resident',
        id: data.id,
        unitCode: data.code,
        displayName: data.name,
        category: data.category,
        avatarUrl: data.avatar_url,
        role: 'Resident',
        isGuest: false,
        impersonated: true
      };

      setSession(residentSession);
      return { success: true };
    } catch (err) {
      console.error('❌ Impersonation error:', err);
      return { success: false, error: 'Exception: ' + err.message };
    }
  }

  function stopImpersonating() {
    if (originalAdminSession.value) {
      setSession(originalAdminSession.value);
      originalAdminSession.value = null;
      return true;
    }
    return false;
  }

  return {
    session,
    originalAdminSession,
    isLoggedIn,
    isImpersonating,
    currentUser,
    role,
    displayName,
    unitCode,
    avatarUrl,
    isSuperAdmin,
    isAdmin,
    isResident,
    unitId,
    setSession,
    logout,
    impersonateUnit,
    stopImpersonating
  };
}, {
  persist: true
});
