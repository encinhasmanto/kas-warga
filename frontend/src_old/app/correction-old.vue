<template>
  <div class="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-black text-slate-900 dark:text-slate-100">Financial Correction</h2>
        <p class="text-xs text-slate-500 mt-1">Adjust balances for errors or audits.</p>
      </div>
      <button @click="$router.back()" class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>

    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
      <form @submit.prevent="handleCorrection" class="space-y-6">
        <!-- Type Selection -->
        <div class="grid grid-cols-2 gap-3">
          <button 
            type="button"
            @click="form.type = 'deposit'"
            :class="[
              'py-3 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-2',
              form.type === 'deposit' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-200'
            ]"
          >
            <span class="material-symbols-outlined">trending_up</span> Income (Add)
          </button>
          <button 
            type="button"
            @click="form.type = 'withdrawal'"
            :class="[
              'py-3 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-2',
              form.type === 'withdrawal' ? 'border-rose-500 bg-rose-50 text-rose-600' : 'border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-200'
            ]"
          >
            <span class="material-symbols-outlined">trending_down</span> Expense (Sub)
          </button>
        </div>

        <!-- Amount -->
        <div class="space-y-2">
          <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Correction Amount</label>
          <div class="relative group">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rp</span>
            <input 
              v-model="formattedAmount"
              @keypress="e => { if(!/[0-9]/.test(e.key)) e.preventDefault() }"
              type="text"
              inputmode="numeric"
              placeholder="0"
              required
              class="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-lg font-black focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        <!-- Note -->
        <div class="space-y-2">
          <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Correction Note</label>
          <textarea 
            v-model="form.description"
            rows="3"
            placeholder="Reason for this correction..."
            required
            class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all resize-none"
          ></textarea>
        </div>

        <button 
          type="submit" 
          :disabled="isSaving"
          class="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <span v-if="isSaving" class="material-symbols-outlined animate-spin">refresh</span>
          <span v-else class="material-symbols-outlined">check_circle</span>
          {{ isSaving ? 'Recording...' : 'Apply Correction' }}
        </button>
      </form>
    </div>
    
    <!-- Toast Messages -->
    <div v-if="toast" class="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl shadow-2xl z-[100] flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4" 
      :class="toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'">
      <span class="material-symbols-outlined">{{ toast.type === 'success' ? 'check_circle' : 'error' }}</span>
      <p class="text-sm font-bold">{{ toast.message }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { recordDeposit, recordWithdrawal } from '@/services/transactionService.js'

const router = useRouter()
const isSaving = ref(false)
const toast = ref(null)

const form = reactive({
  type: 'deposit',
  amount: null,
  description: '',
  category_id: 'correction' // Special identifier handled by service if not numeric
})

const formattedAmount = computed({
  get: () => {
    if (!form.amount) return ''
    return new Intl.NumberFormat('id-ID').format(form.amount)
  },
  set: (val) => {
    const rawValue = val.replace(/\D/g, '')
    form.amount = rawValue ? parseInt(rawValue, 10) : null
  }
})

async function handleCorrection() {
  if (!form.amount || form.amount <= 0) return
  
  isSaving.value = true
  const res = form.type === 'deposit' 
    ? await recordDeposit({ amount: form.amount, description: `[CORRECTION] ${form.description}`, category_id: 'correction' })
    : await recordWithdrawal({ amount: form.amount, description: `[CORRECTION] ${form.description}`, category_id: 'correction' })

  if (res.success) {
    showToast('Correction applied successfully!', 'success')
    setTimeout(() => {
      router.push({ name: 'history' })
    }, 2000)
  } else {
    showToast(`Error: ${res.error}`, 'error')
  }
  isSaving.value = false
}

function showToast(msg, type) {
  toast.value = { message: msg, type }
  setTimeout(() => toast.value = null, 3000)
}
</script>
