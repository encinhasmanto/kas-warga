<template>
  <div
    class="manage-transactions flex flex-col h-screen md:h-full bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 pb-0 relative"
  >
    <!-- Custom Toast Notification -->
    <transition name="toast">
      <div
        v-if="toast.show"
        class="fixed top-24 md:top-8 right-4 md:right-8 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md"
        :class="
          toast.type === 'success'
            ? 'bg-emerald-50/95 dark:bg-emerald-900/90 text-emerald-700 dark:text-emerald-100 border-emerald-200 dark:border-emerald-700'
            : toast.type === 'expense-success'
              ? 'bg-rose-50/95 dark:bg-rose-900/90 text-rose-700 dark:text-rose-100 border-rose-200 dark:border-rose-700'
              : 'bg-rose-50/95 dark:bg-rose-900/90 text-rose-700 dark:text-rose-100 border-rose-200 dark:border-rose-700'
        "
      >
        <span class="material-symbols-outlined text-xl">
          {{
            toast.type === "success" || toast.type === "expense-success"
              ? "check_circle"
              : "error"
          }}
        </span>
        <p class="text-sm font-bold tracking-wide">{{ toast.message }}</p>
      </div>
    </transition>

    <!-- Desktop width increased to accommodate side-by-side -->
    <div
      class="max-w-md md:max-w-5xl mx-auto w-full bg-white dark:bg-slate-900 md:shadow-xl h-screen md:h-[90vh] flex flex-col relative md:mt-8 md:rounded-3xl border-0 md:border border-slate-200 dark:border-slate-800 overflow-hidden"
    >
      <!-- Header -->
      <header
        class="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shrink-0"
      >
        <div class="flex items-center p-4 justify-between">
          <button
            @click="goBack"
            class="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full transition-colors flex items-center justify-center"
          >
            <span class="material-symbols-outlined">arrow_back</span>
          </button>
          <h1
            class="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100"
          >
            Transaction Operations
          </h1>
          <div class="w-10"></div>
          <!-- Spacer -->
        </div>

        <!-- Tab Navigation (Mobile Only) -->
        <div class="flex px-4 cursor-pointer md:hidden">
          <button
            @click="switchView('transactions')"
            :class="[
              'flex-1 flex flex-col items-center justify-center border-b-2 py-3 transition-all',
              activeView === 'transactions'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700',
            ]"
          >
            <span
              :class="[
                'text-sm',
                activeView === 'transactions' ? 'font-bold' : 'font-medium',
              ]"
              >Input Transaction</span
            >
          </button>
          <button
            @click="switchView('correction')"
            :class="[
              'flex-1 flex flex-col items-center justify-center border-b-2 py-3 transition-all',
              activeView === 'correction'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700',
            ]"
          >
            <span
              :class="[
                'text-sm',
                activeView === 'correction' ? 'font-bold' : 'font-medium',
              ]"
              >Correction</span
            >
          </button>
        </div>
      </header>

      <!-- Desktop Toggle for View Mode -->
      <div
        class="hidden md:flex justify-end px-8 pt-4 items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 shrink-0"
      >
        <span
          class="text-sm font-semibold text-slate-500 tracking-wide uppercase text-[10px]"
          >View Mode:</span
        >
        <div class="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            @click="switchView('transactions')"
            :class="[
              'px-4 py-1.5 rounded-md text-sm font-bold transition-all',
              activeView === 'transactions'
                ? 'bg-white dark:bg-slate-700 shadow-sm text-primary'
                : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700',
            ]"
          >
            Transaction
          </button>
          <button
            @click="switchView('correction')"
            :class="[
              'px-4 py-1.5 rounded-md text-sm font-bold transition-all',
              activeView === 'correction'
                ? 'bg-white dark:bg-slate-700 shadow-sm text-primary'
                : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700',
            ]"
          >
            Correction
          </button>
        </div>
      </div>

      <main class="flex-1 relative overflow-hidden flex flex-col md:flex-row">
        <!-- Dashboard Grid (Visible for Transactions) -->
        <div
          v-show="activeView === 'transactions'"
          class="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden w-full h-full"
        >
          <!-- INCOME COLUMN -->
          <section
            class="flex-1 flex flex-col md:h-full md:overflow-y-auto no-scrollbar p-4 md:p-8 space-y-6 md:border-r border-slate-200 dark:border-slate-800 md:pb-8"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span
                  class="material-symbols-outlined text-emerald-500 text-2xl"
                  >arrow_circle_down</span
                >
                <h2 class="text-xl font-bold text-slate-900 dark:text-white">
                  Record Income
                </h2>
              </div>
              <button
                @click="resetIncome"
                class="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors uppercase tracking-wider"
              >
                Reset
              </button>
            </div>

            <div
              class="bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-5"
            >
              <!-- Category Selection -->
              <div class="space-y-3">
                <label
                  class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1"
                  >CATEGORY</label
                >
                <div class="grid grid-cols-3 gap-2">
                  <button
                    v-for="cat in sortedIncomeCategories"
                    :key="cat.id"
                    @click="setIncomeCategory(cat)"
                    :class="[
                      'py-3 px-1 sm:px-2 rounded-xl text-[10px] sm:text-xs text-center border transition-all font-bold',
                      incomeData.categoryId === cat.id
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-500/20'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-emerald-300',
                    ]"
                  >
                    {{ cat.name }}
                  </button>
                </div>
              </div>

              <!-- Iuran Lainnya: Project Name -->
              <div
                v-if="incomeData.categoryName === 'Iuran Lainnya'"
                class="space-y-3 animate-fade-in"
              >
                <label
                  class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1"
                  >Project Name</label
                >
                <input
                  v-model="incomeData.projectName"
                  class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-300"
                  placeholder="e.g. Perbaikan Tembok"
                />
              </div>

              <!-- Type Selection -->
              <div class="space-y-3">
                <label
                  class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1"
                  >PAYOR TYPE</label
                >
                <div class="grid grid-cols-2 gap-2">
                  <button
                    v-for="type in ['Ruko', 'Townhouse']"
                    :key="type"
                    @click="setIncomeType(type)"
                    :class="[
                      'py-3 px-4 rounded-xl text-center border transition-all font-bold',
                      incomeData.type === type
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400'
                        : 'bg-white dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-emerald-300',
                    ]"
                    :style="{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }"
                  >
                    {{ type }}
                  </button>
                </div>
              </div>

              <!-- Unit Selection -->
              <div class="space-y-3" v-if="incomeData.type">
                <div class="flex justify-between items-center ml-1">
                  <label
                    class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider"
                    >SELECT UNIT</label
                  >
                  <span
                    class="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white/50 dark:bg-slate-800 px-2 py-0.5 rounded"
                    >{{ incomeData.type }} Units</span
                  >
                </div>
                <!-- Fixed max height grid so it can scroll if many items -->
                <div
                  class="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-40 overflow-y-auto no-scrollbar pr-1 border border-slate-100 dark:border-slate-700/50 rounded-xl p-2 bg-white/50 dark:bg-slate-800/50"
                >
                  <button
                    v-for="unit in availableUnits"
                    :key="unit"
                    @click="incomeData.unit = unit"
                    :class="[
                      'py-2 rounded-lg transition-colors border',
                      incomeData.unit === unit
                        ? 'bg-emerald-500 text-white font-bold border-emerald-500 shadow-md shadow-emerald-500/20'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:border-emerald-300 pointer-events-auto',
                    ]"
                    :style="{ fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)' }"
                  >
                    {{ unit }}
                  </button>
                </div>
              </div>
              <!-- <div v-if="incomeData.categoryId" class="space-y-2 mt-4 animate-fade-in">
  <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Target Month (For Tracker)</label>
  <select 
    v-model="incomeData.month_index"
    class="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-4 px-5 focus:ring-2 focus:ring-primary/20 font-medium transition-all appearance-none cursor-pointer"
  >
    <option v-for="(month, index) in ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']" 
            :key="index" :value="index + 1">
      {{ month }} 2026
    </option>
                    </select>
