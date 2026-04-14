<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="handleClose"></div>

        <div class="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 z-10">
          <div class="bg-slate-100 dark:bg-slate-800 p-8 flex flex-col items-center">
            <div class="bg-white p-3 rounded-2xl shadow-sm mb-4">
              <qrcode-vue :value="dynamicQrisString" :size="160" level="H" render-as="svg" />
            </div>
            <p class="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Total to Pay</p>
            <p class="text-3xl font-black text-slate-900 dark:text-white">Rp {{ amountToPay.toLocaleString('id-ID') }}</p>
            <span class="mt-3 text-[12px] font-bold text-slate-400 uppercase tracking-[0.2em]">OR</span>
            <button 
              @click="openPartialSelection"
              class="mt-4 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-primary/20 transition-all"
            >
              Choose Specific Bills
            </button>
          </div>

          <div class="p-6 space-y-4">
            <div class="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 text-center">
              <p class="text-primary font-black">MANDIRI</p>
              <p class="text-slate-900 dark:text-white font-black text-xl">155-00-1585378-4</p>
              <p class="text-[9px] text-slate-500 uppercase mt-1">a.n. YUSRIL ARHAM HASMANTO - <br>TRINADIRA SURYANINGW PRASETYO</p>
            </div>
            <button @click="handleClose" class="w-full bg-slate-950 text-white font-bold py-4 rounded-2xl">Close</button>
          </div>
        </div>

        <transition name="slide-up">
          <div v-if="showPartialModal" class="absolute inset-0 z-20 flex items-end justify-center p-0">
            <div class="bg-white dark:bg-slate-900 w-full max-w-sm rounded-t-[2.5rem] shadow-2xl p-6 max-h-[85vh] flex flex-col">
              
              <div class="flex justify-between items-center mb-6 shrink-0">
                <h3 class="font-black text-xl">Select Bills</h3>
                <button @click="showPartialModal = false" class="material-symbols-outlined text-slate-400">close</button>
              </div>

              <div class="overflow-y-auto no-scrollbar pb-6 flex-1">
                
                <div v-if="dueBills.length > 0" class="mb-6">
                  <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Due & Past Payments</h4>
                  <div class="space-y-3">
                    <div v-for="bill in dueBills" :key="bill.id" 
                      class="flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer"
                      :class="selectedIds.includes(bill.id) ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-slate-700'"
                      @click="toggleBill(bill)"
                    >
                      <div>
                        <div class="flex items-center gap-2">
                          <p class="font-bold text-sm">{{ bill.label }}</p>
                          <span v-if="bill.status === 'late' || bill.status === 'unpaid'" class="text-[8px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase">Due</span>
                        </div>
                        <p class="text-xs text-slate-500 mt-0.5">Rp {{ bill.amount.toLocaleString('id-ID') }}</p>
                      </div>
                      <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors"
                        :class="selectedIds.includes(bill.id) ? 'bg-primary border-primary' : 'border-slate-300 dark:border-slate-600'">
                        <span v-if="selectedIds.includes(bill.id)" class="material-symbols-outlined text-white text-[14px] font-bold">check</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="upcomingBills.length > 0">
                  <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Upcoming Payments</h4>
                  <div class="space-y-3">
                    <div v-for="bill in upcomingBills" :key="bill.id" 
                      class="flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer opacity-80 hover:opacity-100"
                      :class="selectedIds.includes(bill.id) ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-slate-700'"
                      @click="toggleBill(bill)"
                    >
                      <div>
                        <p class="font-bold text-sm">{{ bill.label }}</p>
                        <p class="text-xs text-slate-500 mt-0.5">Rp {{ bill.amount.toLocaleString('id-ID') }}</p>
                      </div>
                      <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors"
                        :class="selectedIds.includes(bill.id) ? 'bg-primary border-primary' : 'border-slate-300 dark:border-slate-600'">
                        <span v-if="selectedIds.includes(bill.id)" class="material-symbols-outlined text-white text-[14px] font-bold">check</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <div class="pt-4 mt-auto border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                <button @click="applySelection" class="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-lg hover:shadow-primary/30 transition-all">
                  Update Total: Rp {{ tempAmount.toLocaleString('id-ID') }}
                </button>
              </div>

            </div>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import QrcodeVue from "qrcode.vue";
import { generateDynamicQRIS } from "@/utils/qrisGenerator.js";
import { useAuth } from "@/composables/useAuth";
import { supabase } from "@/services/supabaseClient.js";

const props = defineProps({
  isOpen: Boolean,
  totalAmount: Number 
});
const emit = defineEmits(["close"]);

const STATIC_QRIS_STRING = "00020101021126690021ID.CO.BANKMANDIRI.WWW01189360000802044317790211720443177930303UMI51440014ID.CO.QRIS.WWW0215ID10265010406240303UMI5204701153033605802ID5923Permata Tajur Townhouse6015Tangerang (Kota61051515262070703A016304C473";

const auth = useAuth();

const amountToPay = ref(0);
const dynamicQrisString = ref("");
const showPartialModal = ref(false);
const billOptions = ref([]);
const selectedIds = ref([]);

