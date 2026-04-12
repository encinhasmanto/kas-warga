import { supabase } from './supabaseClient';
import { useSystemStore } from '@/stores/systemStore';

let heartbeatInterval = null;

export const systemService = {
  /**
   * Start monitoring system health
   */
  startHeartbeat() {
    if (heartbeatInterval) return;

    const systemStore = useSystemStore();

    // 1. Listen for browser network changes
    window.addEventListener('online', () => {
      console.log('🌐 Browser back online');
      this.checkStatus();
    });

    window.addEventListener('offline', () => {
      console.log('🌐 Browser went offline');
      systemStore.setStatus('offline');
    });

    // 2. Perform initial check
    this.checkStatus();

    // 3. Set up interval (every 60 seconds)
    heartbeatInterval = setInterval(() => {
      this.checkStatus();
    }, 60000);
  },

  /**
   * Stop monitoring (useful for cleanup)
   */
  stopHeartbeat() {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  },

  /**
   * Perform a physical ping to Supabase
   */
  async checkStatus() {
    const systemStore = useSystemStore();

    // If browser says we are offline, don't even try
    if (!navigator.onLine) {
      systemStore.setStatus('offline');
      return;
    }

    try {
      // Extremely light query to verify database connectivity
      const { error } = await supabase
        .from('units')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.warn('⚠️ Supabase Ping failed:', error.message);
        systemStore.setStatus('limited');
      } else {
        systemStore.setStatus('connected');
      }
    } catch (err) {
      console.error('❌ Connection Check Error:', err);
      systemStore.setStatus('offline');
    }
  }
};
