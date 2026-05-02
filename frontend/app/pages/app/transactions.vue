<template>
  <div class="manage-transactions min-h-screen bg-background-light dark:bg-background-dark p-4 md:p-8">
    <div class="max-w-5xl mx-auto w-full bg-white dark:bg-slate-900 shadow-xl rounded-3xl border border-slate-200 flex flex-col md:flex-row">
      <!-- Income Column -->
      <section class="flex-1 p-6 md:p-8 space-y-6 border-r border-slate-200">
        <div class="flex items-center gap-2 mb-4">
          <span class="material-symbols-outlined text-emerald-500 text-2xl">arrow_circle_down</span>
          <h2 class="text-xl font-bold">Record Income</h2>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Category</label>
            <div class="grid grid-cols-3 gap-2">
              <button v-for="cat in incomeCategories" :key="cat.id" @click="setIncomeCategory(cat)" :class="['py-2 px-1 rounded-xl text-xs font-bold border transition-all', incomeData.categoryId === cat.id ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg' : 'bg-white border-slate-200']">
                {{ cat.name }}
              </button>
            </div>
          </div>
          <div v-if="incomeData.categoryName === 'Iuran Lainnya'">
             <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Project Name</label>
             <input v-model="incomeData.projectName" class="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm" placeholder="e.g. Repair Gate" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Unit</label>
            <div class="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2 border border-slate-100 rounded-xl bg-slate-50">
              <button v-for="unit in availableUnits" :key="unit" @click="incomeData.unit = unit" :class="['py-2 rounded-lg text-[10px] font-bold border transition-all', incomeData.unit === unit ? 'bg-emerald-500 text-white border-emerald-500 shadow-md' : 'bg-white border-slate-200']">
                {{ unit }}
              </button>
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Amount</label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
              <input v-model="formattedIncomeAmount" @keypress="enforceNumeric" inputmode="numeric" pattern="[0-9]*" class="w-full bg-emerald-50 border border-emerald-100 rounded-xl py-4 pl-12 pr-4 text-2xl font-black text-emerald-600" placeholder="0" />
            </div>
          </div>
        </div>
        <button @click="saveIncome" :disabled="isSaving" class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg transition-all disabled:opacity-50">
          {{ isSaving ? "Saving..." : "Save Income" }}
        </button>
      </section>

      <!-- Expense Column -->
      <section class="flex-1 p-6 md:p-8 space-y-6 bg-slate-50/50">
        <div class="flex items-center gap-2 mb-4">
          <span class="material-symbols-outlined text-rose-500 text-2xl">arrow_circle_up</span>
          <h2 class="text-xl font-bold">Record Expense</h2>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Category</label>
            <select v-model="expenseData.categoryId" class="w-full bg-white border border-slate-200 rounded-xl py-3.5 px-4 font-bold text-sm">
              <option value="" disabled>Select category...</option>
              <option v-for="cat in expenseCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Amount</label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
              <input v-model="formattedExpenseAmount" @keypress="enforceNumeric" inputmode="numeric" pattern="[0-9]*" class="w-full bg-rose-50 border border-rose-100 rounded-xl py-4 pl-12 pr-4 text-2xl font-black text-rose-500" placeholder="0" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Notes</label>
            <textarea v-model="expenseData.notes" class="w-full bg-white border border-slate-200 rounded-xl p-4 text-sm min-h-[100px] resize-none" placeholder="Add justification..."></textarea>
          </div>
        </div>
        <button @click="saveExpense" :disabled="isSaving" class="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-4 rounded-xl shadow-lg transition-all disabled:opacity-50">
          {{ isSaving ? "Saving..." : "Save Expense" }}
        </button>
      </section>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'app',
  middleware: ['super-admin']
})

const { recordDeposit, recordWithdrawal } = useTransactionService()
const { getTransactionCategories } = useExpenseService()
const { recordPayment } = usePaymentService()
const supabase = useSupabaseClient()

const incomeCategories = ref([])
const expenseCategories = ref([])
const isSaving = ref(false)

const incomeData = ref({
  categoryId: "",
  categoryName: "",
  categoryCode: "",
  unit: "",
  amount: "",
  projectName: "",
  notes: ""
})

const expenseData = ref({
  categoryId: "",
  amount: "",
  notes: ""
})

const availableUnits = computed(() => {
  const units = []
  for (let i = 1; i <= 11; i++) units.push(`R${i}`)
  for (let i = 1; i <= 12; i++) units.push(`A${i}`)
  for (let i = 1; i <= 10; i++) units.push(`B${i}`)
  return units
})

const formattedIncomeAmount = computed({
  get: () => formatNumberInput(incomeData.value.amount),
  set: (val) => incomeData.value.amount = val.replace(/\D/g, "")
})

const formattedExpenseAmount = computed({
  get: () => formatNumberInput(expenseData.value.amount),
  set: (val) => expenseData.value.amount = val.replace(/\D/g, "")
})

function setIncomeCategory(cat) {
  incomeData.value.categoryId = cat.id
  incomeData.value.categoryName = cat.name
  incomeData.value.categoryCode = cat.code
  applyAutofill()
}

function applyAutofill() {
  if (incomeData.value.categoryCode === 'IPL' || incomeData.value.categoryCode === 'THR') {
    if (incomeData.value.unit.startsWith('R')) {
      incomeData.value.amount = '250000'
    } else {
      incomeData.value.amount = '170000'
    }
  }
}

watch(() => incomeData.value.unit, () => {
  applyAutofill()
})

async function saveIncome() {
  isSaving.value = true
  try {
    const { data: unitRecord } = await supabase.from('units').select('id').eq('code', incomeData.value.unit).single()
    if (!unitRecord) throw new Error("Unit not found")

    // If IPL/THR, link to obligation (oldest unpaid)
    if (['IPL', 'THR'].includes(incomeData.value.categoryCode)) {
      const { data: obligations } = await supabase.from('payment_obligations')
        .select('id').eq('unit_id', unitRecord.id).eq('status', false).order('year').order('month_index')
      if (obligations?.length) {
        await recordPayment({ obligation_id: obligations[0].id, amount: parseInt(incomeData.value.amount) })
      }
    }

    const res = await recordDeposit({
      amount: parseInt(incomeData.value.amount),
      category_id: incomeData.value.categoryId,
      description: `${incomeData.value.categoryName} - Unit ${incomeData.value.unit}`,
      unit_id: unitRecord.id
    })
    if (res.success) resetIncome()
  } catch (err) {
    console.error(err)
  } finally {
    isSaving.value = false
  }
}

async function saveExpense() {
  isSaving.value = true
  try {
    const res = await recordWithdrawal({
      amount: parseInt(expenseData.value.amount),
      category_id: expenseData.value.categoryId,
      description: expenseData.value.notes || "General Expense"
    })
    if (res.success) resetExpense()
  } catch (err) {
    console.error(err)
  } finally {
    isSaving.value = false
  }
}

function resetIncome() { incomeData.value = { categoryId: "", categoryName: "", categoryCode: "", unit: "", amount: "", projectName: "", notes: "" } }
function resetExpense() { expenseData.value = { categoryId: "", amount: "", notes: "" } }
function formatNumberInput(val) { return val ? new Intl.NumberFormat('id-ID').format(val) : "" }

function enforceNumeric(e) {
  if (!/[0-9]/.test(e.key)) {
    e.preventDefault()
  }
}

onMounted(async () => {
  const inc = await getTransactionCategories('income')
  if (inc.success) incomeCategories.value = inc.data
  const exp = await getTransactionCategories('expense')
  if (exp.success) expenseCategories.value = exp.data
})
</script>