</div> -->
            </div>

            <!-- Amount Input -->
            <div class="space-y-3 pt-2">
              <label
                class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1"
                >Amount</label
              >
              <div class="relative group">
                <span
                  class="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 group-focus-within:text-emerald-500 transition-colors"
                  >Rp</span
                >
                <input
                  v-model="formattedIncomeAmount"
                  @keypress="
                    (e) => {
                      if (!/[0-9]/.test(e.key)) e.preventDefault();
                    }
                  "
                  class="w-full bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl py-4 pl-12 pr-4 text-2xl font-black text-emerald-600 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-slate-300"
                  placeholder="0"
                  type="text"
                  inputmode="numeric"
                />
              </div>
            </div>

            <!-- Note Input -->
            <div class="space-y-3 mb-6">
              <label
                class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1"
                >Notes (Optional)</label
              >
              <textarea
                v-model="incomeData.notes"
                class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 min-h-[80px] resize-none"
                placeholder="Add details about this payment..."
              ></textarea>
            </div>

            <button
              @click="saveIncome"
              :disabled="isSaving"
              class="w-full mt-auto mb-12 md:mb-0 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98] shrink-0"
            >
              <span
                class="material-symbols-outlined"
                :class="{ 'animate-spin': isSaving }"
                >{{ isSaving ? "refresh" : "save" }}</span
              >
              {{ isSaving ? "Saving..." : "Save Income" }}
            </button>
          </section>

          <!-- Divider for Mobile -->
          <div
            class="md:hidden h-2 bg-slate-100 dark:bg-slate-800/50 block w-full border-y border-slate-200 dark:border-slate-800"
          ></div>

          <!-- EXPENSE COLUMN -->
          <section
            class="flex-1 flex flex-col md:h-full md:overflow-y-auto no-scrollbar p-4 md:p-8 space-y-6 pb-24 md:pb-8 bg-slate-50/50 md:bg-transparent dark:bg-slate-900/50 md:dark:bg-transparent"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-rose-500 text-2xl"
                  >arrow_circle_up</span
                >
                <h2 class="text-xl font-bold text-slate-900 dark:text-white">
                  Record Expense
                </h2>
              </div>
              <button
                @click="resetExpense"
                class="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors uppercase tracking-wider"
              >
                Reset
              </button>
            </div>

            <div
              class="bg-white md:bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-5 shadow-sm md:shadow-none"
            >
              <div class="space-y-3">
                <label
                  class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1"
                  >CATEGORY</label
                >
                <div class="relative">
                  <select
                    v-model="expenseData.categoryId"
                    class="appearance-none w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 rounded-xl py-3.5 pl-4 pr-10 font-bold transition-all text-slate-900 dark:text-slate-100 cursor-pointer"
                    :style="{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }"
                  >
                    <option value="" disabled>Select category...</option>
                    <option
                      v-for="cat in expenseCategories"
                      :key="cat.id"
                      :value="cat.id"
                    >
                      {{ cat.name }}
                    </option>
                  </select>
                  <div
                    class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400"
                  >
                    <span class="material-symbols-outlined text-lg"
                      >expand_more</span
                    >
                  </div>
                </div>
              </div>
            </div>

            <div class="space-y-3 pt-2">
              <label
                class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1"
                >Amount</label
              >
              <div class="relative group">
                <span
                  class="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 group-focus-within:text-rose-500 transition-colors"
                  >Rp</span
                >
                <input
                  v-model="formattedExpenseAmount"
                  @keypress="
                    (e) => {
                      if (!/[0-9]/.test(e.key)) e.preventDefault();
                    }
                  "
                  class="w-full bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-xl py-4 pl-12 pr-4 text-2xl font-black text-rose-500 dark:text-rose-400 focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all placeholder:text-slate-300"
                  placeholder="0"
                  type="text"
                  inputmode="numeric"
                />
              </div>
            </div>

            <div class="space-y-3 mb-6">
              <label
                class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1"
                >Notes / Invoice Ref (Optional)</label
              >
              <textarea
                v-model="expenseData.notes"
                class="w-full bg-white md:bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 min-h-[120px] resize-none"
                placeholder="Add expense justification or invoice numbers..."
              ></textarea>
            </div>

            <button
              @click="saveExpense"
              :disabled="isSaving"
              class="w-full mt-auto bg-rose-500 hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-rose-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98] shrink-0"
            >
              <span
                class="material-symbols-outlined"
                :class="{ 'animate-spin': isSaving }"
                >{{ isSaving ? "refresh" : "receipt_long" }}</span
              >
              {{ isSaving ? "Saving..." : "Save Expense" }}
            </button>
          </section>
        </div>

        <!-- Correction Section -->
        <section
          v-show="activeView === 'correction'"
          class="w-full overflow-y-auto no-scrollbar space-y-6 flex items-center justify-center p-8 text-center h-full"
        >
          <div
            class="text-slate-400 bg-slate-50 dark:bg-slate-800/50 w-full max-w-lg p-12 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700"
          >
            <div
              class="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 scale-150 shadow-sm border border-slate-200 dark:border-slate-700"
            >
              <span
                class="material-symbols-outlined text-3xl text-primary animate-pulse"
                >build</span
              >
            </div>
            <h3
              class="font-bold text-xl text-slate-900 dark:text-slate-100 mb-3 mt-8"
            >
              Correction Tool
            </h3>
            <p class="text-sm font-medium">
              Modification logic and history auditing will be fully active in
              Phase 3 Database connection.
            </p>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { supabase } from "@/services/supabaseClient.js";
