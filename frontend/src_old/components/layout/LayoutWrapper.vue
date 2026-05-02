<template>
  <div class="flex flex-col min-h-screen">
    <!-- Impersonation Banner -->
    <div v-if="isImpersonating" class="bg-amber-500 text-white px-4 py-2 flex items-center justify-between text-xs font-bold z-[9999] shadow-md">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-sm">visibility</span>
        <span>VIEWING MODE: You are currently impersonating Unit {{ unitCode }}.</span>
      </div>
      <button @click="stopImpersonating" class="bg-white/20 hover:bg-white/30 px-3 py-1 rounded transition-colors flex items-center gap-1">
        <span class="material-symbols-outlined text-sm">logout</span>
        Return to Admin
      </button>
    </div>

    <component :is="activeLayout" :key="role">
      <slot />
    </component>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import ResidentLayout from './ResidentLayout.vue'
import AdminLayout from './AdminLayout.vue'

const { role, isImpersonating, stopImpersonating, unitCode } = useAuth()

const activeLayout = computed(() => {
  if (role.value === 'Admin' || role.value === 'Super Admin') {
    return AdminLayout
  }
  return ResidentLayout
})
</script>
