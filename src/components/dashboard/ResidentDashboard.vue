<template>
  <div class="resident-dashboard flex flex-col gap-6 md:gap-8 px-0 md:px-0">
    <!-- Hero Section -->
    <section class="flex flex-col gap-4 pt-2">
      <div class="flex gap-4 items-center">
        <div
          class="bg-primary/10 rounded-xl p-4 flex flex-col items-center justify-center min-h-24 w-24 border border-primary/20 shrink-0 shadow-sm"
        >
          <span class="text-primary font-bold text-2xl">{{
            unitCode || "---"
          }}</span>
          <span
            class="text-primary/70 text-xs font-medium uppercase tracking-wider"
            >Unit</span
          >
        </div>
        <div class="flex flex-col justify-center">
          <p
            class="text-slate-900 dark:text-slate-100 text-2xl md:text-3xl font-bold leading-tight tracking-tight"
          >
            Welcome back, {{ firstName }}
          </p>
          <p
            class="text-slate-500 dark:text-slate-400 text-sm md:text-base font-normal mt-1"
          >
            Resident • Good Standing
          </p>
        </div>
      </div>
    </section>

    <!-- Next Due Banner (Mobile Only) when there bill -->
    <div
      v-if="nextDueAmount > 0"
      class="lg:hidden bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500 mb-2"
    >
      <div class="flex items-center gap-3">
        <div
          class="size-10 bg-primary rounded-xl flex items-center justify-center text-white scale-90 shadow-sm"
        >
          <span class="material-symbols-outlined text-lg">event_upcoming</span>
        </div>
        <div>
          <p
            class="text-[10px] font-bold text-primary uppercase tracking-widest leading-none mb-1"
          >
            Due: {{ nextDueMonthLabel }}
          </p>
          <p class="text-slate-900 dark:text-white font-black text-lg">
            Rp {{ formatNumber(nextDueAmount) }}
          </p>
        </div>
      </div>
      <button
        @click="isPaymentModalOpen = true"
        class="bg-primary hover:bg-primary/90 text-white text-xs font-bold px-4 py-2.5 rounded-xl active:scale-95 transition-all shadow-sm"
      >
        Pay Now
      </button>
    </div>

    <!-- Balance Section (Responsive Grid) -->
    <section
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
    >
      <div
        class="flex flex-col flex-1 justify-between rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group"
      >
        <div
          class="absolute top-0 right-0 p-4 opacity-10 text-primary group-hover:scale-110 transition-transform"
        >
          <span class="material-symbols-outlined text-6xl"
            >account_balance_wallet</span
          >
        </div>
        <div>
          <p
            class="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider mb-2 mt-0"
          >
            Main Balance (IPL & THR)
          </p>
          <div
            v-if="isLoading"
            class="h-10 w-32 bg-slate-100 dark:bg-slate-800 animate-pulse rounded"
          ></div>
          <p
            v-else
            class="text-slate-900 dark:text-slate-100 tracking-tight font-extrabold leading-tight"
            :style="{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)' }"
          >
            Rp {{ formatNumber(mainBalance) }}
          </p>
        </div>
        <div class="flex items-center gap-1 mt-4">
          <span
            class="text-emerald-600 dark:text-emerald-400 text-sm font-bold bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded flex items-center gap-1"
            ><span class="material-symbols-outlined text-[14px]">public</span>
            Global</span
          >
          <span class="text-slate-400 text-xs text-nowrap pl-1"
            >community sum</span
          >
        </div>
      </div>

      <div
        class="flex flex-col flex-1 justify-between rounded-2xl p-6 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-md"
      >
        <div>
          <div class="flex justify-between items-start mb-2">
            <p
              class="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider"
            >
              Sinking Fund
            </p>
            <span class="material-symbols-outlined text-slate-400">info</span>
          </div>
          <p
            class="text-slate-900 dark:text-slate-100 tracking-tight text-xl md:text-2xl font-bold"
          >
            (Iuran Lainnya)
          </p>
          <div
            v-if="isLoading"
            class="mt-1 h-8 w-24 bg-slate-200 dark:bg-slate-700 animate-pulse rounded"
          ></div>
          <p
            v-else
            class="text-primary tracking-tight font-bold mt-1"
            :style="{ fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)' }"
          >
            Rp {{ formatNumber(sinkingFund) }}
          </p>
        </div>
        <div class="mt-4">
          <div class="flex justify-between items-center mt-2">
            <p
              class="text-[10px] text-slate-400 uppercase font-bold tracking-widest"
            >
              Global Special Fund
            </p>
          </div>
        </div>
      </div>

      <!-- 3rd box: Next Due always show-->
      <div
        class="hidden lg:flex flex-col justify-between rounded-2xl p-6 bg-primary text-white shadow-lg shadow-primary/20 relative overflow-hidden group"
      >
        <div
          class="absolute top-0 right-0 p-4 opacity-10 text-white group-hover:scale-110 transition-transform"
        >
          <span class="material-symbols-outlined text-6xl">event</span>
        </div>
        <div>
          <p
            class="text-white/80 text-sm font-medium uppercase tracking-wider mb-2"
          >
            Next Due: {{ nextDueMonthLabel }}
          </p>
          <div
            v-if="isLoading"
            class="h-10 w-24 bg-white/20 animate-pulse rounded"
          ></div>
          <p
            v-else
            class="text-white tracking-tight font-extrabold leading-tight"
            :style="{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)' }"
          >
            Rp {{ formatNumber(nextDueAmount) }}
          </p>
        </div>
        <div class="mt-4">
          <button
            @click="isPaymentModalOpen = true"
            class="w-full py-2.5 bg-white text-primary rounded-lg font-bold text-sm hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            Pay Now
          </button>
        </div>
      </div>
    </section>

    <!-- Payment Modal Component -->
    <PaymentModal
      :isOpen="isPaymentModalOpen"
      :totalAmount="nextDueAmount"
      @close="isPaymentModalOpen = false"
    />

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
      <!-- Left Column: Tracker & Transactions -->
      <div class="lg:col-span-2 space-y-6 md:space-y-8">
        <!-- 1-Line Payment Tracker (Desktop focus view) -->
        <section
          class="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
        >
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-lg md:text-xl font-bold tracking-tight">
                Payment Tracker {{ currentYear }}
              </h3>
              <p class="text-slate-500 text-xs md:text-sm mt-1">
                Monitoring your annual IPL dues
              </p>
            </div>
            <router-link
              to="/app/tracker"
              class="text-primary text-sm font-semibold hover:underline hidden md:block"
              >Full details</router-link
            >
          </div>

          <div v-if="isLoading" class="flex justify-center py-4">
            <span
              class="material-symbols-outlined animate-spin text-primary text-3xl"
              >refresh</span
            >
          </div>
          <div v-else class="overflow-x-auto pb-2 -mx-6 px-6 md:mx-0 md:px-0">
            <table
              class="w-full text-left text-xs md:text-sm border-collapse min-w-[600px]"
            >
              <thead>
                <tr
                  class="text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800"
                >
                  <th
                    v-for="(m, i) in monthNames"
                    :key="i"
                    :class="[
                      'pb-3 text-center w-12',
                      currentMonth === i + 1 ? 'text-primary' : '',
                    ]"
                  >
                    {{ m }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr class="translate-y-2">
                  <td
                    v-for="(monthData, i) in paymentMonths"
                    :key="i"
                    :class="[
                      'pt-3 text-center',
                      currentMonth === i + 1 ? 'bg-primary/5 rounded-lg' : '',
                    ]"
                  >
                    <span
                      v-if="monthData?.uiStatus === 'paid'"
                      class="material-symbols-outlined text-emerald-500"
                      :class="currentMonth === i + 1 ? 'font-bold' : ''"
                      >check_circle</span
                    >
                    <span
                      v-else-if="monthData?.uiStatus === 'late'"
                      class="material-symbols-outlined text-amber-500"
                      >warning</span
                    >
                    <span
                      v-else-if="monthData?.uiStatus === 'unpaid'"
                      class="material-symbols-outlined text-rose-500"
                      >close</span
                    >
                    <span
                      v-else
                      class="material-symbols-outlined text-slate-300 dark:text-slate-700"
                      >radio_button_unchecked</span
                    >
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Transaction History -->
        <section
          class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
        >
          <div
            class="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800"
          >
            <h3
              class="text-slate-900 dark:text-slate-100 text-lg md:text-xl font-bold tracking-tight mb-0"
            >
              Recent Transactions
            </h3>
            <router-link
              to="/app/history"
              class="text-primary text-sm font-semibold hover:underline"
              >View All</router-link
            >
          </div>

          <div v-if="isLoading" class="flex justify-center py-8">
            <span
              class="material-symbols-outlined animate-spin text-primary text-3xl"
              >refresh</span
            >
          </div>
          <div
            v-else-if="recentTransactions.length === 0"
            class="p-8 text-center text-slate-400 font-medium"
          >
            No recent transactions found.
          </div>
          <div v-else class="overflow-x-auto">
            <!-- Desktop Table -->
            <table class="w-full text-left text-sm hidden md:table">
              <thead>
                <tr
                  class="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-bold text-xs uppercase tracking-wider"
                >
                  <th class="p-4">Date</th>
                  <th class="p-4">Description</th>
                  <th class="p-4 text-right">Amount</th>
                  <th class="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                <tr
                  v-for="tx in recentTransactions"
                  :key="tx.id"
                  class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td class="p-4 text-xs text-slate-500">{{ tx.date }}</td>
                  <td class="p-4 font-semibold">
                    {{ tx.description }}
                    <span
                      class="block text-[10px] text-slate-400 font-normal uppercase mt-0.5"
                      >{{ tx.category }}</span
                    >
                  </td>
                  <td
                    class="p-4 font-bold text-right"
                    :class="
                      tx.type === 'withdrawal'
                        ? 'text-rose-500'
                        : 'text-emerald-500'
                    "
                  >
                    {{ tx.type === "withdrawal" ? "-" : "+" }}Rp
                    {{ formatNumber(tx.amount) }}
                  </td>
                  <td class="p-4 text-center">
                    <span
                      class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest"
                      :class="
                        tx.type === 'withdrawal'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-emerald-50 text-emerald-600'
                      "
                    >
                      {{ tx.type === "withdrawal" ? "Expense" : "Completed" }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Mobile Stack -->
            <div
              class="flex flex-col md:hidden divide-y divide-slate-100 dark:divide-slate-800"
            >
              <div
                v-for="tx in recentTransactions"
                :key="tx.id"
                class="flex items-center justify-between p-4 bg-white dark:bg-slate-900"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="size-10 rounded-full flex items-center justify-center shrink-0"
                    :class="
                      tx.type === 'withdrawal'
                        ? 'bg-rose-50 text-rose-500'
                        : 'bg-emerald-50 text-emerald-500'
                    "
                  >
                    <span class="material-symbols-outlined">{{
                      tx.type === "withdrawal" ? "receipt_long" : "payments"
                    }}</span>
                  </div>
                  <div class="min-w-0">
                    <p
                      class="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate"
                    >
                      {{ tx.description }}
                    </p>
                    <p class="text-[11px] text-slate-400">
                      {{ tx.date }} • {{ tx.category }}
                    </p>
                  </div>
                </div>
                <div class="text-right shrink-0">
                  <p
                    class="text-sm font-bold"
                    :class="
                      tx.type === 'withdrawal'
                        ? 'text-rose-500'
                        : 'text-emerald-500'
                    "
                  >
                    {{ tx.type === "withdrawal" ? "-" : "+" }} Rp
                    {{ formatNumber(tx.amount) }}
                  </p>
                  <p
                    class="text-[10px] text-slate-400 font-medium uppercase mt-0.5"
                  >
                    {{ tx.type === "withdrawal" ? "Expense" : "Paid" }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Right Column: Bulletin -->
      <div class="lg:col-span-1 space-y-6 md:space-y-8">
        <section>
          <div class="flex items-center justify-between mb-4 mt-2 lg:mt-0">
            <h3
              class="text-slate-900 dark:text-slate-100 text-lg md:text-xl font-bold tracking-tight"
            >
              Permata Tajur Townhouse<br />
              <span class="text-primary text-md">Bulletin Board</span>
            </h3>
            <router-link
              to="/app/bulletin"
              class="text-primary text-sm font-semibold hover:underline"
              >See All</router-link
            >
          </div>

          <div
            v-if="latestBulletin"
            class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
            @click="selectedBulletin = latestBulletin"
          >
            <div class="h-64 md:h-56 w-full relative overflow-hidden">
              <!-- Image -->
              <img
                v-if="getFileType(latestBulletin.content_url) === 'image'"
                :src="latestBulletin.content_url"
                alt="Bulletin"
                class="relative z-10 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <!-- Video -->
              <video
                v-else-if="getFileType(latestBulletin.content_url) === 'video'"
                :src="latestBulletin.content_url"
                class="w-full h-full object-cover relative z-10"
                controls
                preload="metadata"
                @click.stop
              ></video>
              <!-- PDF -->
              <div
                v-else-if="getFileType(latestBulletin.content_url) === 'pdf'"
                class="w-full h-full flex flex-col items-center justify-center bg-rose-50 dark:bg-rose-900/20 relative z-10"
              >
                <span class="material-symbols-outlined text-5xl text-rose-500"
                  >picture_as_pdf</span
                >
                <p class="text-xs font-bold text-rose-500 mt-2">PDF Document</p>
              </div>
              <!-- None -->
              <div
                v-else
                class="absolute inset-0 bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden"
              >
                <img
                  src="/icons/Logo Permata Tajur Townhouse.jpeg"
                  class="absolute w-2/3 md:w-1/2 opacity-20 grayscale pointer-events-none mix-blend-multiply dark:mix-blend-screen"
                  alt="Logo Placeholder"
                />
                <span
                  class="material-symbols-outlined relative z-10 text-slate-400 text-4xl"
                  >newspaper</span
                >
              </div>
              <div
                class="absolute top-3 left-3 z-20 bg-primary/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm"
              >
                {{ latestBulletin.category || "Update" }}
              </div>
            </div>
            <div
              class="p-6 relative z-20 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800"
            >
              <h4
                class="font-bold text-lg md:text-xl text-slate-900 dark:text-slate-100 mb-3 leading-tight group-hover:text-primary transition-colors"
              >
                {{ latestBulletin.title }}
              </h4>
              <p
                class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-6 m-0 p-0"
                v-html="sanitizedLatestBulletin"
              ></p>
              <div
                class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between"
              >
                <div class="flex items-center gap-1.5">
                  <span
                    class="material-symbols-outlined text-slate-400 text-[14px]"
                    >calendar_month</span
                  >
                  <span
                    class="text-[10px] font-bold uppercase tracking-wider text-slate-400"
                    >{{ formatDate(latestBulletin.created_at) }}</span
                  >
                </div>
                <span
                  class="material-symbols-outlined text-sm text-slate-400 group-hover:translate-x-1 group-hover:text-primary transition-all"
                  >arrow_forward</span
                >
              </div>
            </div>
          </div>

          <div
            v-else
            class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl p-8 text-center"
          >
            <span class="material-symbols-outlined text-slate-300 text-4xl mb-2"
              >newspaper</span
            >
            <p class="text-xs text-slate-400 font-medium">
              No bulletins posted yet.
            </p>
          </div>

          <!-- Quick support CTA card (Desktop focus) -->
          <div
            class="mt-6 bg-slate-900 text-white p-6 justify-between rounded-2xl relative overflow-hidden group items-center hidden lg:flex cursor-pointer transition-transform hover:-translate-y-1"
          >
            <div class="relative z-10 w-full">
              <h4 class="font-bold text-lg mb-1">Butuh Bantuan?</h4>
              <p class="text-slate-400 text-xs mb-4">
                Hubungi kami bila ada kendala maupun pertanyaan seputar
                aplikasi.
              </p>
              <button
                @click="openSupport"
                class="w-full py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
              >
                Hubungi Kami
              </button>
            </div>
            <span
              class="material-symbols-outlined absolute -right-4 -bottom-4 text-7xl text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-500"
              >support_agent</span
            >
          </div>
        </section>
      </div>
    </div>

    <!-- Floating Pay Button (Commented Out) -->
    <!-- <div class="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 md:hidden">
      <button 
        @click="isPaymentModalOpen = true"
        class="flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-full shadow-2xl shadow-primary/40 font-bold active:scale-95 transition-all hover:bg-primary/90 hover:-translate-y-1"
      >
        <span class="material-symbols-outlined text-[20px]">payments</span>
        <span class="text-sm uppercase tracking-widest">Pay Resident Fees</span>
      </button>
    </div> -->
    <!-- The New Full Detail Modal -->
    <BulletinDetailModal
      v-if="selectedBulletin"
      :bulletin="selectedBulletin"
      @close="selectedBulletin = null"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useAuth } from "@/composables/useAuth.js";
import { supabase } from "@/services/supabaseClient.js";
import {
  getUnitPaymentStatus,
  getUnitFullHistory,
} from "@/services/paymentService.js";
import { getKasBalance } from "@/services/transactionService.js";
import { getBulletins } from "@/services/bulletinService.js";
import PaymentModal from "@/components/modals/PaymentModal.vue";
import BulletinDetailModal from "@/components/common/BulletinDetailModal.vue";
import { sanitizeHtml } from "@/utils/sanitizeHtml";
import {
  formatNumber,
  formatDate,
  getFileType,
  MONTH_NAMES,
} from "@/utils/formatUtils";

const { displayName, unitCode, session, isAdmin, unitId } = useAuth();

// Get first name for friendly greeting
const firstName = computed(() => {
  if (!displayName.value) return "Resident";
  return displayName.value.split(" ")[0];
});

// Reactive State
const mainBalance = ref(0);
const sinkingFund = ref(0);
const nextDueAmount = ref(0);
const recentTransactions = ref([]);
const paymentMonths = ref(Array(12).fill(null));
const latestBulletin = ref(null);
const sanitizedLatestBulletin = computed(() =>
  sanitizeHtml(latestBulletin.value?.content),
);
const selectedBulletin = ref(null);
const isLoading = ref(true);
const hasLoaded = ref(false);
const isPaymentModalOpen = ref(false);
const nextDueMonthLabel = ref("");

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;
const monthNames = MONTH_NAMES;

const residentSubscriptions = [];

function cleanupResidentSubscriptions() {
  residentSubscriptions.forEach((channel) => {
    if (channel) supabase.removeChannel(channel);
  });
  residentSubscriptions.length = 0;
}

function getResidentUnitFilter() {
  const uId = unitId.value || session.value?.unit_id || session.value?.id;
  return uId ? `unit_id=eq.${uId}` : undefined;
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

async function fetchResidentDashboardData(forceLoading = false) {
  if (forceLoading || !hasLoaded.value) {
    isLoading.value = true;
  }

  try {
    const uId = session.value?.unit_id || session.value?.id;

    // OPTIMIZED: Parallel fetch for independent calls with error guards
    const parallelPromises = [
      // 1. Global Kas Balance (RPC — fast)
      getKasBalance().catch(() => ({ success: false, balance: 0 })),
      // 2. Sinking Fund — amount only
          supabase
        .from('transactions')
        .select('amount, type')
        .in('category_name', ['Iuran Lainnya', 'Project'])
        .then((res) => res)
        .catch(() => ({ data: [] })),
      // 3. Latest bulletin
      getBulletins({ limit: 1 }).catch(() => ({ success: false, data: [] })),
    ];

    // 4. Unit-specific calls (guarded)
    if (uId && unitCode.value) {
      parallelPromises.push(
        // History for recent transactions
        getUnitFullHistory(uId, unitCode.value).catch(() => ({ success: false, data: [] })),
        // RPC Tracker for payment status display (same as TrackerView)
        supabase.rpc("get_resident_tracker", {
          p_unit_id: uId,
          p_year: currentYear,
        })
        .then((res) => res)
        .catch(() => ({ data: [] })),
        // Payment status for next-due calculation
        getUnitPaymentStatus(uId).catch(() => ({ success: false, data: { obligations: [] } })),
      );
    }

    const results = await Promise.all(parallelPromises);

    // Process global results with null safety
    const [kasRes, sinkingRes, bulletinRes] = results;

    if (kasRes?.success) {
      mainBalance.value = kasRes.balance;
    }

    if (sinkingRes?.data) {
      sinkingFund.value = sinkingRes.data.reduce(
        (sum, d) => sum + (d.amount || 0),
        0,
      );
    }

    if (bulletinRes?.success && bulletinRes.data?.length > 0) {
      latestBulletin.value = bulletinRes.data[0];
    }

    // Process unit-specific results
    if (uId && unitCode.value && results.length > 3) {
      const historyResult = results[3];
      const trackerResult = results[4];
      const statusResult = results[5];

      // Recent transactions from history
      if (historyResult?.success && historyResult.data) {
        recentTransactions.value = historyResult.data
          .slice(0, 10)
          .map((p) => ({
            id: p.id,
            date: new Date(p.date).toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            }),
            description: p.description,
            category: p.category_name,
            amount: Math.abs(p.amount),
            type: p.type,
            method: p.method,
          }));
      }

      // OPTIMIZED: Use RPC tracker for payment month display
      if (trackerResult?.data && trackerResult.data.length > 0) {
        const row = trackerResult.data[0];
        const months = [
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
        ].map((m) => ({
          uiStatus: m.status
            ? "paid"
            : getUnpaidMark(currentYear, m.month),
        }));
        paymentMonths.value = months;
      }

      // Use payment status for next-due calculation
      if (statusResult?.data?.obligations) {
        nextDueAmount.value = statusResult.data.current_due_total || 0;

        const iplObligations = statusResult.data.obligations.filter(
          (o) =>
            o.year === currentYear &&
            (o.event_key?.toLowerCase() === "ipl" || o.event_id === 2),
        );

        const nextObligation = iplObligations
          .filter((o) => !o.status)
          .sort(
            (a, b) => a.year * 12 + a.month - (b.year * 12 + b.month),
          )[0];

        if (nextObligation) {
          nextDueMonthLabel.value = `${monthNames[nextObligation.month - 1]} ${nextObligation.year}`;
        } else {
          nextDueMonthLabel.value = "No Pending Due";
        }
      }
    }
  } catch (err) {
    console.error("Dashboard Sync Error:", err);
  }

  hasLoaded.value = true;
  isLoading.value = false;
}

