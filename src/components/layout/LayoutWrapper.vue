<template>
  <component :is="activeLayout" :key="role">
    <slot />
  </component>
</template>

<script setup>
import { computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import ResidentLayout from './ResidentLayout.vue'
import AdminLayout from './AdminLayout.vue'

const { role } = useAuth()

const activeLayout = computed(() => {
  if (role.value === 'Admin' || role.value === 'Super Admin') {
    return AdminLayout
  }
  return ResidentLayout
})
</script>
