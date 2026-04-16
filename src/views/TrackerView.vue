<template>
  <div class="tracker-view p-4 md:p-8">
    <!-- Header Row -->
    <div class="flex flex-col gap-4 mb-6">
      <div class="flex items-end justify-between">
        <div>
          <div class="flex items-center gap-3">
            <h3 class="text-2xl font-black tracking-tight">Payment Tracker</h3>
            <select
              v-model="currentYear"
              class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg px-3 py-1 text-sm font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer hover:border-primary/30"
              style="padding-right: 30px"
            >
              <option v-for="year in availableYears" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
          </div>
          <p class="text-slate-500 text-sm mt-1">
            Detailed status of Monthly IPL &amp; Special Fees
          </p>
        </div>
      </div>

      <!-- Search + Actions Bar -->
      <div class="flex flex-col md:flex-row md:items-center gap-3 w-full">
        <!-- Search (always visible for all roles) -->
        <div class="relative w-full md:w-72">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] pointer-events-none">
            search
          </span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search unit or owner..."
            class="h-10 w-full pl-10 pr-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
          />
        </div>

        <!-- Export CSV + Filter (admin only) -->
        <div v-if="isAdmin" class="flex items-center gap-2 ml-auto">
          <button
            @click="exportToCSV"
            class="h-10 flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95"
          >
            <span class="material-symbols-outlined text-[18px]">download</span>
            <span class="hidden sm:inline">Export CSV</span>
          </button>

          <button
            @click="showFilterPanel = !showFilterPanel"
            :class="[
              'h-10 flex items-center gap-2 px-4 rounded-lg text-sm font-semibold transition-all shadow-sm active:scale-95',
              showFilterPanel || hasActiveFilters
                ? 'bg-primary text-white border border-primary hover:bg-primary/90'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            ]"
          >
            <span class="material-symbols-outlined text-[18px]">filter_list</span>
            <span>Filter</span>
            <span
              v-if="hasActiveFilters"
              class="ml-1 bg-white/20 text-[10px] font-black px-1.5 py-0.5 rounded-full"
            >{{ activeFilterCount }}</span>
          </button>
        </div>
      </div>

      <!-- Filter Panel (admin only, slides down) -->
      <transition name="slide-down">
        <div
          v-if="isAdmin && showFilterPanel"
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-5 space-y-5"
        >
          <!-- Unit Type Toggle Pills -->
          <div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Unit Type</p>
            <div class="flex flex-wrap gap-2">
              <button
                @click="clearTypeFilters"
                :class="[
                  'px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all',
                  activeTypeFilters.length === 0
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                ]"
              >
                All Types
              </button>
              <button
                v-for="filter in typeFilterOptions"
                :key="filter.prefix"
                @click="toggleTypeFilter(filter.prefix)"
                :class="[
                  'px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all',
                  activeTypeFilters.includes(filter.prefix)
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                ]"
              >
                {{ filter.label }}
              </button>
            </div>
          </div>

          <!-- Month Bills Filter -->
          <div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Month Bills (Unpaid/Late Count)</p>
            <div class="flex items-center gap-3">
              <select
                v-model="monthBillsOperator"
                class="h-10 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                <option value="gte">≥ More than or equal</option>
                <option value="lte">≤ Less than or equal</option>
                <option value="eq">= Exact</option>
              </select>
              <input
                v-model.number="monthBillsValue"
                type="number"
                min="0"
                max="13"
                placeholder="e.g. 2"
                class="h-10 w-24 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                v-if="monthBillsValue !== null && monthBillsValue !== ''"
                @click="monthBillsValue = null"
                class="h-10 px-3 text-slate-400 hover:text-rose-500 transition-colors"
                title="Clear"
              >
                <span class="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </div>

          <!-- Filter Summary (shown when any filter is active) -->
          <div
            v-if="hasActiveFilters"
            class="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700"
          >
            <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[16px] text-primary">info</span>
                <span class="font-bold text-slate-700 dark:text-slate-300">
                  Showing {{ filteredTrackerData.length }} units
                </span>
              </div>
              <span class="text-slate-300 dark:text-slate-600 hidden sm:inline">|</span>
              <span v-if="filterSummary.rumahCount > 0" class="text-xs font-bold text-slate-500">
                {{ filterSummary.rumahCount }} Rumah (A/B)
              </span>
              <span v-if="filterSummary.rumahCount > 0 && filterSummary.rukoCount > 0" class="text-slate-300 text-xs">+</span>
              <span v-if="filterSummary.rukoCount > 0" class="text-xs font-bold text-slate-500">
                {{ filterSummary.rukoCount }} Ruko (R)
              </span>
              <span class="text-slate-300 dark:text-slate-600 hidden sm:inline">|</span>
              <span class="text-xs font-black text-rose-600">
                Total Debt: Rp {{ formatNumber(filterSummary.totalDebt) }}
              </span>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- Main Table Card -->
    <div
      class="bg-white dark:bg-slate-900 rounded-xl border border-primary/10 shadow-sm overflow-hidden mb-6"
    >
      <div class="overflow-x-auto" style="max-width: 100vw">
        <div style="max-height: 60vh; overflow: auto">
          <table class="w-full text-left text-xs border-collapse min-w-max">
            <thead>
              <tr class="bg-slate-50 dark:bg-slate-800/50">
                <th
                  class="p-4 font-bold text-slate-400 uppercase tracking-wider sticky top-0 left-0 bg-slate-50 dark:bg-slate-800 border-r border-primary/10 z-30 w-24"
                >
                  Unit
                </th>
                <th
                  class="p-4 font-bold text-slate-400 uppercase tracking-wider sticky top-0 bg-slate-50 dark:bg-slate-800 z-20 min-w-[150px]"
                >
                  Owner
                </th>
                <th
                  v-for="(m, index) in [
                    'Jan',
                    'Feb',
                    'Mar',
                    'Apr',
                    'May',
                    'Jun',
                    'Jul',
                    'Aug',
                    'Sep',
                    'Oct',
                    'Nov',
                    'Dec',
                    'THR',
                  ]"
                  :key="m"
                  :class="[
                    'p-4 font-bold uppercase tracking-wider text-center w-16 transition-colors sticky top-0 bg-slate-50 dark:bg-slate-800 z-20',
                    isCurrentMonth(index)
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-400',
                  ]"
                >
                  {{ m }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr v-if="isLoading">
                <td colspan="15" class="p-12 text-center">
                  <span
                    class="material-symbols-outlined animate-spin text-3xl text-primary"
                    >refresh</span
                  >
                </td>
              </tr>
              <tr v-else-if="filteredTrackerData.length === 0">
                <td
                  colspan="15"
                  class="p-12 text-center text-slate-400 font-medium"
                >
                  {{ trackerData.length === 0 ? 'No tracking data found for the current year.' : 'No units match the current filters.' }}
                </td>
              </tr>
              <tr
                v-else
                v-for="row in filteredTrackerData"
                :key="row.unit"
                class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all"
              >
                <td
                  class="p-4 font-bold text-primary sticky left-0 bg-white dark:bg-slate-900 border-r border-primary/10 z-10"
                >
                  {{ row.unit }}
                </td>
                <td class="p-4 whitespace-nowrap font-medium">
                  {{ row.owner }}
                </td>
                <td
                  v-for="(status, index) in row.months"
                  :key="index"
                  :class="[
                    'p-4 text-center transition-colors',
                    isCurrentMonth(index) ? 'bg-emerald-500/5' : '',
                  ]"
                >
                  <span
                    class="material-symbols-outlined"
                    :class="getStatusIcon(status).class"
                    >{{ getStatusIcon(status).icon }}</span
                  >
                </td>
                <td
                  class="p-4 text-center bg-primary/5 h-full flex items-center justify-center"
                >
                  <span
                    class="material-symbols-outlined"
                    :class="getStatusIcon(row.thr).class"
                    >{{ getStatusIcon(row.thr).icon }}</span
                  >
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div
        class="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-primary/10 flex flex-wrap items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider"
      >
        <div class="flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[16px] text-emerald-500"
            >check_circle</span
          >
          Paid
        </div>
        <div class="flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[16px] text-amber-500"
            >warning</span
          >
          Late
        </div>
        <div class="flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[16px] text-rose-500"
            >close</span
          >
          Unpaid
        </div>
        <div class="flex items-center gap-1.5">
          <span
            class="material-symbols-outlined text-[16px] text-slate-300 dark:text-slate-700"
            >radio_button_unchecked</span
          >
          Upcoming
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from "vue";
import { useAuth } from "@/composables/useAuth";
import { supabase } from "@/services/supabaseClient.js";

