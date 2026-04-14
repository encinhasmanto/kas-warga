<template>
  <GlobalErrorBoundary>
    <router-view />
    <MaintenanceOverlay />
  </GlobalErrorBoundary>
</template>

<script setup>
import GlobalErrorBoundary from '@/components/common/GlobalErrorBoundary.vue';
import MaintenanceOverlay from '@/components/common/MaintenanceOverlay.vue';
</script>

<style>
/* Global app-level styles handled in global.css */
</style>
