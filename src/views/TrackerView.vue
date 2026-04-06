<template>
  <div class="tracker-view p-4 md:p-8">
    <div class="flex items-end justify-between mb-6">
      <div>
        <div class="flex items-center gap-3">
          <h3 class="text-2xl font-black tracking-tight">Payment Tracker</h3>
          <select
            v-model="currentYear"
            class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg px-3 py-1 text-sm font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer hover:border-primary/30"
          >
            <option v-for="year in availableYears" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
        </div>
        <p class="text-slate-500 text-sm mt-1">
          Detailed status of Monthly IPL & Special Fees
        </p>
      </div>
      <div class="flex gap-2">
        <button
          class="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-primary/10 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <span class="material-symbols-outlined text-[18px]">filter_list</span>
          Filter Block
        </button>
        <button
          class="flex items-center gap-2 bg-primary text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors"
        >
          <span class="material-symbols-outlined text-[18px]">download</span>
          Export Tracker
        </button>
      </div>
    </div>

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
              <tr v-else-if="trackerData.length === 0">
                <td
                  colspan="15"
                  class="p-12 text-center text-slate-400 font-medium"
                >
                  No tracking data found for the current year.
                </td>
              </tr>
              <tr
                v-else
                v-for="row in trackerData"
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
import { ref, onMounted, watch } from "vue";
import { useAuth } from "@/composables/useAuth";
import { supabase } from "@/services/supabaseClient.js";

const { isResident, isAdmin, session, displayName, unitCode, unitId } =
  useAuth();

const currentYear = ref(new Date().getFullYear());
const availableYears = ref([
  new Date().getFullYear() - 1,
  new Date().getFullYear(),
  new Date().getFullYear() + 1,
]);

// Dynamic helper for UI column highlighting
function isCurrentMonth(index) {
  const isCurrentYear = currentYear.value === new Date().getFullYear();
  const isCurrentMonth = index === new Date().getMonth();
  return isCurrentYear && isCurrentMonth;
}

const trackerData = ref([]);
const isLoading = ref(true);

// Setup realtime subscription for transactions
const setupRealtimeSubscription = () => {
  if (!session.value) return; // Don't subscribe if not authenticated

  const options = {
    event: "*",
    schema: "public",
    table: "transactions",
  };

  // 🔒 SECURITY: Residents only listen to THEIR unit. Admins see everything
  if (!isAdmin.value && unitId.value) {
    options.filter = `unit_id=eq.${unitId.value}`;
  }

  supabase
    .channel("transaction-updates")
    .on("postgres_changes", options, (payload) => {
      // Refresh tracker data when transactions change
      fetchTrackerData();
    })
    .subscribe();
};

// Watch for auth changes and setup subscription when ready
watch(
  [session, isAdmin, unitId],
  ([newSession, newIsAdmin, newUnitId]) => {
    if (newSession && (newIsAdmin || newUnitId)) {
      setupRealtimeSubscription();
    }
  },
  { immediate: true },
);

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

// NEW ONE
const fetchTrackerData = async () => {
  isLoading.value = true;

  try {
    if (isAdmin.value) {
      // 1. Fetch units
      const { data: units, error: unitErr } = await supabase
        .from("units")
        .select("id, code, name, no_sequence_unit")
        .order("no_sequence_unit");

      if (unitErr) throw unitErr;

      // 2. Fetch obligations
      const { data: obligations, error: obErr } = await supabase
        .from("payment_obligations")
        .select(
          "id, status, unit_id, month_index, year, event_id, event:payment_events(key)",
        )
        .eq("year", currentYear.value); // Filter in DB, not JS for better performance

      if (obErr) throw obErr;

      // 3. Build matrix
      trackerData.value = (units || []).map((u) => {
        const uObs = obligations.filter((o) => o.unit_id === u.id);

        const thrOb = uObs.find(
          (o) =>
            o.event_id === 1 || o.event?.id === 1 || o.event?.key === "thr",
        );
        let thrMark = thrOb
          ? thrOb.status === true
            ? "paid"
            : getThrMark(currentYear.value)
          : "upcoming";

        return {
          unit: u.code,
          owner: u.name,
          months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => {
            const mOb = uObs.find(
              (o) =>
                (o.event_id === 2 ||
                  o.event?.id === 2 ||
                  o.event?.key === "ipl") &&
                o.month_index === m,
            );
            if (!mOb) return "upcoming";
            return mOb.status === true
              ? "paid"
              : getUnpaidMark(currentYear.value, m);
          }),
          thr: thrMark,
        };
      });
    } else {
      // RESIDENT LOGIC
      if (!unitId.value) {
        console.warn("No Unit ID found for this resident");
        isLoading.value = false;
        return;
      }

      const { data: obligations, error: resErr } = await supabase
        .from("payment_obligations")
        .select(
          "id, status, month_index, year, event_id, event:payment_events(key)",
        )
        .eq("unit_id", unitId.value)
        .eq("year", currentYear.value);

      if (resErr) throw resErr;

      const thrOb = obligations.find(
        (o) =>
          o.event_id === 1 ||
          o.event?.key === "thr" ||
          o.payment_events?.key === "thr",
      );
      let thrMark = thrOb
        ? thrOb.status === true
          ? "paid"
          : getThrMark(currentYear.value)
        : "upcoming";

      trackerData.value = [
        {
          unit: unitCode.value || "N/A",
          owner: displayName.value || "Resident",
          months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => {
            const mOb = obligations.find(
              (o) =>
                (o.event_id === 2 ||
                  o.event?.key === "ipl" ||
                  o.payment_events?.key === "ipl") &&
                o.month_index === m,
            );
            if (!mOb) return "upcoming";
            return mOb.status === true
              ? "paid"
              : getUnpaidMark(currentYear.value, m);
          }),
          thr: thrMark,
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

// Updated icon helper to match the strings we created above
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
</script>