const { isResident, isAdmin, session, displayName, unitCode, unitId } =
  useAuth();

// ── Reactive State ──────────────────────────────────────────
const currentYear = ref(new Date().getFullYear());
const availableYears = ref([
  new Date().getFullYear() - 2,
  new Date().getFullYear() - 1,
  new Date().getFullYear(),
  new Date().getFullYear() + 1,
]);

const trackerData = ref([]);
const isLoading = ref(true);

// ── Filter State ────────────────────────────────────────────
const searchQuery = ref("");
const showFilterPanel = ref(false);
const activeTypeFilters = ref([]); // e.g. ['A', 'B', 'R']
const monthBillsOperator = ref("gte"); // 'gte' | 'lte' | 'eq'
const monthBillsValue = ref(null);

const typeFilterOptions = [
  { prefix: "A", label: "Rumah A" },
  { prefix: "B", label: "Rumah B" },
  { prefix: "R", label: "Ruko R" },
];

// ── Filter Helpers ──────────────────────────────────────────
function toggleTypeFilter(prefix) {
  const idx = activeTypeFilters.value.indexOf(prefix);
  if (idx > -1) {
    activeTypeFilters.value.splice(idx, 1);
  } else {
    activeTypeFilters.value.push(prefix);
  }
}

function clearTypeFilters() {
  activeTypeFilters.value = [];
}