import { getTransactionCategories } from "@/services/expenseService.js";
import {
  recordDeposit,
  recordWithdrawal,
} from "@/services/transactionService.js";
import { recordPayment } from "@/services/paymentService.js";

const availableYears = ref([
  new Date().getFullYear() - 1,
  new Date().getFullYear(),
  new Date().getFullYear() + 1,
]);

const route = useRoute();
const router = useRouter();

// Sync local view state with router name ('transactions' or 'correction')
const activeView = ref("transactions");

// Toast Notification System
const toast = ref({ show: false, message: "", type: "success" });
let toastTimer = null;

function showToast(message, type = "success") {
  toast.value = { show: true, message, type };
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.value.show = false;
  }, 2500);
}

const incomeCategories = ref([]);
const expenseCategories = ref([]);

const sortedIncomeCategories = computed(() => {
  const order = ["IPL", "THR", "Iuran Lainnya"];
  return [...incomeCategories.value].sort((a, b) => {
    return order.indexOf(a.name) - order.indexOf(b.name);
  });
});

onMounted(async () => {
  if (["transactions", "correction"].includes(route.name)) {
    activeView.value = route.name;
  }

  // Fetch Categories
  const incRes = await getTransactionCategories("income");
  if (incRes.success) incomeCategories.value = incRes.data;

  const expRes = await getTransactionCategories("expense");
  if (expRes.success) expenseCategories.value = expRes.data;
});

