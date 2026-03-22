<template>
  <div class="history-view p-4 md:p-8 max-w-7xl mx-auto space-y-6">
    
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h2 class="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">Transaction History</h2>
        <p class="text-slate-500 text-sm mt-1">Comprehensive log of all financial activities.</p>
      </div>
      <div class="flex items-center gap-3">
        <div class="relative">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
          <input 
            type="text" 
            placeholder="Search records..." 
            class="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 w-48 md:w-64"
          >
        </div>
        <button class="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          <span class="material-symbols-outlined text-[18px]">filter_list</span> <span class="hidden sm:inline">Filter</span>
        </button>
      </div>
    </div>

    <!-- Main Table Card -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-bold text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <th class="p-4">Date & Time</th>
              <th class="p-4" v-if="!isResident">Unit</th>
              <th class="p-4">Description</th>
              <th class="p-4">Category</th>
              <th class="p-4">Ref/ID</th>
              <th class="p-4 text-right">Amount</th>
              <th class="p-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-if="isLoading">
              <td colspan="7" class="p-8 text-center text-slate-400">
                <span class="material-symbols-outlined animate-spin text-3xl text-primary">refresh</span>
              </td>
            </tr>
            <tr v-else-if="filteredTransactions.length === 0">
              <td colspan="7" class="p-8 text-center text-slate-400 font-medium">
                No transactions found.
              </td>
            </tr>
            <tr v-else v-for="tx in paginatedTransactions" :key="tx.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <td class="p-4 text-slate-500 text-xs">{{ tx.dateShort }}<br><span class="text-[10px]">{{ tx.time }}</span></td>
              <td class="p-4 font-bold text-primary" v-if="isAdmin">{{ tx.unit || '-' }}</td>
              <td class="p-4 font-semibold text-slate-900 dark:text-slate-100 max-w-xs truncate" :title="tx.description">{{ tx.description }}</td>
              <td class="p-4">
                <span :class="[
                  'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest',
                  tx.type === 'deposit' || tx.type === 'Income' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600'
                ]">
                  {{ tx.type === 'deposit' || tx.type === 'Income' ? 'Income' : 'Expense' }}
                </span>
              </td>
              <td class="p-4 text-xs font-mono text-slate-400">TRX-{{ tx.id.substring(0,6).toUpperCase() }}</td>
              <td class="p-4 text-right font-bold" :class="tx.type === 'deposit' || tx.type === 'Income' ? 'text-emerald-500' : 'text-rose-500'">
                {{ tx.type === 'deposit' || tx.type === 'Income' ? '+' : '-' }}Rp {{ formatNumber(tx.amount) }}
              </td>
              <td class="p-4 text-center">
                <span class="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  <span class="w-1.5 h-1.5 rounded-full inline-block mr-1" :class="tx.status === 'Completed' ? 'bg-emerald-500' : 'bg-amber-500'"></span>{{ tx.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Footer Pagination -->
      <div class="mt-auto p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between">
        <p class="text-xs text-slate-500 font-medium">Showing 1 to 5 of 124 entries</p>
        <div class="flex items-center gap-2">
          <button class="size-8 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 disabled:opacity-50" disabled>
            <span class="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          <span class="size-8 rounded bg-primary text-white flex items-center justify-center text-xs font-bold shadow-sm">1</span>
          <span class="size-8 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center text-xs font-medium cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700">2</span>
          <span class="size-8 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center text-xs font-medium cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700">3</span>
          <button class="size-8 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer">
            <span class="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth.js'
import { getTransactions } from '@/services/transactionService.js'
import { getUnitPayments } from '@/services/paymentService.js'

const { isResident, isAdmin, session } = useAuth()

const allTransactions = ref([])
const isLoading = ref(true)

function formatNumber(val) {
  if (!val && val !== 0) return '0'
  return new Intl.NumberFormat('id-ID').format(Math.abs(val))
}

const filteredTransactions = computed(() => {
  return allTransactions.value // Can hook up search query here later
})

const paginatedTransactions = computed(() => {
  return filteredTransactions.value.slice(0, 50) // Showing top 50 for now
})

onMounted(async () => {
  isLoading.value = true
  
  if (isAdmin.value) {
    // Admin gets global KAS history
    const res = await getTransactions({ limit: 100 })
    if (res.success) {
      allTransactions.value = res.data.map(tx => {
        const d = new Date(tx.transaction_date)
        
        let unitExtracted = '-'
        if (tx.description && tx.description.includes('Unit')) {
           const parts = tx.description.split('Unit')
           if(parts.length > 1) {
             unitExtracted = parts[1].trim()
           }
        }

        return {
          id: tx.id,
          dateShort: d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          unit: unitExtracted,
          description: tx.description || (tx.type === 'deposit' ? 'Kas Deposit' : 'Kas Withdrawal'),
          type: tx.type,
          amount: tx.amount,
          status: 'Completed' // Assuming transactions recorded are completed
        }
      })
    }
  } else if (isResident.value && session.value?.unit_id) {
    // Resident gets specific personal payment history
    const res = await getUnitPayments(session.value.unit_id)
    if (res.success) {
      allTransactions.value = res.data.map(tx => {
        const d = new Date(tx.payment_date)
        return {
          id: tx.id,
          dateShort: d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          unit: '-',
          description: tx.obligation?.event?.name || 'Manual Payment',
          type: 'Income', // Personal payments are always "Payments" from their perspective to the building
          amount: tx.amount,
          status: tx.status === 'completed' ? 'Completed' : 'Pending'
        }
      })
    }
  }
  
  isLoading.value = false
})
</script>