function getUnitRate(unitCode) {
  if (unitCode.startsWith("R")) return 250000;
  return 170000; // A and B
}

function getUnpaidCount(row) {
  const iplUnpaid = row.months.filter(
    (s) => s === "unpaid" || s === "late"
  ).length;
  const thrUnpaid = row.thr === "unpaid" || row.thr === "late" ? 1 : 0;
  return iplUnpaid + thrUnpaid;
}

function getUnitDebt(row) {
  const rate = getUnitRate(row.unit);
  return getUnpaidCount(row) * rate;
}

function formatNumber(val) {
  if (!val && val !== 0) return "0";
  return new Intl.NumberFormat("id-ID").format(Math.abs(val));
}

// ── Computed: Active filter indicators ──────────────────────
const hasActiveFilters = computed(() => {
  return (
    activeTypeFilters.value.length > 0 ||
    (monthBillsValue.value !== null && monthBillsValue.value !== "")
  );
});

const activeFilterCount = computed(() => {
  let count = activeTypeFilters.value.length;
  if (monthBillsValue.value !== null && monthBillsValue.value !== "") count++;
  return count;
});

// ── Computed: Filtered tracker data ─────────────────────────
const filteredTrackerData = computed(() => {
  let data = trackerData.value;

  // 1. Search by unit code or owner name (always active for all roles)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    data = data.filter(
      (row) =>
        row.unit.toLowerCase().includes(q) ||
        row.owner.toLowerCase().includes(q)
    );
  }

  // 2. Unit type filter (admin only, combinable)
  if (activeTypeFilters.value.length > 0) {
    data = data.filter((row) =>
      activeTypeFilters.value.some((prefix) => row.unit.startsWith(prefix))
    );
  }

  // 3. Month bills count filter
  if (monthBillsValue.value !== null && monthBillsValue.value !== "") {
    const target = Number(monthBillsValue.value);
    data = data.filter((row) => {
      const count = getUnpaidCount(row);
      if (monthBillsOperator.value === "gte") return count >= target;
      if (monthBillsOperator.value === "lte") return count <= target;
      return count === target; // 'eq'
    });
  }

  return data;
});

