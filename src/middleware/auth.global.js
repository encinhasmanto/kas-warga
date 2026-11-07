import { useAuth } from '@/composables/useAuth'

// Guard navigasi: sama persis dengan beforeEach lama di router.
export default defineNuxtRouteMiddleware((to) => {
  const { isLoggedIn, isAdmin, isSuperAdmin } = useAuth()

  if (to.meta.requiresAuth && !isLoggedIn.value) {
    return navigateTo({ name: 'login' })
  }
  if (to.meta.requiresAdmin && !isAdmin.value) {
    return navigateTo({ name: 'dashboard' })
  }
  if (to.meta.requiresSuperAdmin && !isSuperAdmin.value) {
    return navigateTo({ name: 'dashboard' })
  }
})
