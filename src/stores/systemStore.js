import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useSystemStore = defineStore('system', () => {
  // --- State ---
  const status = ref('connected'); // 'connected', 'limited', 'offline'
  const lastChecked = ref(Date.now());
  const offlineStartTime = ref(null);
  
  // --- Getters ---
  const isConnected = computed(() => status.value === 'connected');
  const isOffline = computed(() => status.value === 'offline');
  const isLimited = computed(() => status.value === 'limited');

  // Maintenance mode triggers after 5 minutes (300,000 ms) of consistent offline status
  const isMaintenanceMode = computed(() => {
    if (!offlineStartTime.value) return false;
    const offlineDuration = Date.now() - offlineStartTime.value;
    return status.value === 'offline' && offlineDuration > 300000;
  });

  // --- Actions ---
  function setStatus(newStatus) {
    const oldStatus = status.value;
    status.value = newStatus;
    lastChecked.value = Date.now();

    // Track when we first went offline
    if (newStatus === 'offline' && oldStatus !== 'offline') {
      offlineStartTime.value = Date.now();
    } else if (newStatus !== 'offline') {
      offlineStartTime.value = null;
    }
  }

  return {
    status,
    lastChecked,
    offlineStartTime,
    isConnected,
    isOffline,
    isLimited,
    isMaintenanceMode,
    setStatus
  };
});