// ── Computed: Summary with A/B vs R breakdown ───────────────
const filterSummary = computed(() => {
  const data = filteredTrackerData.value;
  const rumahUnits = data.filter(
    (r) => r.unit.startsWith("A") || r.unit.startsWith("B")
  );
  const rukoUnits = data.filter((r) => r.unit.startsWith("R"));

  const rumahDebt = rumahUnits.reduce((sum, r) => sum + getUnitDebt(r), 0);
  const rukoDebt = rukoUnits.reduce((sum, r) => sum + getUnitDebt(r), 0);

  return {
    rumahCount: rumahUnits.length,
    rukoCount: rukoUnits.length,
    totalDebt: rumahDebt + rukoDebt,
  };
});

// ── Export CSV ───────────────────────────────────────────────
function exportToCSV() {
  if (filteredTrackerData.value.length === 0) return;

  const monthHeaders = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const headers = [
    "Unit", "Owner", ...monthHeaders, "THR", "Unpaid Bills", "Total Debt (Rp)"
  ];

  const rows = filteredTrackerData.value.map((row) => [
    row.unit,
    row.owner,
    ...row.months.map((s) => s.toUpperCase()),
    row.thr.toUpperCase(),
    getUnpaidCount(row),
    getUnitDebt(row),
  ]);

  const csvContent = [headers, ...rows]
    .map((r) => r.map((c) => `"${c}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `payment_tracker_${currentYear.value}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── UI Helpers ──────────────────────────────────────────────
function isCurrentMonth(index) {
  const isCurrentYr = currentYear.value === new Date().getFullYear();
  const isCurrentMo = index === new Date().getMonth();
  return isCurrentYr && isCurrentMo;
}

function getStatusIcon(status) {
  switch (status) {
    case "paid":
      return { icon: "check_circle", class: "text-emerald-500" };
    case "late":
      return { icon: "warning", class: "text-amber-500" };
    case "unpaid":
      return { icon: "close", class: "text-rose-500" };
    default:
      return {
        icon: "radio_button_unchecked",
        class: "text-slate-300 dark:text-slate-700",
      };
  }
}

function getUnpaidMark(obYear, obMonth) {
  const today = new Date();
  const currentY = today.getFullYear();
  const currentM = today.getMonth() + 1;
  if (obYear > currentY || (obYear === currentY && obMonth >= currentM))
    return "upcoming";
  const monthsDiff = currentY * 12 + currentM - (obYear * 12 + obMonth);
  if (monthsDiff < 2 && monthsDiff > 0) return "late";
  return "unpaid";
}

function getThrMark(obYear) {
  const currentY = new Date().getFullYear();
  if (obYear > currentY) return "upcoming";
  if (obYear === currentY) return "late";
  return "unpaid";
}

// ── Realtime Subscription ───────────────────────────────────
let trackerChannel = null;

const setupRealtimeSubscription = () => {
  if (!session.value) return;

  const options = {
    event: "*",
    schema: "public",
    table: "payment_obligations",
  };

  // 🔒 SECURITY: Residents only listen to THEIR unit. Admins see everything
  if (!isAdmin.value && unitId.value) {
    options.filter = `unit_id=eq.${unitId.value}`;
  }

  // remove previous channel if exists
  if (trackerChannel) {
    try {
      supabase.removeChannel(trackerChannel);
    } catch (e) {
      /* ignore */
    }
    trackerChannel = null;
  }

  trackerChannel = supabase
    .channel("payment-obligation-updates")
    .on("postgres_changes", options, (payload) => {
      // Refresh tracker data when payment obligations change
      fetchTrackerData();
    })
    .subscribe();
};

watch(
  [session, isAdmin, unitId],
  ([newSession, newIsAdmin, newUnitId]) => {
    if (newSession && (newIsAdmin || newUnitId)) {
      setupRealtimeSubscription();
    }
  },
  { immediate: true },
);

onUnmounted(() => {
  if (trackerChannel) supabase.removeChannel(trackerChannel);
  trackerChannel = null;
});

// ── Data Fetching ───────────────────────────────────────────
const fetchTrackerData = async () => {
  isLoading.value = true;

  try {
    if (isAdmin.value) {
      // OPTIMIZED: Use RPC get_admin_tracker() instead of manual queries
      const { data, error } = await supabase.rpc("get_admin_tracker", {
        p_year: currentYear.value,
      });

      if (error) throw error;

      // Transform RPC response into UI format
      trackerData.value = (data || []).map((row) => ({
        unit: row.unit_code,
        owner: row.owner_name,
        months: [
          { status: row.month_1, month: 1 },
          { status: row.month_2, month: 2 },
          { status: row.month_3, month: 3 },
          { status: row.month_4, month: 4 },
          { status: row.month_5, month: 5 },
          { status: row.month_6, month: 6 },
          { status: row.month_7, month: 7 },
          { status: row.month_8, month: 8 },
          { status: row.month_9, month: 9 },
          { status: row.month_10, month: 10 },
          { status: row.month_11, month: 11 },
          { status: row.month_12, month: 12 },
        ].map((m) =>
          m.status ? "paid" : getUnpaidMark(currentYear.value, m.month),
        ),
        thr: row.thr_status ? "paid" : getThrMark(currentYear.value),
      }));
    } else {
      // RESIDENT LOGIC - OPTIMIZED: Use RPC get_resident_tracker()
      if (!unitId.value) {
        console.warn("No Unit ID found for this resident");
        isLoading.value = false;
        return;
      }

      const { data, error } = await supabase.rpc("get_resident_tracker", {
        p_unit_id: unitId.value,
        p_year: currentYear.value,
      });

      if (error) throw error;

      if (!data || data.length === 0) {
        trackerData.value = [];
        isLoading.value = false;
        return;
      }

      const row = data[0];
      trackerData.value = [
        {
          unit: row.unit_code || unitCode.value || "N/A",
          owner: row.owner_name || displayName.value || "Resident",
          months: [
            { status: row.month_1, month: 1 },
            { status: row.month_2, month: 2 },
            { status: row.month_3, month: 3 },
            { status: row.month_4, month: 4 },
            { status: row.month_5, month: 5 },
            { status: row.month_6, month: 6 },
            { status: row.month_7, month: 7 },
            { status: row.month_8, month: 8 },
            { status: row.month_9, month: 9 },
            { status: row.month_10, month: 10 },
            { status: row.month_11, month: 11 },
            { status: row.month_12, month: 12 },
          ].map((m) =>
            m.status ? "paid" : getUnpaidMark(currentYear.value, m.month),
          ),
          thr: row.thr_status ? "paid" : getThrMark(currentYear.value),
        },
      ];
    }
  } catch (error) {
    console.error("Error fetching tracker data:", error.message);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchTrackerData();
});

watch(currentYear, () => {
  fetchTrackerData();
});

// REASON: Auth state can resolve after mount. We must watch and re-fetch.
watch(
  [isAdmin, isResident, unitId],
  ([newAdmin, newRes, newUnitId], [oldAdmin, oldRes, oldUnitId]) => {
    // Only re-fetch if we actually gained meaningful auth state
    if (
      newAdmin !== oldAdmin ||
      newRes !== oldRes ||
      (newRes && newUnitId !== oldUnitId)
    ) {
      fetchTrackerData();
    }
  },
  { immediate: true },
);
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-8px);
}
.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  max-height: 500px;
}
</style>