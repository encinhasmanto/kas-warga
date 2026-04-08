<template>
  <teleport to="body">
    <transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      >
        <!-- Backdrop (Edge-to-edge background) -->
        <div
          class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
          @click="close"
        ></div>

        <!-- Modal Content -->
        <div
          class="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto no-scrollbar"
        >
          <!-- Header Image / QR Placeholder -->
          <div
            class="aspect-[4/3] w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group overflow-hidden relative"
          >
            <div
              class="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"
            ></div>
            <img
              src="/icons/QrisStatisPermataTajurTownhouse.png"
              alt="Payment QR Code"
              class="w-32 h-32 sm:w-40 sm:h-40 object-contain shadow-sm rounded-xl relative z-10"
            />
            <div class="absolute bottom-3 left-0 right-0 text-center">
              <span
                class="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]"
                >Scan to pay with QRIS</span
              >
            </div>
          </div>

          <!-- Details -->
          <div class="p-6 space-y-4">
            <div class="text-center">
              <h3
                class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2"
              >
                Bank Transfer
              </h3>
              <div
                class="bg-primary/5 dark:bg-primary/10 rounded-2xl p-4 border border-primary/10"
              >
                <p
                  class="text-primary font-black text-base tracking-wider leading-tight"
                >
                  MANDIRI
                </p>
                <p
                  class="text-slate-900 dark:text-white font-black text-xl mt-1 select-all"
                >
                  155-00-1585378-4
                </p>
                <p
                  class="text-[9px] font-bold text-slate-500 uppercase mt-1.5 tracking-widest leading-relaxed"
                >
                  a.n. YUSRIL ARHAM HASMANTO - <br class="hidden sm:block" />
                  TRINADIRA SURYANINGW PRASETYO
                </p>
              </div>
            </div>

            <!-- WA Confirmation -->
            <div
              class="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 border border-emerald-100 dark:border-emerald-800/50"
            >
              <p
                class="text-[11px] text-emerald-800 dark:text-emerald-400 font-medium text-center leading-relaxed"
              >
                Konfirmasi bukti bayar ke: <br />
                <a
                  href="https://wa.me/6281234967582"
                  target="_blank"
                  class="inline font-bold text-emerald-600 dark:text-emerald-300 hover:underline"
                >
                  Bendahara PTTH - ENCIN
                </a>
              </p>
            </div>

            <button
              @click="close"
              class="w-full bg-slate-950 dark:bg-white dark:text-slate-950 text-white font-bold py-3.5 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg text-sm"
            >
              Close
            </button>
          </div>

          <!-- Close "X" Button -->
          <button
            @click="close"
            class="absolute top-4 right-4 w-9 h-9 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors z-20 shadow-sm border border-slate-200 dark:border-slate-700"
          >
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  isOpen: Boolean,
});

const emit = defineEmits(["close"]);

const close = () => {
  emit("close");
};
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
