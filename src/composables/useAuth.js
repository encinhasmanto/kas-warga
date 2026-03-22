/**
 * useAuth composable
 * Provides reactive session state and auth utilities throughout the app
 */
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const session = ref(JSON.parse(sessionStorage.getItem('dw_session') || 'null'))

export function useAuth() {
  const router = useRouter()

  const isLoggedIn = computed(() => !!session.value)
  const isGuest = computed(() => session.value?.isGuest === true)
  const role = computed(() => session.value?.role || null)
  const displayName = computed(() => session.value?.displayName || 'User')
  const unitCode = computed(() => session.value?.unitCode || null)

  // Role checks
  const isSuperAdmin = computed(() => role.value === 'Super Admin')
  const isAdmin = computed(() => role.value === 'Admin' || role.value === 'Super Admin')
  const isResident = computed(() => role.value === 'Resident')

  function setSession(newSession) {
    session.value = newSession
    sessionStorage.setItem('dw_session', JSON.stringify(newSession))
  }

  function logout() {
    session.value = null
    sessionStorage.removeItem('dw_session')
    router.push({ name: 'login' })
  }

  return {
    session,
    isLoggedIn,
    isGuest,
    role,
    displayName,
    unitCode,
    isSuperAdmin,
    isAdmin,
    isResident,
    setSession,
    logout,
  }
}
