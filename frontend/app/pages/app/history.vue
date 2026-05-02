<template>
  <div class="history-view p-4 md:p-8 max-w-7xl mx-auto space-y-6">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h2 class="text-2xl font-black tracking-tight">Transaction History</h2>
        <p class="text-slate-500 text-sm mt-1">Comprehensive log of all financial activities.</p>
      </div>
      <div class="flex flex-col md:flex-row md:items-center gap-4 w-full md:w-auto">
        <div class="relative w-full md:w-72">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input v-model="searchQuery" type="text" placeholder="Search records..." class="h-10 w-full pl-10 pr-4 bg-white dark:bg-slate-900 border border-slate-200 rounded-lg text-sm" />
        </div>
        <div class="flex items-center gap-2">
          <button @click="exportToCSV" class="h-10 px-4 bg-white border border-slate-200 rounded-lg text-sm font-semibold flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">download</span> Export
          </button>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-800 text-slate-400 font-bold text-xs uppercase tracking-wider border-b">
              <th class="p-4">Date & Time</th>
              <th v-if="isAdmin" class="p-4">Unit</th>
              <th class="p-4">Description</th>
              <th class="p-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-if="isLoading">
              <td colspan="4" class="p-8 text-center"><span class="material-symbols-outlined animate-spin text-primary">refresh</span></td>
            </tr>
            <tr v-else v-for="tx in paginatedTransactions" :key="tx.id" class="hover:bg-slate-50">
              <td class="p-4 text-xs text-slate-500">{{ formatDate(tx.date) }}</td>
              <td v-if="isAdmin" class="p-4 font-bold text-primary">{{ tx.unit?.code || tx.unit_code || '-' }}</td>
              <td class="p-4 font-semibold">{{ tx.description }}</td>
              <td class="p-4 text-right font-bold" :class="tx.type === 'withdrawal' ? 'text-rose-500' : 'text-emerald-500'">
                {{ tx.type === 'withdrawal' ? '-' : '+' }}Rp {{ formatNumber(tx.amount) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="filteredTransactions.length > 0" class="mt-auto p-4 border-t bg-slate-50 flex items-center justify-between">
        <p class="text-xs text-slate-500">Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredTransactions.length) }} of {{ filteredTransactions.length }}</p>
        <div class="flex gap-2">
          <button @click="currentPage--" :disabled="currentPage === 1" class="size-8 rounded border bg-white disabled:opacity-50">
            <span class="material-symbols-outlined">chevron_left</span>
          </button>
          <button @click="currentPage++" :disabled="currentPage >= totalPages" class="size-8 rounded border bg-white disabled:opacity-50">
            <span class="material-symbols-outlined">chevron_right</span>
          </button>
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

const { isAdmin, unitId, unitCode } = useAuth()
const { getTransactions } = useTransactionService()
const { getUnitFullHistory } = usePaymentService()

const allTransactions = ref([])
const isLoading = ref(true)
const searchQuery = ref("")
const currentPage = ref(1)
const itemsPerPage = 25

const filteredTransactions = computed(() => {
  if (!searchQuery.value) return allTransactions.value
  const q = searchQuery.value.toLowerCase()
  return allTransactions.value.filter(tx => 
    tx.description?.toLowerCase().includes(q) || 
    tx.unit?.toLowerCase().includes(q)
  )
})

const totalPages = computed(() => Math.ceil(filteredTransactions.value.length / itemsPerPage))
const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredTransactions.value.slice(start, start + itemsPerPage)
})

function formatNumber(val) {
  return new Intl.NumberFormat('id-ID').format(Math.abs(val))
}

function formatDate(date) {
  return new Date(date).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })
}

async function fetchData() {
  isLoading.value = true
  try {
    const res = isAdmin.value 
      ? await getTransactions({ limit: 100 })
      : await getUnitFullHistory(unitId.value)
    
    if (res.success) {
      allTransactions.value = res.data.map(tx => ({
        ...tx,
        date: tx.transaction_date || tx.date,
        unit_code: tx.unit?.code || tx.unit_code
      }))
    }
  } catch (err) {
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

function exportToCSV() {
  // Implementation
}

onMounted(fetchData)
</script>
