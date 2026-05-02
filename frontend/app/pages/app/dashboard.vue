<template>
  <div class="dashboard-wrapper">
    <!-- Render the appropriate dashboard based on user role -->
    <DashboardAdminDashboard v-if="isAdmin || isSuperAdmin" />
    <DashboardResidentDashboard v-else />
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'app',
  middleware: ['auth']
})

const { isAdmin, isSuperAdmin } = useAuth()
</script>
