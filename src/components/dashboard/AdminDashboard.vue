<template>
  <div class="admin-dashboard space-y-8 pb-12">
    <!-- Financial Overview -->
    <section>
      <div class="flex items-end justify-between mb-6">
        <div>
          <h3 class="text-2xl font-black tracking-tight">Financial Overview</h3>
          <p class="text-slate-500 text-sm">
            Real-time fiscal monitoring and balance reporting.
          </p>
        </div>
        <div class="flex gap-2">
          <button
            @click="$router.push('/app/history')"
            class="px-4 py-2 bg-white dark:bg-slate-800 border border-primary/10 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
          >
            <span class="material-symbols-outlined text-sm">download</span>
            Export Report
          </button>
          <button
            @click="$router.push('/app/transactions')"
            class="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 transition-all flex items-center gap-2"
          >
            <span class="material-symbols-outlined text-sm">add</span> New Entry
          </button>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-primary/10 shadow-sm relative overflow-hidden group"
        >
          <div
            class="absolute top-0 right-0 p-4 opacity-10 text-primary group-hover:scale-110 transition-transform"
          >
            <span class="material-symbols-outlined text-6xl"
              >account_balance_wallet</span
            >
          </div>
          <p
            class="text-sm font-medium text-slate-500 mb-1 uppercase tracking-wider"
          >
            Main Balance
          </p>
          <div
            v-if="isLoading"
            class="h-8 w-32 bg-slate-100 dark:bg-slate-800 animate-pulse rounded mb-2"
          ></div>
          <h4
            v-else
            class="font-bold mb-2"
            :style="{ fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)' }"
          >
            Rp {{ formatNumber(mainBalance) }}
          </h4>
          <div class="flex items-center gap-2">
            <span
              class="text-emerald-500 flex items-center text-xs font-bold bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded"
            >
              <span class="material-symbols-outlined text-xs mr-1">public</span>
              Global Kas
            </span>
            <span class="text-slate-400 text-[10px]">Community Total</span>
          </div>
        </div>

        <div
          class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-primary/10 shadow-sm relative overflow-hidden group ring-2 ring-primary ring-offset-2 ring-offset-transparent dark:ring-offset-slate-900"
        >
          <div
            class="absolute top-0 right-0 p-4 opacity-10 text-primary group-hover:scale-110 transition-transform"
          >
            <span class="material-symbols-outlined text-6xl">build_circle</span>
          </div>
          <div class="flex justify-between items-start mb-1">
            <p
              class="text-sm font-medium text-slate-500 uppercase tracking-wider"
            >
              Sinking Fund
            </p>
          </div>
          <div
            v-if="isLoading"
            class="h-8 w-32 bg-slate-100 dark:bg-slate-800 animate-pulse rounded mb-2"
          ></div>
          <h4
            v-else
            class="font-bold mb-2 text-primary"
            :style="{ fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)' }"
          >
            Rp {{ formatNumber(sinkingFund) }}
          </h4>
          <div class="flex items-center gap-2">
            <span class="text-primary flex items-center text-xs font-bold">
              Iuran Lainnya
            </span>
            <span class="text-slate-400 text-[10px] hidden sm:block"
              >Aggregated</span
            >
          </div>
        </div>

        <div
          class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-primary/10 shadow-sm relative overflow-hidden group"
        >
          <div
            class="absolute top-0 right-0 p-4 opacity-10 text-primary group-hover:scale-110 transition-transform"
          >
            <span class="material-symbols-outlined text-6xl"
              >volunteer_activism</span
            >
          </div>
          <p
            class="text-sm font-medium text-slate-500 mb-1 uppercase tracking-wider"
          >
            Other Income
          </p>
          <div
            v-if="isLoading"
            class="h-8 w-32 bg-slate-100 dark:bg-slate-800 animate-pulse rounded mb-2"
          ></div>
          <h4
            v-else
            class="font-bold mb-2"
            :style="{ fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)' }"
          >
            Rp {{ formatNumber(otherIncome) }}
          </h4>
          <div class="flex items-center gap-2">
            <span class="text-emerald-500 flex items-center text-xs font-bold">
              Miscellaneous
            </span>
            <span class="text-slate-400 text-[10px]">Non-IPL/THR</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Income vs Expense & Stats -->
    <section class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div
        class="bg-white dark:bg-slate-900 p-8 rounded-xl border border-primary/10 shadow-sm"
      >
        <div class="flex items-center justify-between mb-8">
          <div>
            <h4 class="font-bold text-lg">Income vs Expense</h4>
            <p class="text-xs text-slate-500 font-medium">
              Monthly Performance Analysis
            </p>
          </div>
          <select
            class="bg-slate-100 dark:bg-slate-800 border-none text-xs rounded-lg font-bold py-1.5 pl-3 pr-8 focus:ring-primary/20 cursor-pointer"
          >
            <option>Year 2026</option>
            <option>Year 2025</option>
          </select>
        </div>
        <div class="h-64 flex flex-col gap-4">
          <div v-if="isLoading" class="flex-1 flex items-center justify-center">
            <span class="material-symbols-outlined animate-spin text-primary"
              >loading</span
            >
          </div>
          <div v-else class="flex items-end justify-between flex-1 gap-2">
            <div
              v-for="m in monthlyData.slice(0, 6)"
              :key="m.month"
              class="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg relative group flex flex-col justify-end overflow-hidden"
              :style="`height: 100%`"
              :title="`Income: ${formatNumber(m.income)}, Expense: ${formatNumber(m.expense)}`"
            >
              <!-- Income Bar -->
              <div
                class="bg-primary/80 w-full rounded-t-lg transition-all absolute bottom-0"
                :style="`height: ${calculateBarHeight(m.income)}%`"
              ></div>
              <!-- Expense Overlay (Semi-transparent red) -->
              <div
                class="bg-red-500/40 w-full absolute bottom-0 border-t border-red-400/20"
                :style="`height: ${calculateBarHeight(m.expense)}%`"
              ></div>
            </div>
          </div>
          <div
            class="flex justify-between text-[10px] font-bold text-slate-400 tracking-tighter uppercase px-1"
          >
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span
            ><span>May</span><span>Jun</span>
          </div>
        </div>
        <div class="mt-6 flex gap-4">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 bg-primary rounded-full"></span>
            <span class="text-xs font-medium">Income</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 bg-red-400/50 rounded-full"></span>
            <span class="text-xs font-medium">Expense</span>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <!-- MTD Income -->
        <div
          class="bg-white dark:bg-slate-900 p-6 text-center md:text-left rounded-xl border border-primary/10 shadow-sm flex flex-col justify-between"
        >
          <p class="text-xs font-bold text-slate-400 uppercase">MTD Income</p>
          <div
            v-if="isLoading"
            class="h-6 w-24 bg-slate-100 dark:bg-slate-800 animate-pulse rounded mt-2 mx-auto md:mx-0"
          ></div>
          <h5
            v-else
            class="text-lg md:text-xl font-bold mt-2 text-emerald-600 dark:text-emerald-400"
          >
            Rp {{ formatNumber(mtdIncome) }}
          </h5>
          <p class="text-[10px] text-slate-400 font-medium mt-1">
            Month to Date
          </p>
        </div>
        <!-- MTD Expense -->
        <div
          class="bg-white dark:bg-slate-900 p-6 text-center md:text-left rounded-xl border border-primary/10 shadow-sm flex flex-col justify-between"
        >
          <p class="text-xs font-bold text-slate-400 uppercase">MTD Expense</p>
          <div
            v-if="isLoading"
            class="h-6 w-24 bg-slate-100 dark:bg-slate-800 animate-pulse rounded mt-2 mx-auto md:mx-0"
          ></div>
          <h5 v-else class="text-lg md:text-xl font-bold mt-2 text-rose-500">
            Rp {{ formatNumber(mtdExpense) }}
          </h5>
          <p class="text-[10px] text-slate-400 font-medium mt-1">
            Month to Date
          </p>
        </div>
        <!-- YTD Income -->
        <div
          class="bg-white dark:bg-slate-900 p-6 text-center md:text-left rounded-xl border border-primary/10 shadow-sm flex flex-col justify-between"
        >
          <p class="text-xs font-bold text-slate-400 uppercase">YTD Income</p>
          <div
            v-if="isLoading"
            class="h-6 w-24 bg-slate-100 dark:bg-slate-800 animate-pulse rounded mt-2 mx-auto md:mx-0"
          ></div>
          <h5
            v-else
            class="text-lg md:text-xl font-bold mt-2 text-emerald-600 dark:text-emerald-400"
          >
            Rp {{ formatNumber(ytdIncome) }}
          </h5>
          <p class="text-[10px] text-slate-400 font-medium mt-1">
            Year to Date (Current Year)
          </p>
        </div>
        <!-- YTD Expense -->
        <div
          class="bg-white dark:bg-slate-900 p-6 text-center md:text-left rounded-xl border border-primary/10 shadow-sm flex flex-col justify-between"
        >
          <p class="text-xs font-bold text-slate-400 uppercase">YTD Expense</p>
          <div
            v-if="isLoading"
            class="h-6 w-24 bg-slate-100 dark:bg-slate-800 animate-pulse rounded mt-2 mx-auto md:mx-0"
          ></div>
          <h5 v-else class="text-lg md:text-xl font-bold mt-2 text-rose-500">
            Rp {{ formatNumber(ytdExpense) }}
          </h5>
          <p class="text-[10px] text-slate-400 font-medium mt-1">
            Year to Date (Current Year)
          </p>
        </div>
      </div>
    </section>

    <!-- CMS Bulletin Board Preview -->
    <section class="space-y-6">
      <div class="flex items-end justify-between">
        <div>
          <h3 class="text-2xl font-black tracking-tight">
            Permata Tajur Townhouse<br />
            <span class="text-primary text-md">Bulletin Board</span>
          </h3>
          <p class="text-slate-500 text-sm">
            Manage announcements and community updates.
          </p>
        </div>
        <router-link
          to="/app/cms"
          class="text-primary text-sm font-semibold hover:underline"
          >Go to Bulletin Board</router-link
        >
      </div>

      <div
        v-if="latestBulletin"
        class="bg-white dark:bg-slate-900 border border-primary/10 rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row group cursor-pointer"
        @click="selectedBulletin = latestBulletin"
      >
        <!-- Media Preview Box, enlarged -->
        <div
          class="w-full md:w-1/3 lg:w-80 h-56 md:h-auto bg-slate-100 dark:bg-slate-800 relative shrink-0 overflow-hidden"
        >
          <!-- Image -->
          <img
            v-if="getFileType(latestBulletin.content_url) === 'image'"
            :src="latestBulletin.content_url"
            alt="Bulletin"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <!-- Video -->
          <video
            v-else-if="getFileType(latestBulletin.content_url) === 'video'"
            :src="latestBulletin.content_url"
            class="w-full h-full object-cover"
            controls
            preload="metadata"
            @click.stop
          ></video>
          <!-- PDF -->
          <div
            v-else-if="getFileType(latestBulletin.content_url) === 'pdf'"
            class="w-full h-full flex flex-col items-center justify-center bg-rose-50 dark:bg-rose-900/20"
          >
            <span class="material-symbols-outlined text-5xl text-rose-500"
              >picture_as_pdf</span
            >
            <p class="text-xs font-bold text-rose-500 mt-2">PDF Document</p>
          </div>
          <!-- None -->
          <div v-else class="w-full h-full flex items-center justify-center">
            <span class="material-symbols-outlined text-slate-400 text-4xl"
              >newspaper</span
            >
          </div>
          <div
            class="absolute top-3 left-3 px-2 py-1 bg-primary text-white text-[9px] font-black uppercase tracking-wider rounded shadow-sm"
          >
            Latest Update
          </div>
        </div>
        <div class="p-6 md:p-8 flex flex-col justify-center flex-1">
          <div class="flex items-center gap-2 mb-2">
            <span
              class="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
              >{{ formatDate(latestBulletin.created_at) }}</span
            >
            <span
              class="text-[10px] font-bold text-primary uppercase tracking-widest"
              >• {{ latestBulletin.category || "General" }}</span
            >
          </div>
          <h4
            class="text-xl md:text-2xl font-bold mb-3 md:mb-4 group-hover:text-primary transition-colors"
          >
            {{ latestBulletin.title }}
          </h4>
          <p
            class="text-sm md:text-base text-slate-500 dark:text-slate-400 line-clamp-4 md:line-clamp-none max-w-3xl mb-6 relative z-10 p-0 m-0"
            v-html="latestBulletin.content"
          ></p>
          <div class="flex items-center gap-4 mt-auto">
            <span
              :class="[
                'px-2 py-1 text-[9px] font-black uppercase tracking-wider rounded',
                latestBulletin.is_published
                  ? 'bg-emerald-500 text-white'
                  : 'bg-amber-500 text-white',
              ]"
            >
              {{ latestBulletin.is_published ? "Published" : "Draft" }}
            </span>
            <span
              class="text-[10px] font-bold text-slate-400 flex items-center gap-1.5"
            >
              <span class="material-symbols-outlined text-sm">campaign</span>
              Posted by Management
            </span>
          </div>
        </div>
      </div>

      <div
        v-else
        class="bg-white dark:bg-slate-900 p-8 rounded-xl border border-primary/10 border-dashed flex flex-col items-center justify-center min-h-[200px] text-slate-400"
      >
        <span class="material-symbols-outlined text-4xl mb-2">newspaper</span>
        <p class="text-sm font-medium">
          No announcements have been posted yet.
        </p>
        <router-link
          to="/app/cms"
          class="mt-4 text-primary text-xs font-bold hover:underline"
          >Create First Bulletin</router-link
        >
      </div>
    </section>

    <!-- Recent Transactions -->
    <section>
      <div
        class="bg-white dark:bg-slate-900 rounded-xl border border-primary/10 shadow-sm overflow-hidden"
      >
        <div
          class="p-6 border-b border-primary/10 flex justify-between items-center"
        >
          <div>
            <h3 class="text-lg font-bold">Recent Transactions</h3>
            <p class="text-sm text-slate-500">
              Latest financial activities across the community
            </p>
          </div>
          <router-link
            to="/app/history"
            class="px-4 py-2 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors"
          >
            View All
          </router-link>
        </div>

        <div v-if="isLoading" class="p-12 flex justify-center">
          <span
            class="material-symbols-outlined animate-spin text-3xl text-primary"
            >refresh</span
          >
        </div>
        <div
          v-else-if="recentTransactions.length === 0"
          class="p-12 text-center text-slate-400 font-medium"
        >
          No recent transactions.
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-50 dark:bg-slate-800/50">
                <th
                  class="p-4 font-bold text-slate-400 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  class="p-4 font-bold text-slate-400 uppercase tracking-wider"
                >
                  Unit / Recipient
                </th>
                <th
                  class="p-4 font-bold text-slate-400 uppercase tracking-wider"
                >
                  Description
                </th>
                <th
                  class="p-4 font-bold text-slate-400 uppercase tracking-wider text-right"
                >
                  Amount
                </th>
                <th
                  class="p-4 font-bold text-slate-400 uppercase tracking-wider text-center"
                >
                  Type
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr
                v-for="tx in recentTransactions"
                :key="tx.id"
                class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all"
              >
                <td class="p-4 whitespace-nowrap">
                  {{ formatDate(tx.transaction_date) }}
                </td>
                <td class="p-4 font-bold text-primary">
                  {{
                    tx.recipient ||
                    (tx.description?.includes("-")
                      ? tx.description.split("-")[0].trim()
                      : "System")
                  }}
                </td>
                <td
                  class="p-4 font-medium max-w-xs truncate"
                  :title="tx.description"
                >
                  {{
                    tx.description ||
                    (tx.type === "deposit" ? "Income" : "Expense")
                  }}
                </td>
                <td
                  class="p-4 text-right font-bold"
                  :class="
                    tx.type === 'deposit' ? 'text-emerald-500' : 'text-rose-500'
                  "
                >
                  {{ tx.type === "deposit" ? "+" : "-" }} Rp
                  {{ formatNumber(Math.abs(tx.amount)) }}
                </td>
                <td class="p-4 text-center">
                  <span
                    v-if="tx.type === 'deposit'"
                    class="px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded text-[10px] font-bold"
                    >INCOME</span
                  >
                  <span
                    v-else
                    class="px-2 py-0.5 bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 rounded text-[10px] font-bold"
                    >EXPENSE</span
                  >
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
    <!-- The New Full Detail Modal -->
    <BulletinDetailModal
      v-if="selectedBulletin"
      :bulletin="selectedBulletin"
      @close="selectedBulletin = null"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { supabase } from "@/services/supabaseClient.js";
