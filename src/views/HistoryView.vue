<template>
  <div class="history-view p-4 md:p-8 max-w-7xl mx-auto space-y-6">
    <!-- Header & Search/Filter -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h2
          class="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100"
        >
          Transaction History
        </h2>
        <p class="text-slate-500 text-sm mt-1">
          Comprehensive log of all financial activities.
        </p>
      </div>
      <div class="flex items-center gap-3">
        <div class="relative">
          <span
            class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
            >search</span
          >
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search records..."
            class="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 w-48 md:w-64"
          />
        </div>
        <div class="flex gap-2">
          <button
            @click="exportToCSV"
            class="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-primary/10 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <span class="material-symbols-outlined text-[18px]">download</span>
            Export CSV
          </button>
          <div class="relative group">
            <button
              class="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <span class="material-symbols-outlined text-[18px]"
                >filter_list</span
              >
              <span class="hidden sm:inline">{{
                filterType === "all" ? "All Types" : filterType
              }}</span>
            </button>
            <div
              class="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-1 z-50 hidden group-hover:block"
            >
              <button
                @click="filterType = 'all'"
                class="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-700 font-bold"
              >
                All Types
              </button>
              <button
                @click="filterType = 'Income'"
                class="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-emerald-600"
              >
                Income Only
              </button>
              <button
                @click="filterType = 'Expense'"
                class="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-rose-600"
              >
                Expense Only
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Table Card -->
    <div
      class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col min-h-[500px]"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr
              class="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-bold text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-800"
            >
              <th class="p-4 ">Date & Time</th>
              <th class="p-4 flex items-center justify-center" v-if="!isResident">Unit</th>
              <th class="p-4">Description</th>
              <th class="p-4">Category</th>
              <th class="p-4 flex items-center justify-center">Ref/ID</th>
              <th class="p-4 text-right">Amount</th>
              <th class="p-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-if="isLoading">
              <td colspan="7" class="p-8 text-center text-slate-400">
                <span
                  class="material-symbols-outlined animate-spin text-3xl text-primary"
                  >refresh</span
                >
              </td>
            </tr>
            <tr v-else-if="filteredTransactions.length === 0">
              <td
                colspan="7"
                class="p-8 text-center text-slate-400 font-medium"
              >
                No transactions found.
              </td>
            </tr>
            <tr
              v-else
              v-for="tx in paginatedTransactions"
              :key="tx.id"
              class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <td class="p-4 text-slate-500 text-xs">
                {{ tx.dateShort }}<br /><span class="text-[10px]">{{
                  tx.time
                }}</span>
              </td>
              <td class="p-4 font-bold text-primary flex items-center justify-center" v-if="isAdmin">
                {{ tx.unitDisplay || "-" }}
              </td>
              <td
                class="p-4 font-semibold text-slate-900 dark:text-slate-100"
                :title="tx.description"
              >
                <!-- {{ tx.description }} -->
                <div class="font-bold text-slate-900 dark:text-slate-100 break-words leading-relaxed">
                 {{ cleanDescription(tx.description, tx.category_name) }}
                </div>
              </td>
              <td class="p-4">
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border',
                    tx.type === 'deposit' || tx.type === 'Income'
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-600 border-rose-500/20',
                  ]"
                >
                  {{
                    tx.type === "deposit" || tx.type === "Income"
                      ? "INCOME"
                      : "EXPENSE"
                  }}
                </span>
              </td>
              <td class="p-4 text-xs font-mono text-slate-400">
                TRX-{{ tx.id.substring(0, 6).toUpperCase() }}
              </td>
              <td
                class="p-4 text-right font-bold"
                :class="
                  tx.type === 'deposit' || tx.type === 'Income'
                    ? 'text-emerald-500'
                    : 'text-rose-500'
                "
              >
                {{
                  tx.type === "deposit" || tx.type === "Income" ? "+" : "-"
                }}Rp {{ formatNumber(tx.amount) }}
              </td>
              <td class="p-4 text-center">
                <span
                  class="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full text-[10px] font-bold uppercase tracking-wider"
                >
                  <span
                    class="w-1.5 h-1.5 rounded-full inline-block mr-1"
                    :class="
                      tx.status === 'Completed'
                        ? 'bg-emerald-500'
                        : 'bg-amber-500'
                    "
                  ></span
                  >{{ tx.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer Pagination -->
      <div
        v-if="filteredTransactions.length > 0"
        class="mt-auto p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between"
      >
        <p class="text-xs text-slate-500 font-medium">
          Showing {{ paginationStart }} to {{ paginationEnd }} of
          {{ filteredTransactions.length }} entries
        </p>
        <div class="flex items-center gap-2">
          <button
            @click="currentPage > 1 && currentPage--"
            :disabled="currentPage === 1"
            class="size-8 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 disabled:opacity-50"
          >
            <span class="material-symbols-outlined text-sm">chevron_left</span>
          </button>

          <template v-for="page in totalPages" :key="page">
            <span
              v-if="
                page === 1 ||
                page === totalPages ||
                Math.abs(page - currentPage) <= 1
              "
              @click="currentPage = page"
              :class="[
                'size-8 rounded flex items-center justify-center text-xs font-bold shadow-sm cursor-pointer transition-all',
                currentPage === page
                  ? 'bg-primary text-white scale-110'
                  : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700',
              ]"
            >
              {{ page }}
            </span>
            <span
              v-else-if="page === 2 || page === totalPages - 1"
              class="text-slate-300"
              >...</span
            >
          </template>

          <button
            @click="currentPage < totalPages && currentPage++"
            :disabled="currentPage === totalPages"
            class="size-8 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer disabled:opacity-50"
          >
            <span class="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { supabase } from "@/services/supabaseClient.js";
import { useAuth } from "@/composables/useAuth.js";
import { getTransactions } from "@/services/transactionService.js";
import { getUnitPaymentStatus, getUnitFullHistory } from "@/services/paymentService.js";

const { isResident, isAdmin, session, unitCode } = useAuth();

const allTransactions = ref([]);
const isLoading = ref(true);
const searchQuery = ref("");
const filterType = ref("all");
const currentPage = ref(1);
const itemsPerPage = 25;

function formatNumber(val) {
  if (!val && val !== 0) return "0";
  return new Intl.NumberFormat("id-ID").format(Math.abs(val));
}

function exportToCSV() {
  if (allTransactions.value.length === 0) return;

  const headers = [
    "Date",
    "Type",
    "Description",
    "Amount",
    "Recipient",
    "Unit",
  ];
  const rows = allTransactions.value.map((tx) => [
    new Date(tx.transaction_date || tx.payment_date).toLocaleDateString(),
    tx.type?.toUpperCase() || "INCOME",
    tx.description || tx.obligation?.event?.name || "Payment",
    tx.amount,
    tx.recipient || "-",
    tx.unit || "-",
  ]);

  const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.setAttribute("href", url);
  a.setAttribute(
    "download",
    `transactions_${new Date().toISOString().split("T")[0]}.csv`,
  );
  a.click();
}

const filteredTransactions = computed(() => {
  let filtered = allTransactions.value;

  // Apply Type Filter
  if (filterType.value !== "all") {
    filtered = filtered.filter(
      (tx) =>
        tx.type ===
          (filterType.value === "Income" ? "deposit" : "withdrawal") ||
        tx.type === filterType.value,
    );
  }

  // Apply Search
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (tx) =>
        tx.description?.toLowerCase().includes(q) ||
        tx.unit?.toLowerCase().includes(q) ||
        tx.id?.toLowerCase().includes(q),
    );
  }

  return filtered;
});

