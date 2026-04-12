<template>
  <transition name="maintenance-fade">
    <div v-if="isMaintenanceMode" class="fixed inset-0 z-[1000] flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <div class="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <!-- Animated Icon -->
        <div class="relative w-24 h-24 mx-auto">
          <div class="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
          <div class="relative w-full h-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl flex items-center justify-center border border-primary/10">
            <span class="material-symbols-outlined text-5xl text-primary animate-pulse">cloud_sync</span>
          </div>
        </div>

        <div class="space-y-4">
          <h1 class="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">
            Connection Lost
          </h1>
          <p class="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
            Our systems are currently unreachable. We are automatically attempting to reconnect to the Command Center...
          </p>
        </div>

        <!-- Connection Status Indicator -->
        <div class="inline-flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-900 rounded-2xl border border-primary/10 shadow-sm">
          <div class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </div>
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Checking Signal Status
          </span>
        </div>

        <!-- Progress/Tips -->
        <div class="bg-primary/5 rounded-2xl p-4 border border-primary/5 max-w-xs mx-auto">
          <p class="text-[10px] font-medium text-slate-400 mb-2">PRO TIP</p>
          <p class="text-xs italic text-primary/80">
            "Your data is safe. This is usually caused by a poor internet connection or server maintenance."
          </p>
        </div>

        <button 
          @click="retry"
          class="px-8 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-95"
        >
          Retry Connection Now
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue';
import { useSystemStore } from '@/stores/systemStore';
import { systemService } from '@/services/systemService';

const systemStore = useSystemStore();
const isMaintenanceMode = computed(() => systemStore?.isMaintenanceMode || false);

function retry() {
  systemService.checkStatus();
}
</script>

<style scoped>
.maintenance-fade-enter-active,
.maintenance-fade-leave-active {
  transition: opacity 0.5s ease;
}

.maintenance-fade-enter-from,
.maintenance-fade-leave-to {
  opacity: 0;
}
</style>