// Ensures that changing the activeView manually updates the URL
function switchView(viewName) {
  activeView.value = viewName;
  router.push({ name: viewName });
}

// Alternatively, if the URL changes organically (like side menu click), update the tab
watch(
  () => route.name,
  (newName) => {
    if (["transactions", "correction"].includes(newName)) {
      activeView.value = newName;
    }
  },
);

const goBack = () => {
  router.push({ name: "dashboard" });
};

// ========================
// INCOME LOGIC
// ========================

const incomeData = ref({
  categoryId: "",
  categoryName: "",
  categoryCode: "",
  type: "",
  unit: "",
  amount: "",
  projectName: "", // Used only if category is 'Iuran Lainnya'
  notes: "",
});

function resetIncome() {
  incomeData.value = {
    amount: "",
    categoryId: "",
    categoryName: "",
    categoryCode: "",
    type: "",
    unit: "",
    notes: "",
    projectName: "",
    month_index: new Date().getMonth() + 1, // Reset to current month
    year: new Date().getFullYear(), // Reset year logically
  };
}

function setIncomeCategory(cat) {
  incomeData.value.categoryId = cat.id;
  incomeData.value.categoryName = cat.name;
  incomeData.value.categoryCode = cat.code;
  incomeData.value.amount = "";
  incomeData.value.projectName = "";
  applyIncomeAutofill();
}

function setIncomeType(type) {
  incomeData.value.type = type;
  incomeData.value.unit = "";
  applyIncomeAutofill();
}

function applyIncomeAutofill() {
  const code = incomeData.value.categoryCode;
  const type = incomeData.value.type;

  if (!code || !type) return;

  if (code === "IPL" || code === "THR") {
    if (type === "Ruko") {
      incomeData.value.amount = "250000";
    } else if (type === "Rumah") {
      incomeData.value.amount = "170000";
    }
  } else if (code === "IURAN_LAINNYA") {
    incomeData.value.amount = "";
  }
}

const formattedIncomeAmount = computed({
  get: () => formatNumberInput(incomeData.value.amount),
  set: (val) => {
    incomeData.value.amount = val.replace(/\D/g, "");
  },
});

const availableUnits = computed(() => {
  if (!incomeData.value.type) return [];

  const units = [];
  if (incomeData.value.type === "Ruko") {
    for (let i = 1; i <= 11; i++) units.push(`R${i}`);
  } else {
    for (let i = 1; i <= 12; i++) units.push(`A${i}`);
    for (let i = 1; i <= 10; i++) units.push(`B${i}`);
  }
  return units;
});

const isSaving = ref(false);

