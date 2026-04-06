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

// This will RE-CALCULATE every time a real-time update hits the transactions ref!
const totalPaidBalance = computed(() => {
  return transactions.value
    .filter(t => t.status === 'Paid')
    .reduce((sum, t) => sum + t.amount, 0);
});

const nextDueMonth = computed(() => {
  // Logic to find the first month marked as 'Unpaid'
  return transactions.value.find(t => t.status === 'Unpaid')?.month_label || 'None';
});
</script>
