<template>
  <div class="feedback-fab-container">
    <!-- FAB Button -->
    <button 
      @click="isModalOpen = true"
      class="fixed bottom-6 right-6 z-[9990] size-14 md:size-16 bg-primary text-white rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all group"
    >
      <span class="material-symbols-outlined text-[28px] group-hover:rotate-12 transition-transform">rate_review</span>
      
      <!-- Subtle Badge for notifications or status (optional) -->
      <span class="absolute -top-1 -right-1 size-4 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 hidden"></span>
      
      <!-- Label on Hover (Desktop) -->
      <span class="absolute right-full mr-4 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap hidden md:block">
        Feedback
      </span>
    </button>

    <!-- Feedback Modal -->
    <ModalsFeedbackModal 
      :is-open="isModalOpen" 
      @close="isModalOpen = false" 
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';

const isModalOpen = ref(false);
</script>

<style scoped>
/* Optional: Pulse animation for the FAB to catch eye */
@keyframes soft-pulse {
  0% { shadow: 0 0 0 0 rgba(19, 127, 236, 0.4); }
  70% { shadow: 0 0 0 10px rgba(19, 127, 236, 0); }
  100% { shadow: 0 0 0 0 rgba(19, 127, 236, 0); }
}

button {
  /* box-shadow: 0 10px 25px -5px rgba(19, 127, 236, 0.4); */
}
</style>
