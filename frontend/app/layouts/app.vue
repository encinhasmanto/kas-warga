<template>
  <div class="app-layout">
    <!-- Impersonation Banner -->
    <div v-if="isImpersonating" class="bg-amber-500 text-white px-4 py-2.5 flex items-center justify-between text-xs font-bold z-[9999] shadow-lg sticky top-0">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-sm animate-pulse">visibility</span>
        <span>VIEWING MODE: Currently impersonating Unit {{ unitCode }}.</span>
      </div>
      <button @click="handleReturnToAdmin" class="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 active:scale-95">
        <span class="material-symbols-outlined text-sm">logout</span>
        Return to Admin
      </button>
    </div>

    <AdminLayout v-if="isAdmin || isSuperAdmin">
      <slot />
    </AdminLayout>
    <ResidentLayout v-else>
      <slot />
    </ResidentLayout>

    <!-- Global Feedback FAB -->
    <FeedbackFAB />
  </div>
</template>

<script setup>
import AdminLayout from '~/components/layout/AdminLayout.vue'
import ResidentLayout from '~/components/layout/ResidentLayout.vue'

const { isAdmin, isSuperAdmin, isImpersonating, stopImpersonating, unitCode } = useAuth()

async function handleReturnToAdmin() {
  const success = stopImpersonating()
  if (success) {
    await navigateTo('/app/dashboard')
  }
}
const { startHeartbeat, stopHeartbeat } = useSystemService()
const { subscribeToRealtimeNotifications } = useNotificationService()

onMounted(() => {
  startHeartbeat()
  
  // Realtime notifications
  const cleanup = subscribeToRealtimeNotifications((notif) => {
    // Show toast or update global state
    console.log('New notification:', notif)
  })
  
  onUnmounted(() => {
    stopHeartbeat()
    if (cleanup) cleanup()
  })
})
</script>
