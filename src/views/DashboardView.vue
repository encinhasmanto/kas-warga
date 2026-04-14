<template>
  <div class="dashboard-wrapper">
    <!-- Render the appropriate dashboard based on user role -->
    <component :is="activeDashboard" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuth } from '@/composables/useAuth.js'

// Import role-specific dashboard views
import ResidentDashboard from '@/components/dashboard/ResidentDashboard.vue'
import AdminDashboard from '@/components/dashboard/AdminDashboard.vue'

const { isAdmin, isSuperAdmin } = useAuth()

const activeDashboard = computed(() => {
  if (isAdmin.value || isSuperAdmin.value) {
    return AdminDashboard
  }
  return ResidentDashboard
})
</script>
