<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 overflow-hidden">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="emit('close')"></div>

        <!-- Modal Container -->
        <div class="relative bg-white dark:bg-slate-900 w-full max-w-4xl h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 z-10 flex flex-col">
          <!-- Header -->
          <div class="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
            <div>
              <h3 class="text-xl font-black tracking-tight">Receipt Preview</h3>
              <p class="text-xs text-slate-500">Kwitansi Pembayaran Resmi</p>
            </div>
            <button @click="emit('close')" class="size-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-rose-500 transition-colors">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Content / PDF Preview -->
          <div class="flex-1 bg-slate-50 dark:bg-slate-950 p-4 md:p-8 overflow-hidden flex items-center justify-center relative">
            <div v-if="isLoading || (!receiptData && !activeError)" class="flex flex-col items-center gap-4">
              <span class="material-symbols-outlined animate-spin text-4xl text-primary">refresh</span>
              <p class="text-sm font-bold text-slate-400">
                {{ !receiptData ? 'Fetching payment data...' : 'Generating PDF...' }}
              </p>
            </div>

            <div v-else-if="activeError" class="text-center text-slate-400 px-4">
              <span class="material-symbols-outlined text-6xl mb-2 opacity-20">error</span>
              <p class="font-bold text-sm mb-3">{{ activeError }}</p>
              <button
                v-if="receiptData"
                @click="updatePreview"
                class="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90 transition-all"
              >
                <span class="material-symbols-outlined">refresh</span>
                Retry preview
              </button>
            </div>

            <iframe 
              v-else-if="pdfUrl" 
              :src="pdfUrl" 
              class="w-full h-full rounded-xl shadow-lg bg-white border-0 min-h-[300px]"
            ></iframe>
          </div>

          <!-- Footer Actions -->
          <div class="p-6 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-3 shrink-0 bg-white dark:bg-slate-900">
            <button @click="downloadPdf" :disabled="!pdfUrl" class="flex-1 bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              <span class="material-symbols-outlined">download</span>
              Download PDF
            </button>
            <button @click="emit('close')" class="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold py-4 rounded-2xl active:scale-95 transition-all">
              Close
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { generateReceiptPdf } from '~/utils/receiptPdf';

const props = defineProps({
  isOpen: Boolean,
  receiptData: {
    type: Object,
    default: null
  },
  errorMessage: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['close']);

const pdfUrl = ref(null);
const isLoading = ref(false);
const localError = ref(null);
const docInstance = ref(null);

const activeError = computed(() => props.errorMessage || localError.value);

async function updatePreview() {
  if (!props.receiptData) return;
  if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value);
  pdfUrl.value = null;
  localError.value = null;
  isLoading.value = true;

  try {
    const doc = await generateReceiptPdf(props.receiptData);
    docInstance.value = doc;
    const blob = doc.output('blob');
    pdfUrl.value = URL.createObjectURL(blob);
  } catch (err) {
    console.error('Failed to generate PDF preview:', err);
    localError.value = err?.message || 'Failed to generate PDF preview.';
  } finally {
    isLoading.value = false;
  }
}

function downloadPdf() {
  if (docInstance.value && props.receiptData) {
    docInstance.value.save(`Kwitansi-${props.receiptData.receipt_number.replace(/\//g, '-')}.pdf`);
  }
}

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    localError.value = null;
    if (props.receiptData) {
      updatePreview();
    }
  } else {
    if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value);
    pdfUrl.value = null;
    docInstance.value = null;
    localError.value = null;
  }
});

watch(() => props.receiptData, (newVal) => {
  if (newVal && props.isOpen) {
    updatePreview();
  }
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

iframe {
  background-color: white;
}
</style>
