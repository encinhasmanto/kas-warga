<template>
  <div v-if="error" class="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
    <div class="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-primary/10 p-8 text-center animate-in fade-in zoom-in duration-300">
      <div class="w-20 h-20 bg-rose-100 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <span class="material-symbols-outlined text-4xl text-rose-500">warning</span>
      </div>
      
      <h1 class="text-2xl font-black tracking-tight mb-2">Oops! Something went wrong</h1>
      <p class="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
        The application encountered an unexpected error. Don't worry, we've been notified and are looking into it.
      </p>

      <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-8 text-left overflow-hidden">
        <p class="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Error Details</p>
        <p class="text-xs font-mono text-rose-500 dark:text-rose-400 break-words line-clamp-3">
          {{ error.message || 'Unknown Application Error' }}
        </p>
      </div>

      <div class="flex flex-col gap-3">
        <button 
          @click="recover"
          class="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          Reload Application
        </button>
        <button 
          @click="goBack"
          class="w-full py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
        >
          Go Back
        </button>
      </div>
      
      <p class="mt-8 text-[10px] text-slate-400 font-medium">
        Error Reference: {{ errorId }}
      </p>
    </div>
  </div>
  <slot v-else />
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue';
import * as Sentry from "@sentry/vue";

const error = ref(null);
const errorId = ref(null);

onErrorCaptured((err, instance, info) => {
  error.value = err;
  
  // Tag error with unique ID for support
  errorId.value = Math.random().toString(36).substring(2, 9).toUpperCase();
  
  // Capture with Sentry (even if DSN is placeholder, this is good practice)
  Sentry.captureException(err, {
    extra: {
      component: instance?.$options?.name || 'Unknown',
      info
    }
  });

  // Return false to stop error propagation
  return false;
});

function recover() {
  window.location.reload();
}

function goBack() {
  window.history.back();
  setTimeout(() => {
    error.value = null;
  }, 100);
}
</script>
