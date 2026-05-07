<template>
  <div class="tracker-view p-4 md:p-8">
    <!-- Header Row -->
    <div class="flex flex-col gap-4 mb-6">
      <div class="flex items-end justify-between">
        <div>
          <div class="flex items-center gap-3">
            <h3 class="text-2xl font-black tracking-tight">Payment Tracker</h3>
            <select v-model="currentYear" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg px-3 py-1 text-sm font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer hover:border-primary/30">
              <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
            </select>
          </div>
          <p class="text-slate-500 text-sm mt-1">Detailed status of Monthly IPL & Special Fees</p>
        </div>
      </div>

      <!-- Search + Actions Bar -->
      <div class="flex flex-col md:flex-row md:items-center gap-3 w-full">
        <div class="relative w-full md:w-72">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] pointer-events-none">search</span>
          <input v-model="searchQuery" type="text" placeholder="Search unit or owner..." class="h-10 w-full pl-10 pr-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm" />
        </div>

        <div v-if="isAdmin" class="flex items-center gap-2 ml-auto">
          <button @click="exportToCSV" class="h-10 flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 px-4 rounded-lg text-sm font-semibold hover:bg-slate-50 shadow-sm active:scale-95">
            <span class="material-symbols-outlined text-[18px]">download</span>
            <span class="hidden sm:inline">Export CSV</span>
          </button>
          <button @click="showFilterPanel = !showFilterPanel" :class="['h-10 flex items-center gap-2 px-4 rounded-lg text-sm font-semibold transition-all shadow-sm', showFilterPanel ? 'bg-primary text-white' : 'bg-white border border-slate-200']">
            <span class="material-symbols-outlined text-[18px]">filter_list</span>
            <span>Filter</span>
          </button>
        </div>
      </div>

      <!-- Filter Panel -->
      <Transition name="slide-down">
        <div v-if="isAdmin && showFilterPanel" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-5 space-y-5">
          <div class="flex flex-wrap gap-2">
            <button v-for="filter in typeFilterOptions" :key="filter.prefix" @click="toggleTypeFilter(filter.prefix)" :class="['px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all', activeTypeFilters.includes(filter.prefix) ? 'border-primary bg-primary/10 text-primary' : 'bg-white border-slate-200']">
              {{ filter.label }}
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Main Table Card -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-primary/10 shadow-sm overflow-hidden mb-6">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse min-w-max">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-800/50">
              <th class="p-4 font-bold text-slate-400 uppercase sticky left-0 bg-slate-50 z-30">Unit</th>
              <th class="p-4 font-bold text-slate-400 uppercase">Owner</th>
              <th v-for="(m, i) in monthHeaders" :key="m" 
                class="p-4 font-bold uppercase text-center transition-colors"
                :class="isCurrentMonth(i) ? 'bg-primary/10 text-primary border-x border-primary/20' : ''"
              >
                {{ m }}
              </th>
              <th class="p-4 font-bold uppercase text-center bg-primary/5">THR</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-if="isLoading">
              <td colspan="15" class="p-12 text-center">
                <span class="material-symbols-outlined animate-spin text-3xl text-primary">refresh</span>
              </td>
            </tr>
            <tr v-else v-for="row in filteredTrackerData" :key="row.unit" class="hover:bg-slate-50">
              <td class="p-4 font-bold text-primary sticky left-0 bg-white z-10">{{ row.unit }}</td>
              <td class="p-4 whitespace-nowrap font-medium">{{ row.owner }}</td>
              <td v-for="(status, index) in row.months" :key="index" class="p-4 text-center transition-colors relative"
                :class="isCurrentMonth(index) ? 'bg-primary/5' : ''">
                <button 
                  v-if="status === 'paid'"
                  @click="handleShowReceipt(row, index + 1)"
                  class="group relative"
                >
                  <span class="material-symbols-outlined text-emerald-500 group-hover:scale-125 transition-transform">check_circle</span>
                  <span class="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    View Receipt
                  </span>
                </button>
                <span v-else class="material-symbols-outlined" :class="getStatusIcon(status).class">{{ getStatusIcon(status).icon }}</span>
              </td>
              <td class="p-4 text-center bg-primary/5">
                <button 
                  v-if="row.thr === 'paid'"
                  @click="handleShowReceipt(row, null)"
                  class="group relative"
                >
                  <span class="material-symbols-outlined text-emerald-500 group-hover:scale-125 transition-transform">check_circle</span>
                </button>
                <span v-else class="material-symbols-outlined" :class="getStatusIcon(row.thr).class">{{ getStatusIcon(row.thr).icon }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Receipt Preview Modal (Client Only to prevent jsPDF SSR crash) -->
      <ClientOnly>
        <ModalsReceiptPreviewModal 
          :is-open="isReceiptModalOpen" 
          :receipt-data="selectedReceiptData" 
          @close="isReceiptModalOpen = false" 
        />
      </ClientOnly>

      <!-- Legend -->
      <div class="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-primary/10 flex flex-wrap items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        <div class="flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[16px] text-emerald-500">check_circle</span>
          Paid
        </div>
        <div class="flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[16px] text-amber-500">warning</span>
          Late
        </div>
        <div class="flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[16px] text-rose-500">close</span>
          Unpaid
        </div>
        <div class="flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[16px] text-slate-300 dark:text-slate-700">radio_button_unchecked</span>
          Upcoming
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'app',
  middleware: ['auth']
})

const { isAdmin, unitId, unitCode, displayName } = useAuth()
const supabase = useSupabaseClient()
const { getReceiptByObligation, generateReceipt } = useReceiptService()