const totalPages = computed(
  () => Math.ceil(filteredTransactions.value.length / itemsPerPage) || 1,
);

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredTransactions.value.slice(start, start + itemsPerPage);
});

const paginationStart = computed(() =>
  filteredTransactions.value.length === 0
    ? 0
    : (currentPage.value - 1) * itemsPerPage + 1,
);
const paginationEnd = computed(() =>
  Math.min(currentPage.value * itemsPerPage, filteredTransactions.value.length),
);

onMounted(async () => {
  isLoading.value = true;

  // Fetch Units for lookup
  const unitLookup = {};
  const { data: unitsData } = await supabase.from("units").select("code, name");
  if (unitsData) {
    unitsData.forEach((u) => (unitLookup[u.code] = u.name));
  }

  if (isAdmin.value) {
    const res = await getTransactions({ limit: 100 });
    if (res.success) {
      allTransactions.value = res.data.slice(0, 100).map((tx) => {
        const d = new Date(tx.transaction_date);

        let unitCode = "-";
        let unitDisplay = "-";
        if (tx.description && tx.description.includes("Unit")) {
          const parts = tx.description.split("Unit");
          if (parts.length > 1) {
            unitCode = parts[1].trim().split(" ")[0]; // Get first word after 'Unit'
            const ownerName = unitLookup[unitCode];
            unitDisplay = ownerName ? `${unitCode} ${ownerName}` : unitCode;
          }
        }

        // Build enhanced description with category name
        const categoryName =
          tx.category_name || (tx.type === "deposit" ? "Income" : "General");
        const baseDescription =
          tx.description ||
          (tx.type === "deposit" ? "Kas Deposit" : "Kas Withdrawal");

        let enhancedDescription = baseDescription;
        if (!baseDescription.includes(`[${categoryName}]`)) {
          enhancedDescription = `[${categoryName}] ${baseDescription}`;
        }

        return {
          id: tx.id,
          dateShort: d.toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          }),
          time: d.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          unit: unitCode,
          unitDisplay: unitDisplay,
          description: enhancedDescription,
          category_name: categoryName,
          type: tx.type,
          amount: tx.amount,
          status: "Completed",
          transaction_date: tx.transaction_date,
        };
      });
    }
  } else if (isResident.value && (session.value?.id || session.value?.unit_id) && unitCode.value) {
    const uId = session.value?.unit_id || session.value?.id;
    const res = await getUnitFullHistory(uId, unitCode.value);
    if (res.success) {
      allTransactions.value = res.data.slice(0, 100).map((tx) => {
        const d = new Date(tx.date);
        
        return {
          id: tx.id,
          dateShort: d.toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          }),
          time: d.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          unit: tx.type === 'withdrawal' ? 'Global' : '-',
          description: tx.description,
          category_name: tx.category_name,
          type: tx.type === 'withdrawal' ? "Expense" : "Income", 
          amount: tx.amount,
          status: tx.status,
          transaction_date: tx.date,
        };
      });
    }
  }

  isLoading.value = false;
});

