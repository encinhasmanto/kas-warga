<template>
  <div class="special-events-view p-4 md:p-8 max-w-4xl mx-auto">
    <header class="mb-8">
      <h1 class="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Special Events Settings</h1>
      <p class="text-slate-500 text-sm mt-1">Manage global due dates for one-time fees (e.g. THR)</p>
    </header>

    <div class="grid gap-6">
      <!-- THR Settings Card -->
      <section class="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
        <div class="absolute top-0 right-0 p-8 opacity-5 text-primary group-hover:scale-110 transition-transform">
          <span class="material-symbols-outlined text-8xl">celebration</span>
        </div>
        
        <div class="relative z-10 space-y-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <span class="material-symbols-outlined">calendar_month</span>
            </div>
            <div>
              <h2 class="text-lg font-black tracking-tight">THR Due Date</h2>
              <p class="text-xs text-slate-400 font-bold uppercase tracking-widest">Global One-time Fee</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
            <div class="space-y-3">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Month ({{ currentYear }})</label>
              <select 
                v-model="thrMonth" 
                class="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-primary/20 font-bold transition-all appearance-none cursor-pointer"
              >
                <option v-for="(month, index) in monthNames" :key="index" :value="index + 1">
                  {{ month }} {{ currentYear }}
                </option>
              </select>
            </div>

            <button 
              @click="handleSave" 
              :disabled="isSaving"
              class="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              <span class="material-symbols-outlined text-xl" :class="{ 'animate-spin': isSaving }">
                {{ isSaving ? 'refresh' : 'auto_mode' }}
              </span>
              Apply Globally
            </button>
          </div>

          <div class="bg-amber-50 dark:bg-amber-900/10 rounded-2xl p-4 border border-amber-100 dark:border-amber-900/20">
            <div class="flex gap-3">
              <span class="material-symbols-outlined text-amber-500 text-xl">info</span>
              <p class="text-xs text-amber-800 dark:text-amber-400 font-medium leading-relaxed">
                Applying this change will move the "Next Due" status for THR to <strong>{{ monthNames[thrMonth - 1] }}</strong> for all residents. Existing payments will not be affected.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- History / Info -->
      <section class="bg-slate-50 dark:bg-slate-800/30 rounded-3xl p-6 border border-dashed border-slate-200 dark:border-slate-800 text-center">
        <p class="text-xs text-slate-400 font-bold uppercase tracking-widest">More settings coming soon</p>
      </section>
    </div>

    <!-- Success Toast -->
    <transition name="toast">
      <div v-if="showToast" class="fixed bottom-8 right-8 z-50 bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300">
        <span class="material-symbols-outlined">check_circle</span>
        <span class="font-bold text-sm">THR due date updated successfully!</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { updateEventObligations } from '@/services/paymentService.js'

const currentYear = new Date().getFullYear()
const thrMonth = ref(4) // Default April
const isSaving = ref(false)
const showToast = ref(false)

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

async function handleSave() {
  if (isSaving.value) return
  
  isSaving.value = true
  const res = await updateEventObligations('thr', currentYear, thrMonth.value)
  
  if (res.success) {
    showToast.value = true
    setTimeout(() => { showToast.value = false }, 3000)
  } else {
    alert("Failed to update: " + res.error)
  }
  
  isSaving.value = false
}
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.5s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(20px); }
</style>
