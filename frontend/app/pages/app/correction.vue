<template>
  <div class="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-black">Financial Correction</h2>
        <p class="text-xs text-slate-500 mt-1">Adjust balances for errors or audits.</p>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 p-6 shadow-sm">
      <form @submit.prevent="handleCorrection" class="space-y-6">
        <div class="grid grid-cols-2 gap-3">
          <button type="button" @click="form.type = 'deposit'" :class="['py-3 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-2', form.type === 'deposit' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-slate-100 text-slate-400']">
            <span class="material-symbols-outlined">trending_up</span> Income (Add)
          </button>
          <button type="button" @click="form.type = 'withdrawal'" :class="['py-3 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-2', form.type === 'withdrawal' ? 'border-rose-500 bg-rose-50 text-rose-600' : 'border-slate-100 text-slate-400']">
            <span class="material-symbols-outlined">trending_down</span> Expense (Sub)
          </button>
        </div>

        <div class="space-y-2">
          <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Correction Amount</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rp</span>
            <input v-model="formattedAmount" @keypress="enforceNumeric" inputmode="numeric" pattern="[0-9]*" type="number" placeholder="0" required class="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-xl text-lg font-black focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Correction Note</label>
          <textarea v-model="form.description" rows="3" placeholder="Reason..." required class="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm resize-none"></textarea>
        </div>

        <button type="submit" :disabled="isSaving" class="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">
          {{ isSaving ? 'Recording...' : 'Apply Correction' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'app',
  middleware: ['super-admin']
})

const { recordDeposit, recordWithdrawal } = useTransactionService()
const router = useRouter()

const isSaving = ref(false)
const form = reactive({ type: 'deposit', amount: 0, description: '' })

const formattedAmount = computed({
  get: () => form.amount ? new Intl.NumberFormat('id-ID').format(form.amount) : '',
  set: (val) => form.amount = parseInt(val.replace(/\D/g, '') || '0')
})

async function handleCorrection() {
  if (form.amount <= 0) return
  isSaving.value = true
  const res = form.type === 'deposit'
    ? await recordDeposit({ amount: form.amount, description: `[CORRECTION] ${form.description}` })
    : await recordWithdrawal({ amount: form.amount, description: `[CORRECTION] ${form.description}` })
  
  if (res.success) await navigateTo('/app/history')
  isSaving.value = false
}
</script>
