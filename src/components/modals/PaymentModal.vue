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
            <span
              class="mt-3 text-[12px] font-bold text-slate-400 uppercase tracking-[0.2em]"
              >OR</span
            >
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
              <p class="text-[9px] text-slate-500 uppercase mt-1">a.n. YUSRIL ARHAM HASMANTO <br>TRINADIRA SURYANINGW PRASETYO</p>
            </div>
            <button @click="handleClose" class="w-full bg-slate-950 text-white font-bold py-4 rounded-2xl">Close</button>
          </div>
        </div>

        <transition name="slide-up">
          <div v-if="showPartialModal" class="absolute inset-0 z-20 flex items-end justify-center p-0">
            <div class="bg-white dark:bg-slate-900 w-full max-w-sm rounded-t-[2.5rem] shadow-2xl p-8 max-h-[80vh] overflow-y-auto">
              <div class="flex justify-between items-center mb-6">
                <h3 class="font-black text-xl">Select Bills</h3>
                <button @click="showPartialModal = false" class="material-symbols-outlined text-slate-400">close</button>
              </div>

              <div class="space-y-3 mb-8">
                <div v-for="bill in billOptions" :key="bill.id" 
                  class="flex items-center justify-between p-4 rounded-2xl border transition-all"
                  :class="selectedIds.includes(bill.id) ? 'border-primary bg-primary/5' : 'border-slate-100'"
                  @click="toggleBill(bill)"
                >
                  <div>
                    <p class="font-bold text-sm">{{ bill.label }}</p>
                    <p class="text-xs text-slate-500">Rp {{ bill.amount.toLocaleString('id-ID') }}</p>
                  </div>
                  <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                    :class="selectedIds.includes(bill.id) ? 'bg-primary border-primary' : 'border-slate-300'">
                    <span v-if="selectedIds.includes(bill.id)" class="material-symbols-outlined text-white text-xs">check</span>
                  </div>
                </div>
              </div>

              <button @click="applySelection" class="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-lg">
                Update Total: Rp {{ tempAmount.toLocaleString('id-ID') }}
              </button>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>

<!-- <script setup>
import { ref, watch, computed } from "vue";
import QrcodeVue from "qrcode.vue";
import { generateDynamicQRIS } from "@/utils/qrisGenerator.js"
import { useAuth } from "@/composables/useAuth";
import { supabase } from "@/services/supabaseClient.js";;

const props = defineProps({
  isOpen: Boolean,
  totalAmount: Number // Next Due Amount from Dashboard
});
const emit = defineEmits(["close"]);

const STATIC_QRIS_STRING = "00020101021126690021ID.CO.BANKMANDIRI.WWW01189360000802044317790211720443177930303UMI51440014ID.CO.QRIS.WWW0215ID10265010406240303UMI5204701153033605802ID5923Permata Tajur Townhouse6015Tangerang (Kota61051515262070703A016304C473";

const amountToPay = ref(0);
const dynamicQrisString = ref("");
const showPartialModal = ref(false);

const { unitId } = useAuth(); // Get the current resident's unit ID
const billOptions = ref([]); // This replaces 'unpaidBills'

/**
 * Helper to determine if a month is 'late' or 'unpaid'
 */
const getStatusLabel = (year, month) => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return 'late';
  }
  return 'unpaid';
};

/**
 * Fetch unpaid bills from Supabase RPC
 */
const fetchUnpaidBills = async () => {
  if (!unitId.value) return;

  try {
    const year = new Date().getFullYear();
    const { data, error } = await supabase.rpc('get_resident_tracker', {
      p_unit_id: unitId.value,
      p_year: year
    });

    if (error) throw error;

    if (data && data.length > 0) {
      const row = data[0];
      const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
      
      const unpaid = [];
      
      // 1. Map Months 1-12
      for (let i = 1; i <= 12; i++) {
        const isPaid = row[`month_${i}`];
        // If boolean is false, it's unpaid/late
        if (!isPaid) {
          const status = getStatusLabel(year, i);
          unpaid.push({
            id: `ipl-${year}-${i}`,
            label: `${monthNames[i-1]} ${year}`,
            amount: 150000, // Flat IPL rate
            status: status
          });
        }
      }

      // 2. Map THR (Special Fee)
      if (!row.thr_status) {
        unpaid.push({
          id: `thr-${year}`,
          label: `THR ${year}`,
          amount: 150000,
          status: 'unpaid'
        });
      }

      billOptions.value = unpaid;
      // Default: Select all unpaid bills
      selectedIds.value = unpaid.map(b => b.id);
    }
  } catch (err) {
    console.error("Failed to fetch unpaid bills:", err.message);
  }
};

