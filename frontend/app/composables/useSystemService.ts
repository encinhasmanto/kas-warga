import { computed } from 'vue';
import type { Database } from '~/types/database';

export const useSystemService = () => {
  const supabase = useSupabaseClient<Database>();
  const systemStore = useSystemStore();
  let heartbeatInterval: any = null;

  function startHeartbeat() {
    if (heartbeatInterval) return;

    if (process.client) {
      window.addEventListener('online', () => checkStatus());
      window.addEventListener('offline', () => systemStore.setStatus('offline'));
    }

    checkStatus();
    heartbeatInterval = setInterval(() => checkStatus(), 60000);
  }

  function stopHeartbeat() {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  }

  async function checkStatus() {
    if (process.client && !navigator.onLine) {
      systemStore.setStatus('offline');
      return;
    }

    try {
      const { error } = await supabase.from('units').select('id').limit(1).maybeSingle();
      if (error) {
        systemStore.setStatus('limited');
      } else {
        systemStore.setStatus('connected');
      }
    } catch (err) {
      systemStore.setStatus('offline');
    }
  }

  return {
    status: computed(() => systemStore.status),
    startHeartbeat,
    stopHeartbeat,
    checkStatus
  };
};
