<template>
  <div class="tracker-view p-4 md:p-8">
    <div class="flex items-end justify-between mb-6">
      <div>
        <h3 class="text-2xl font-black tracking-tight">Payment Tracker</h3>
        <p class="text-slate-500 text-sm">Detailed status of Monthly IPL & Special Fees</p>
      </div>
      <div class="flex gap-2">
        <button class="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-primary/10 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
          <span class="material-symbols-outlined text-[18px]">filter_list</span>
          Filter Block
        </button>
        <button class="flex items-center gap-2 bg-primary text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors">
          <span class="material-symbols-outlined text-[18px]">download</span>
          Export Tracker
        </button>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-900 rounded-xl border border-primary/10 shadow-sm overflow-hidden mb-6">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-800/50">
              <th class="p-4 font-bold text-slate-400 uppercase tracking-wider sticky left-0 bg-slate-50 dark:bg-slate-800 border-r border-primary/10 z-10 w-24">Unit</th>
              <th class="p-4 font-bold text-slate-400 uppercase tracking-wider min-w-[150px]">Owner</th>
              <th v-for="m in ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']" :key="m" class="p-4 font-bold text-slate-400 uppercase tracking-wider text-center w-16">
                {{ m }}
              </th>
              <th class="p-4 font-bold text-primary uppercase tracking-wider text-center bg-primary/5 w-16">THR</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-if="isLoading">
              <td colspan="15" class="p-12 text-center">
                <span class="material-symbols-outlined animate-spin text-3xl text-primary">refresh</span>
              </td>
            </tr>
            <tr v-else-if="trackerData.length === 0">
              <td colspan="15" class="p-12 text-center text-slate-400 font-medium">
                No tracking data found for the current year.
              </td>
            </tr>
            <tr v-else v-for="row in trackerData" :key="row.unit" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all">
              <td class="p-4 font-bold text-primary sticky left-0 bg-white dark:bg-slate-900 border-r border-primary/10">{{ row.unit }}</td>
              <td class="p-4 whitespace-nowrap font-medium">{{ row.owner }}</td>
              <td v-for="(status, index) in row.months" :key="index" class="p-4 text-center">
                <span class="material-symbols-outlined" :class="getStatusIcon(status).class">{{ getStatusIcon(status).icon }}</span>
              </td>
              <td class="p-4 text-center bg-primary/5">
                <span class="material-symbols-outlined" :class="getStatusIcon(row.thr).class">{{ getStatusIcon(row.thr).icon }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-primary/10 flex flex-wrap items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        <div class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[16px] text-emerald-500">check_circle</span> Paid</div>
        <div class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[16px] text-amber-500">warning</span> Pending</div>
        <div class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[16px] text-rose-500">close</span> Late</div>
        <div class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[16px] text-slate-300 dark:text-slate-700">radio_button_unchecked</span> Upcoming / N/A</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { supabase } from '@/services/supabaseClient.js'

const { isResident, isAdmin, session, displayName, unitCode } = useAuth()

const currentYear = ref(new Date().getFullYear())
const trackerData = ref([])
const isLoading = ref(true)

onMounted(async () => {
  isLoading.value = true
  
  if (isAdmin.value) {
    // 1. Fetch all active units
    const { data: units } = await supabase.from('units').select('id, code, display_name').order('code')
    
    // 2. Fetch obligations
    const { data: obligations } = await supabase
      .from('payment_obligations')
      .select('id, status, unit_id, event:payment_events(event_type, month, year)')
      
    const yearObs = obligations?.filter(o => o.event?.year === currentYear.value) || []
    
    // 3. Build the global matrix
    trackerData.value = (units || []).map(u => {
      const uObs = yearObs.filter(o => o.unit_id === u.id)
      
      return {
        unit: u.code,
        owner: u.display_name,
        months: [1,2,3,4,5,6,7,8,9,10,11,12].map(m => {
          const mOb = uObs.find(o => o.event?.event_type === 'IPL' && o.event?.month === m)
          // Default to upcoming if obligation hasn't been instantiated yet
          return mOb ? mOb.status : 'upcoming'
        }),
        thr: (uObs.find(o => o.event?.event_type === 'THR') || {}).status || 'upcoming'
      }
    })
  } else if (isResident.value && session.value?.unit_id) {
    // Fetch only the resident's obligations
    const { data: obligations } = await supabase
      .from('payment_obligations')
      .select('id, status, event:payment_events(event_type, month, year)')
      .eq('unit_id', session.value.unit_id)
      
    const yearObs = obligations?.filter(o => o.event?.year === currentYear.value) || []
    
    trackerData.value = [{
      unit: unitCode.value,
      owner: displayName.value,
      months: [1,2,3,4,5,6,7,8,9,10,11,12].map(m => {
        const mOb = yearObs.find(o => o.event?.event_type === 'IPL' && o.event?.month === m)
        return mOb ? mOb.status : 'upcoming'
      }),
      thr: (yearObs.find(o => o.event?.event_type === 'THR') || {}).status || 'upcoming'
    }]
  }
  
  isLoading.value = false
})

function getStatusIcon(status) {
   switch(status) {
      case 'paid': return { icon: 'check_circle', class: 'text-emerald-500' }
      case 'pending': return { icon: 'warning', class: 'text-amber-500' }
      case 'late': return { icon: 'close', class: 'text-rose-500' }
      default: return { icon: 'radio_button_unchecked', class: 'text-slate-300 dark:text-slate-700' }
   }
}
</script>
