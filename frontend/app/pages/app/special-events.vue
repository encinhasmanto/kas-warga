<template>
  <div class="special-events-view p-4 md:p-8 max-w-4xl mx-auto space-y-8">
    <header>
      <h1 class="text-2xl font-black tracking-tight">Special Events Settings</h1>
      <p class="text-slate-500 text-sm mt-1">Manage global due dates for one-time fees (e.g. THR)</p>
    </header>

    <div class="grid gap-6">
      <section class="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm relative group overflow-hidden">
        <div class="absolute top-0 right-0 p-8 opacity-5 text-primary group-hover:scale-110 transition-transform">
          <span class="material-symbols-outlined text-8xl">celebration</span>
        </div>

        <div class="relative z-10 space-y-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <span class="material-symbols-outlined">calendar_month</span>
            </div>
            <div>
              <h2 class="text-lg font-black">THR Due Date</h2>
              <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Global One-time Fee</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
            <div class="space-y-3">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Month ({{ currentYear }})</label>
              <select v-model="thrMonth" class="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 font-bold cursor-pointer">
                <option v-for="(month, index) in monthNames" :key="index" :value="index + 1">{{ month }} {{ currentYear }}</option>
              </select>
            </div>
            <button @click="handleSave" :disabled="isSaving" class="bg-primary text-white font-bold py-4 px-8 rounded-2xl shadow-lg disabled:opacity-50 flex items-center justify-center gap-3">
              <span class="material-symbols-outlined text-xl" :class="{ 'animate-spin': isSaving }">{{ isSaving ? 'refresh' : 'auto_mode' }}</span>
              Apply Globally
            </button>
          </div>

          <div class="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex gap-3 text-xs text-amber-800 font-medium">
            <span class="material-symbols-outlined text-amber-500 text-xl">info</span>
            <p>Applying this will set the THR due date for all residents. Existing payments are unaffected.</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'app',
  middleware: ['super-admin']
})

const { updateEventObligations } = useEventService()

const currentYear = new Date().getFullYear()
const thrMonth = ref(4)
const isSaving = ref(false)

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

async function handleSave() {
  isSaving.value = true
  try {
    const res = await updateEventObligations('thr', currentYear, thrMonth.value)
    if (res.success) alert("THR due date updated successfully")
  } finally {
    isSaving.value = false
  }
}
</script>