/**
 * Modified Watcher to trigger fetch when modal opens
 */
watch(() => props.isOpen, async (val) => {
  if (val) {
    // Reset state and set initial amount from Dashboard
    amountToPay.value = props.totalAmount;
    dynamicQrisString.value = generateDynamicQRIS(STATIC_QRIS_STRING, props.totalAmount);
    
    // Fetch actual data
    await fetchUnpaidBills();
  } else {
    // Cleanup when closed
    amountToPay.value = 0;
    selectedIds.value = [];
    billOptions.value = [];
    showPartialModal.value = false;
  }
});

const selectedIds = ref([]);
const tempAmount = computed(() => {
  return billOptions.value.filter(b => selectedIds.value.includes(b.id)).reduce((sum, b) => sum + b.amount, 0);
});

// Initialization Logic
watch(() => props.isOpen, (val) => {
  if (val) {
    // 1. Set default amount to the full amount passed from parent (Due Amount)
    amountToPay.value = props.totalAmount;
    dynamicQrisString.value = generateDynamicQRIS(STATIC_QRIS_STRING, props.totalAmount);
    
    // 2. Default all bills to selected
    selectedIds.value = billOptions.value.map(b => b.id);
  } else {
    // 3. Reset to default when closed
    amountToPay.value = 0;
    selectedIds.value = [];
    showPartialModal.value = false;
  }
});

const toggleBill = (bill) => {
  if (selectedIds.value.includes(bill.id)) {
    selectedIds.value = selectedIds.value.filter(id => id !== bill.id);
  } else {
    selectedIds.value.push(bill.id);
  }
};

const applySelection = () => {
  amountToPay.value = tempAmount.value;
  dynamicQrisString.value = generateDynamicQRIS(STATIC_QRIS_STRING, tempAmount.value);
  showPartialModal.value = false;
};

const openPartialSelection = () => { showPartialModal.value = true; };
const handleClose = () => { emit("close"); };
</script> -->
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

const tempAmount = computed(() => {
  return billOptions.value
    .filter(b => selectedIds.value.includes(b.id))
    .reduce((sum, b) => sum + b.amount, 0);
});

// Helper to determine status and if it's actually "Due" yet
const getBillMeta = (year, month) => {
  const now = new Date();
  const curMonth = now.getMonth() + 1;
  const curYear = now.getFullYear();

  const isPastYear = year < curYear;
  const isCurrentYear = year === curYear;
  const isPastMonth = isCurrentYear && month < curMonth;
  const isCurrentMonth = isCurrentYear && month === curMonth;

  return {
    // A bill is "Due" if it's from a past year, a past month, or the current month
    isDue: isPastYear || isPastMonth || isCurrentMonth,
    status: isCurrentMonth ? 'late' : (isPastYear || isPastMonth ? 'unpaid' : 'upcoming')
  };
};

// Pricing Logic: Rumah (A/B) = 170k, Ruko (R) = 250k
const getBillingRate = () => {
  const code = String(auth.unitCode?.value || auth.unitCode || "").toUpperCase();
  if (code.startsWith('R')) return 250000; 
  if (code.startsWith('A') || code.startsWith('B')) return 170000;
  return 170000; // Default fallback
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

            // ONLY auto-select if the bill is actually DUE (Past or Current Month)
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
    // 1. Initially show the amount from Dashboard as a placeholder
    amountToPay.value = props.totalAmount || 0;
    
    // 2. Fetch all multi-year bills
    await fetchUnpaidBills();
    
    // 3. SET DEFAULT: amountToPay is now the sum of only DUE bills
    amountToPay.value = tempAmount.value;
    dynamicQrisString.value = generateDynamicQRIS(STATIC_QRIS_STRING, tempAmount.value);
    
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
  dynamicQrisString.value = generateDynamicQRIS(STATIC_QRIS_STRING, tempAmount.value);
  showPartialModal.value = false;
};

const openPartialSelection = () => { showPartialModal.value = true; };
const handleClose = () => { emit("close"); };
</script>

<style scoped>
/* Smooth Slide Up/Down for the selection modal */
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