async function saveIncome() {
  if (isSaving.value) return;
  const { category, type, unit, amount, projectName, notes } = incomeData.value;

  // Validation with Custom Toast
  if (!incomeData.value.categoryId)
    return showToast("Please select a Category.", "error");
  if (incomeData.value.categoryCode === "IURAN_LAINNYA" && !projectName.trim())
    return showToast("Please enter the Project Name.", "error");
  if (!type) return showToast("Please select the Payor Type.", "error");
  if (!unit) return showToast("Please select a Unit.", "error");
  if (!amount || parseInt(amount) === 0)
    return showToast("Please enter a valid Amount.", "error");

  isSaving.value = true;
  const parsedAmount = parseInt(amount);

  try {
    // 1. Resolve the unit ID from the code
    const { data: unitRecord } = await supabase
      .from("units")
      .select("id")
      .eq("code", unit)
      .single();
    if (!unitRecord) throw new Error("Unit code not found in database.");

    // 2. If IPL/THR, tie it to an obligation to update tracking matrix
    const code = incomeData.value.categoryCode;
    if (code === "IPL" || code === "THR") {
      const lowerCat = code.toLowerCase();
      const { data: obligations } = await supabase
        .from("payment_obligations")
        .select(
          "id, amount, status, year, month_index, event:payment_events(key)",
        )
        .eq("unit_id", unitRecord.id);

      const currentYear = new Date().getFullYear();

      // 2a. Pre-Validation: Prevent Duplicate THR Payments for current year
      if (code === "THR") {
        const matchingThr = obligations?.find(
          (o) => o.event?.key === "thr" && o.year === currentYear,
        );
        if (matchingThr && matchingThr.status === true) {
          throw new Error(`This unit has already paid THR for ${currentYear}!`);
        }
      }

      const matchingObs = obligations?.filter(
        (o) => o.event?.key === lowerCat && o.status === false,
      );

      // Target oldest pending obligation
      matchingObs?.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return (a.month_index || 0) - (b.month_index || 0);
      });

      if (!matchingObs || matchingObs.length === 0) {
        throw new Error(
          `All ${code} Tracking Obligations are already fully paid!`,
        );
      }

      // Proceed to update the oldest unpaid matrix cell
      const rpRes = await recordPayment({
        obligation_id: matchingObs[0].id,
        amount: parsedAmount,
        payment_method: "transfer",
        notes: notes,
      });
      if (!rpRes.success) throw new Error(rpRes.error);
    }

    // 3. ALWAYS Record Deposit into Kas
    let desc = `${incomeData.value.categoryName} Payment - Unit ${unit}`;
    if (code === "IURAN_LAINNYA")
      desc = `Iuran Lainnya - ${projectName} - Unit ${unit}`;

    const res = await recordDeposit({
      amount: parsedAmount,
      category_id: incomeData.value.categoryId,
      description: desc + (notes ? ` - ${notes}` : ""),
      unit_id: unitRecord.id,
    });
    if (!res.success) throw new Error(res.error);

    // Success
    showToast(`Income for Unit ${unit} saved successfully!`, "success");
    resetIncome();
  } catch (err) {
    showToast(err.message || "Failed to route income to database.", "error");
  } finally {
    isSaving.value = false;
  }
}

// ========================
// EXPENSE LOGIC
// ========================

const expenseData = ref({
  categoryId: "",
  amount: "",
  notes: "",
});

function resetExpense() {
  expenseData.value = {
    categoryId: "",
    amount: "",
    notes: "",
  };
}

const formattedExpenseAmount = computed({
  get: () => formatNumberInput(expenseData.value.amount),
  set: (val) => {
    expenseData.value.amount = val.replace(/\D/g, "");
  },
});

async function saveExpense() {
  if (isSaving.value) return;
  // Validation with Custom Toast
  if (!expenseData.value.categoryId)
    return showToast("Please select an Expense Category.", "error");
  if (!expenseData.value.amount || parseInt(expenseData.value.amount) === 0)
    return showToast("Please enter a valid Amount.", "error");

  isSaving.value = true;
  const parsedAmount = parseInt(expenseData.value.amount);

  try {
    const res = await recordWithdrawal({
      amount: parsedAmount,
      category_id: expenseData.value.categoryId,
      description: expenseData.value.notes || `General Expense`,
      recipient: "Vendor / Operations",
    });
    if (!res.success) throw new Error(res.error);

    // Success
    showToast(`Expense saved successfully!`, "expense-success");
    resetExpense();
  } catch (err) {
    showToast(
      err.message || "Failed to process expense via Supabase.",
      "error",
    );
  } finally {
    isSaving.value = false;
  }
}

// Utility
function formatNumberInput(value) {
  if (!value) return "";
  const numericValue = value.toString().replace(/\D/g, "");
  if (!numericValue) return "";
  return new Intl.NumberFormat("id-ID").format(numericValue);
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Toast Transition */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}
</style>
