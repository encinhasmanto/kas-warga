<template>
  <transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="close"></div>

      <!-- Modal Content -->
      <div class="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-300">
        
        <!-- Header Image / QR Placeholder -->
        <div class="aspect-square w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group overflow-hidden relative">
          <div class="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <img 
            src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=MANDIRI-1150015853784" 
            alt="Payment QR Code"
            class="w-48 h-48 sm:w-56 sm:h-56 object-contain shadow-sm rounded-xl relative z-10"
          />
          <div class="absolute bottom-4 left-0 right-0 text-center">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Scan to pay with QRIS</span>
          </div>
        </div>

        <!-- Details -->
        <div class="p-6 sm:p-8 space-y-6">
          <div class="text-center">
            <h3 class="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Bank Transfer</h3>
            <div class="bg-primary/5 dark:bg-primary/10 rounded-2xl p-4 border border-primary/10">
              <p class="text-primary font-black text-lg sm:text-xl tracking-wider leading-tight">MANDIRI</p>
              <p class="text-slate-900 dark:text-white font-black text-xl sm:text-2xl mt-1 select-all">115-00-1585378-4</p>
              <p class="text-[10px] font-bold text-slate-500 uppercase mt-2 tracking-widest leading-relaxed">
                a.n. YUSRIL ARHAM HASMANTO - <br/> TRINADIRA SURYANINGW
              </p>
            </div>
          </div>

          <!-- WA Confirmation -->
          <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800/50">
            <p class="text-xs text-emerald-800 dark:text-emerald-400 font-medium text-center leading-relaxed">
              Segera lakukan konfirmasi dengan mengirimkan bukti bayar ke <br/>
              <a href="https://wa.me/6281234967582" target="_blank" class="inline font-black text-emerald-600 dark:text-emerald-300 hover:underline">
                Bendahara PTTH - ENCIN
              </a>
            </p>
          </div>

          <button 
            @click="close"
            class="w-full bg-slate-950 dark:bg-white dark:text-slate-950 text-white font-bold py-4 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
          >
            Close
          </button>
        </div>

        <!-- Close "X" Button -->
        <button 
          @click="close" 
          class="absolute top-4 right-4 w-10 h-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors z-20 shadow-sm border border-slate-200 dark:border-slate-700"
        >
          <span class="material-symbols-outlined text-xl">close</span>
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