// --- NEW SORTING LOGIC ---
// This sorts bills chronologically. e.g., ipl-2025-12 comes before ipl-2026-1. 
// THR is given a fake month of "13" so it sits at the end of the year.
const sortChronologically = (a, b) => {
  const getSortKey = (id) => {
    const parts = id.split('-');
    if (parts[0] === 'ipl') return parseInt(parts[1]) * 100 + parseInt(parts[2]);
    if (parts[0] === 'thr') return parseInt(parts[1]) * 100 + 13;
    return 0;
  };
  return getSortKey(a.id) - getSortKey(b.id);
};

// --- NEW COMPUTED PROPERTIES ---
// These split the master list into two visual categories
const dueBills = computed(() => {
  return billOptions.value.filter(b => b.isDue).sort(sortChronologically);
});

const upcomingBills = computed(() => {
  return billOptions.value.filter(b => !b.isDue).sort(sortChronologically);
});

const tempAmount = computed(() => {
  return billOptions.value
    .filter(b => selectedIds.value.includes(b.id))
    .reduce((sum, b) => sum + b.amount, 0);
});

const getBillMeta = (year, month) => {
  const now = new Date();
  const curMonth = now.getMonth() + 1;
  const curYear = now.getFullYear();

  const isPastYear = year < curYear;
  const isCurrentYear = year === curYear;
  const isPastMonth = isCurrentYear && month < curMonth;
  const isCurrentMonth = isCurrentYear && month === curMonth;

  return {
    isDue: isPastYear || isPastMonth || isCurrentMonth,
    status: isCurrentMonth ? 'late' : (isPastYear || isPastMonth ? 'unpaid' : 'upcoming')
  };
};

const getBillingRate = () => {
  const code = String(auth.unitCode?.value || auth.unitCode || "").toUpperCase();
  if (code.startsWith('R')) return 250000; 
  if (code.startsWith('A') || code.startsWith('B')) return 170000;
  return 170000;
};

const fetchUnpaidBills = async () => {
  const currentUnitId = auth.unitId?.value || auth.unitId; 
  if (!currentUnitId) return;

  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const yearsToFetch = [currentYear - 2, currentYear - 1, currentYear]; 
    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const rate = getBillingRate();
    const allUnpaid = [];
    const defaultSelected = [];

    for (const targetYear of yearsToFetch) {
      const { data, error } = await supabase.rpc('get_resident_tracker', {
        p_unit_id: currentUnitId,
        p_year: targetYear
      });

      if (!error && data && data.length > 0) {
        const row = data[0];
        
        for (let i = 1; i <= 12; i++) {
          if (row[`month_${i}`] === false) {
            const meta = getBillMeta(targetYear, i);
            const billId = `ipl-${targetYear}-${i}`;
            
            allUnpaid.push({
              id: billId,
              label: `${monthNames[i-1]} ${targetYear}`,
              amount: rate,
              status: meta.status,
              isDue: meta.isDue
            });

            if (meta.isDue) {
              defaultSelected.push(billId);
            }
          }
        }

        if (row.thr_status === false) {
          const isDue = targetYear <= currentYear;
          const thrId = `thr-${targetYear}`;
          allUnpaid.push({
            id: thrId,
            label: `THR ${targetYear}`,
            amount: rate,
            status: targetYear === currentYear ? 'late' : (targetYear < currentYear ? 'unpaid' : 'upcoming'),
            isDue: isDue
          });
          if (isDue) defaultSelected.push(thrId);
        }
      }
    }

    billOptions.value = allUnpaid;
    selectedIds.value = defaultSelected;

  } catch (err) {
    console.error("Failed to fetch unpaid bills:", err.message);
  }
};

watch(() => props.isOpen, async (val) => {
  if (val) {
    amountToPay.value = props.totalAmount || 0;
    await fetchUnpaidBills();
    
    // Set the display amount to exactly what is due right now
    amountToPay.value = tempAmount.value;
    if (tempAmount.value > 0) {
      dynamicQrisString.value = generateDynamicQRIS(STATIC_QRIS_STRING, tempAmount.value);
    }
    
  } else {
    amountToPay.value = 0;
    selectedIds.value = [];
    billOptions.value = [];
    showPartialModal.value = false;
  }
}, { immediate: true });

const toggleBill = (bill) => {
  const index = selectedIds.value.indexOf(bill.id);
  if (index > -1) selectedIds.value.splice(index, 1);
  else selectedIds.value.push(bill.id);
};

const applySelection = () => {
  amountToPay.value = tempAmount.value;
  // Prevent generating a QR code for 0 Rupiah
  if (tempAmount.value > 0) {
    dynamicQrisString.value = generateDynamicQRIS(STATIC_QRIS_STRING, tempAmount.value);
  }
  showPartialModal.value = false;
};

const openPartialSelection = () => { showPartialModal.value = true; };
const handleClose = () => { emit("close"); };
</script>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active { 
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); 
}
.slide-up-enter-from, .slide-up-leave-to { 
  transform: translateY(100%);
  opacity: 0;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.no-scrollbar::-webkit-scrollbar { display: none; }
</style>