function subscribeResidentUpdates() {
  cleanupResidentSubscriptions();
  const paymentFilter = getResidentUnitFilter();

  const transactionChannel = supabase
    .channel("resident-dashboard-transactions")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "transactions" },
      () => fetchResidentDashboardData(),
    )
    .subscribe();

  const paymentChannel = supabase
    .channel("resident-dashboard-payment-transactions")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "payment_transactions",
        ...(paymentFilter ? { filter: paymentFilter } : {}),
      },
      () => fetchResidentDashboardData(),
    )
    .subscribe();

  const obligationChannel = supabase
    .channel("resident-dashboard-obligations")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "payment_obligations",
        ...(paymentFilter ? { filter: paymentFilter } : {}),
      },
      () => fetchResidentDashboardData(),
    )
    .subscribe();

  residentSubscriptions.push(
    transactionChannel,
    paymentChannel,
    obligationChannel,
  );
}

watch(
  [session, unitCode, unitId, isAdmin],
  ([newSession, newUnitCode]) => {
    if (isAdmin.value || (newSession && newUnitCode)) {
      subscribeResidentUpdates();
    } else {
      cleanupResidentSubscriptions();
    }
  },
  { immediate: true },
);

onMounted(() => {
  fetchResidentDashboardData(true);
});

onUnmounted(() => {
  residentSubscriptions.forEach((channel) => {
    if (channel) supabase.removeChannel(channel);
  });
});

const openSupport = () => {
  window.open("https://wa.me/6281234967582", "_blank");
};
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