const cleanDescription = (desc, categoryName) => {
  if (!desc) return `[${categoryName}]`;
  
  // 1. Strip any existing brackets from the string to prevent doubling
  let rawText = desc.replace(/\[.*?\]\s*/g, '').trim();

  // 2. Remove "Payment" and "Unit" clutter
  let clean = rawText
    .replace(/Payment|IPL Payment|THR Payment/gi, '')
    .replace(/\s*-\s*Unit\s*\w+/gi, '')
    .replace(/^-+\s*|\s*-+\s*$/g, '')
    .trim();

  // Special logic for Sinking Fund: if the category already has the project name (e.g. "Sinking Fund (Tembok)"),
  // and the description is just "Iuran Lainnya - Tembok", we can clean it to be less redundant.
  if (categoryName.includes('Sinking Fund')) {
    clean = clean.replace(/Iuran Lainnya/gi, '').trim();
    
    // Check if the project name is already in the categoryName brackets
    const match = categoryName.match(/\((.*?)\)/);
    if (match && match[1] && clean.toLowerCase().includes(match[1].toLowerCase())) {
        // If they match, just return the category tag or keep only the unique parts of the description
        if (clean.toLowerCase() === match[1].toLowerCase()) return `[${categoryName}]`;
    }
  }

  // 3. Special Logic for Corrections
  if (categoryName?.toLowerCase().includes('correction')) {
    return `[CORRECTION] ${clean}`;
  }

  return `[${categoryName}] ${clean}`;
}
</script>
