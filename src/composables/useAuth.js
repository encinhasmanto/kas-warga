import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/authStore';

export function useAuth() {
  const store = useAuthStore();
  const refs = storeToRefs(store);

  return {
    // Refs
    session: refs.session,
    currentUser: refs.currentUser,
    role: refs.role,
    displayName: refs.displayName,
    unitCode: refs.unitCode,
    avatarUrl: refs.avatarUrl,
    unitId: refs.unitId,
    isImpersonating: refs.isImpersonating,
    
    // Computed (from store)
    isLoggedIn: refs.isLoggedIn,
    isSuperAdmin: refs.isSuperAdmin,
    isAdmin: refs.isAdmin,
    isResident: refs.isResident,
    
    // Methods
    setSession: store.setSession,
    logout: store.logout,
    impersonateUnit: store.impersonateUnit,
    stopImpersonating: store.stopImpersonating
  };
}