import {
  getKasBalance,
  getTransactions,
  getKasBalanceByDateRange,
  getMonthlyPerformance,
} from "@/services/transactionService.js";
import { getBulletins } from "@/services/bulletinService.js";
import BulletinDetailModal from "@/components/common/BulletinDetailModal.vue";

// Reactive State
const mainBalance = ref(0);
const sinkingFund = ref(0);
const otherIncome = ref(0);

const mtdIncome = ref(0);
const mtdExpense = ref(0);
const ytdIncome = ref(0);
const ytdExpense = ref(0);

const recentTransactions = ref([]);
const monthlyData = ref([]);
const selectedBulletin = ref(null);
const latestBulletin = ref(null);
const isLoading = ref(true);

const maxChartValue = ref(1000000); // Default scaling baseline

function calculateBarHeight(value) {
  if (!value) return 0;
  return Math.min(100, (value / maxChartValue.value) * 100);
}

function formatNumber(val) {
  if (!val && val !== 0) return "0";
  return new Intl.NumberFormat("id-ID").format(val);
}

function formatDate(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getFileType(url) {
  if (!url) return "none";
  const lower = url.toLowerCase();
  if (/\.(jpg|jpeg|png|gif|webp|svg|bmp|avif)(\?|$)/i.test(lower))
    return "image";
  if (/\.(mp4|webm|mov|avi|mkv|ogg)(\?|$)/i.test(lower)) return "video";
  if (/\.pdf(\?|$)/i.test(lower)) return "pdf";
  if (
    lower.includes("youtube.com") ||
    lower.includes("youtu.be") ||
    lower.includes("vimeo.com")
  )
    return "video";
  if (lower.includes("/storage/") && !lower.includes(".pdf")) return "image";
  return "unknown";
}

async function fetchDashboardData() {
  isLoading.value = true;
  try {
    // 1. Global Kas Balance tracking
    const kasRes = await getKasBalance();
    if (kasRes.success) {
      mainBalance.value = kasRes.balance;
    }
    // 2. Extrapolate Sinking Fund & Other Income from Deposits
    const { data: deposits } = await supabase
      .from("transactions")
      .select("amount, description")
      .eq("type", "deposit");
    if (deposits) {
      sinkingFund.value = deposits
        .filter((d) => d.description && d.description.includes("Iuran Lainnya"))
        .reduce((sum, d) => sum + (d.amount || 0), 0);
      otherIncome.value = deposits
        .filter((d) => {
          const desc = d.description || "";
          return (
            !desc.includes("IPL") &&
            !desc.includes("THR") &&
            !desc.includes("Iuran Lainnya")
          );
        })
        .reduce((sum, d) => sum + (d.amount || 0), 0);
    }
    // 3. Month-to-Date and Year-to-Date Calcs
    const now = new Date();
    const mtdStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    ).toISOString();
    const currentISO = now.toISOString();
    const mtdRes = await getKasBalanceByDateRange(mtdStart, currentISO);
    if (mtdRes.success) {
      mtdIncome.value = mtdRes.deposits;
      mtdExpense.value = mtdRes.withdrawals;
    }
    const ytdStart = new Date(now.getFullYear(), 0, 1).toISOString();
    const ytdRes = await getKasBalanceByDateRange(ytdStart, currentISO);
    if (ytdRes.success) {
      ytdIncome.value = ytdRes.deposits;
      ytdExpense.value = ytdRes.withdrawals;
    }
    // 4. Fetch the global transactions feed (Limit 10)
    const txRes = await getTransactions({ limit: 10 });
    if (txRes.success) {
      recentTransactions.value = txRes.data;
    }
    // 5. Fetch latest bulletin
    const bulletinRes = await getBulletins({ limit: 1 });
    if (bulletinRes.success && bulletinRes.data.length > 0) {
      latestBulletin.value = bulletinRes.data[0];
    }
    // 6. Monthly Performance Chart
    const performanceRes = await getMonthlyPerformance(now.getFullYear());
    if (performanceRes.success) {
      monthlyData.value = performanceRes.data;
      const allValues = performanceRes.data.flatMap((d) => [
        d.income,
        d.expense,
      ]);
      const peak = Math.max(...allValues, 1000000);
      maxChartValue.value = peak * 1.2;
    }
  } catch (err) {
    console.error("Dashboard Sync Error:", err);
  }
  isLoading.value = false;
}

let txSubscription = null;
let bulletinSubscription = null;

onMounted(() => {
  fetchDashboardData();
  // Subscribe to transactions
  txSubscription = supabase
    .channel("dashboard-transactions")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "transactions" },
      () => {
        fetchDashboardData();
      },
    )
    .subscribe();
  // Subscribe to bulletins
  bulletinSubscription = supabase
    .channel("dashboard-bulletins")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "bulletins" },
      () => {
        fetchDashboardData();
      },
    )
    .subscribe();
});

onUnmounted(() => {
  if (txSubscription) supabase.removeChannel(txSubscription);
  if (bulletinSubscription) supabase.removeChannel(bulletinSubscription);
});
</script>