const currentYear = ref(new Date().getFullYear())
const availableYears = [2024, 2025, 2026]
const trackerData = ref([])
const isLoading = ref(true)
const searchQuery = ref("")
const showFilterPanel = ref(false)
const activeTypeFilters = ref([])
const monthHeaders = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Receipt State
const isReceiptModalOpen = ref(false)
const selectedReceiptData = ref(null)

const isCurrentMonth = (index) => {
  const now = new Date()
  return currentYear.value === now.getFullYear() && index === now.getMonth()
}

const typeFilterOptions = [
  { prefix: "A", label: "Rumah A" },
  { prefix: "B", label: "Rumah B" },
  { prefix: "R", label: "Ruko R" },
]

function toggleTypeFilter(prefix) {
  const idx = activeTypeFilters.value.indexOf(prefix)
  if (idx > -1) activeTypeFilters.value.splice(idx, 1)
  else activeTypeFilters.value.push(prefix)
}

const filteredTrackerData = computed(() => {
  let data = trackerData.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    data = data.filter(r => r.unit.toLowerCase().includes(q) || r.owner.toLowerCase().includes(q))
  }
  if (activeTypeFilters.value.length > 0) {
    data = data.filter(r => activeTypeFilters.value.some(p => r.unit.startsWith(p)))
  }
  return data
})

function getStatusIcon(status) {
  switch (status) {
    case "paid": return { icon: "check_circle", class: "text-emerald-500" }
    case "late": return { icon: "warning", class: "text-amber-500" }
    case "unpaid": return { icon: "close", class: "text-rose-500" }
    default: return { icon: "radio_button_unchecked", class: "text-slate-300" }
  }
}

const getUnpaidMark = (obYear, obMonth) => {
  const today = new Date();
  const currentY = today.getFullYear();
  const currentM = today.getMonth() + 1; // 1-indexed

  if (obYear > currentY || (obYear === currentY && obMonth >= currentM)) {
    return "upcoming";
  }
  
  const monthsDiff = currentY * 12 + currentM - (obYear * 12 + obMonth);
  if (monthsDiff < 2 && monthsDiff > 0) return "late";
  return "unpaid";
}

const getThrMark = (obYear) => {
  const currentY = new Date().getFullYear();
  if (obYear > currentY) return "upcoming";
  if (obYear === currentY) return "late";
  return "unpaid";
}

async function fetchTrackerData() {
  isLoading.value = true
  try {
    const rpcName = isAdmin.value ? 'get_admin_tracker' : 'get_resident_tracker'
    const rpcParams = isAdmin.value ? { p_year: currentYear.value } : { p_unit_id: unitId.value, p_year: currentYear.value }
    
    const { data, error } = await supabase.rpc(rpcName, rpcParams)
    if (error) throw error

    trackerData.value = (data || []).map(row => ({
      // get_resident_tracker doesn't return unit_id — fallback to the auth unitId for residents
      unit_id: row.unit_id ?? unitId.value,
      unit: row.unit_code,
      owner: row.owner_name,
      months: [row.month_1, row.month_2, row.month_3, row.month_4, row.month_5, row.month_6, row.month_7, row.month_8, row.month_9, row.month_10, row.month_11, row.month_12]
        .map((m, i) => m ? "paid" : getUnpaidMark(currentYear.value, i + 1)),
      thr: row.thr_status ? "paid" : getThrMark(currentYear.value)
    }))
  } catch (err) {
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

async function handleShowReceipt(row, monthIndex) {
  // Guard: must have a unit ID to look up obligations
  const resolvedUnitId = row.unit_id || unitId.value;
  if (!resolvedUnitId) {
    console.warn('Cannot show receipt: no unit ID available');
    return;
  }

  try {
    isReceiptModalOpen.value = true;   // Open modal immediately to show loading state
    selectedReceiptData.value = null;  // null = loading

    // 1. Find the paid obligation
    let query = supabase
      .from('payment_obligations')
      .select('id, amount, year, month_index, event:payment_events(display_name, key)')
      .eq('unit_id', resolvedUnitId)
      .eq('year', currentYear.value)
      .eq('status', true);

    if (monthIndex) {
      // Monthly IPL obligation
      query = query.eq('month_index', monthIndex);
    } else {
      // THR: month_index is null (annual event)
      query = query.is('month_index', null);
    }

    const { data: obligation, error } = await query.maybeSingle();

    if (error) throw error;
    if (!obligation) throw new Error('Paid obligation not found. It may have been recorded differently.');

    // 2. Generate or fetch existing receipt (idempotent)
    const res = await generateReceipt({
      obligation_id: obligation.id,
      unit_id: resolvedUnitId,
      unit_code: row.unit,
      owner_name: row.owner,
      amount: obligation.amount || (row.unit.startsWith('R') ? 250000 : 170000),
      description: monthIndex
        ? `Iuran Bulanan ${monthHeaders[monthIndex - 1]} ${currentYear.value}`
        : `${obligation.event?.display_name || 'THR'} ${currentYear.value}`,
    });

    if (res.success && res.data) {
      selectedReceiptData.value = res.data;
    } else {
      throw new Error(res.error || 'Failed to generate receipt');
    }
  } catch (err) {
    console.error('Receipt generation failed:', err);
    isReceiptModalOpen.value = false;
    selectedReceiptData.value = null;
  }
}

function exportToCSV() {
  // Implementation similar to old view
}

onMounted(fetchTrackerData)
watch(currentYear, fetchTrackerData)
</script>

<style scoped>
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s; overflow: hidden; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; max-height: 0; }
</style>
