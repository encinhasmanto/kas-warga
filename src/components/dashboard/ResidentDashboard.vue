<template>
  <div class="resident-dashboard flex flex-col gap-6 md:gap-8 px-0 md:px-0">
    <!-- Hero Section -->
    <section class="flex flex-col gap-4 pt-2">
      <div class="flex gap-4 items-center">
        <div class="bg-primary/10 rounded-xl p-4 flex flex-col items-center justify-center min-h-24 w-24 border border-primary/20 shrink-0 shadow-sm">
          <span class="text-primary font-bold text-2xl">{{ unitCode || '---' }}</span>
          <span class="text-primary/70 text-xs font-medium uppercase tracking-wider">Unit</span>
        </div>
        <div class="flex flex-col justify-center">
          <p class="text-slate-900 dark:text-slate-100 text-2xl md:text-3xl font-bold leading-tight tracking-tight">
            Welcome back, {{ firstName }}
          </p>
          <p class="text-slate-500 dark:text-slate-400 text-sm md:text-base font-normal mt-1">
            Resident • Good Standing
          </p>
        </div>
      </div>
    </section>

    <!-- Balance Section (Responsive Grid) -->
    <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      <div class="flex flex-col flex-1 justify-between rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
        <div class="absolute top-0 right-0 p-4 opacity-10 text-primary group-hover:scale-110 transition-transform">
          <span class="material-symbols-outlined text-6xl">account_balance_wallet</span>
        </div>
        <div>
          <p class="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider mb-2 mt-0">Main Balance (IPL & THR)</p>
          <div v-if="isLoading" class="h-10 w-32 bg-slate-100 dark:bg-slate-800 animate-pulse rounded"></div>
          <p v-else class="text-slate-900 dark:text-slate-100 tracking-tight text-3xl md:text-4xl font-extrabold leading-tight">Rp {{ formatNumber(mainBalance) }}</p>
        </div>
        <div class="flex items-center gap-1 mt-4">
          <span class="text-emerald-600 dark:text-emerald-400 text-sm font-bold bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">public</span> Global</span>
          <span class="text-slate-400 text-xs text-nowrap pl-1">community sum</span>
        </div>
      </div>
      
      <div class="flex flex-col flex-1 justify-between rounded-2xl p-6 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
        <div>
          <div class="flex justify-between items-start mb-2">
            <p class="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Sinking Fund</p>
            <span class="material-symbols-outlined text-slate-400">info</span>
          </div>
          <p class="text-slate-900 dark:text-slate-100 tracking-tight text-xl md:text-2xl font-bold">(Iuran Lainnya)</p>
          <div v-if="isLoading" class="mt-1 h-8 w-24 bg-slate-200 dark:bg-slate-700 animate-pulse rounded"></div>
          <p v-else class="text-primary tracking-tight text-2xl font-bold mt-1">Rp {{ formatNumber(sinkingFund) }}</p>
        </div>
        <div class="mt-4">
          <div class="flex justify-between items-center mt-2">
            <p class="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Global Special Fund</p>
          </div>
        </div>
      </div>
      
      <!-- 3rd box on large screens -->
      <div class="hidden lg:flex flex-col justify-between rounded-2xl p-6 bg-primary text-white shadow-lg shadow-primary/20 relative overflow-hidden group">
        <div class="absolute top-0 right-0 p-4 opacity-10 text-white group-hover:scale-110 transition-transform">
          <span class="material-symbols-outlined text-6xl">event</span>
        </div>
        <div>
          <p class="text-white/80 text-sm font-medium uppercase tracking-wider mb-2">Next Due Amount</p>
          <div v-if="isLoading" class="h-10 w-24 bg-white/20 animate-pulse rounded"></div>
          <p v-else class="text-white tracking-tight text-3xl font-extrabold leading-tight">Rp {{ formatNumber(nextDueAmount) }}</p>
        </div>
        <div class="mt-4">
          <button @click="isPaymentModalOpen = true" class="w-full py-2.5 bg-white text-primary rounded-lg font-bold text-sm hover:bg-slate-50 transition-all shadow-sm active:scale-95">
            Pay Now
          </button>
        </div>
      </div>
    </section>

    <!-- Payment Modal Component -->
    <PaymentModal 
      :isOpen="isPaymentModalOpen" 
      @close="isPaymentModalOpen = false" 
    />

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
      
      <!-- Left Column: Tracker & Transactions -->
      <div class="lg:col-span-2 space-y-6 md:space-y-8">
        
        <!-- 1-Line Payment Tracker (Desktop focus view) -->
        <section class="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-lg md:text-xl font-bold tracking-tight">Payment Tracker {{ currentYear }}</h3>
              <p class="text-slate-500 text-xs md:text-sm mt-1">Monitoring your annual IPL dues</p>
            </div>
            <router-link to="/app/tracker" class="text-primary text-sm font-semibold hover:underline hidden md:block">Full details</router-link>
          </div>
          
          <div v-if="isLoading" class="flex justify-center py-4"><span class="material-symbols-outlined animate-spin text-primary text-3xl">refresh</span></div>
          <div v-else class="overflow-x-auto pb-2 -mx-6 px-6 md:mx-0 md:px-0">
            <table class="w-full text-left text-xs md:text-sm border-collapse min-w-[600px]">
              <thead>
                <tr class="text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <th v-for="(m, i) in monthNames" :key="i" :class="['pb-3 text-center w-12', currentMonth === i+1 ? 'text-primary' : '']">{{ m }}</th>
                </tr>
              </thead>
              <tbody>
                <tr class="translate-y-2">
                  <td v-for="(monthData, i) in paymentMonths" :key="i" :class="['pt-3 text-center', currentMonth === i+1 ? 'bg-primary/5 rounded-lg' : '']">
                    <span v-if="monthData?.uiStatus === 'paid'" class="material-symbols-outlined text-emerald-500" :class="currentMonth === i+1 ? 'font-bold':''">check_circle</span>
                    <span v-else-if="monthData?.uiStatus === 'late'" class="material-symbols-outlined text-amber-500">warning</span>
                    <span v-else-if="monthData?.uiStatus === 'unpaid'" class="material-symbols-outlined text-rose-500">close</span>
                    <span v-else class="material-symbols-outlined text-slate-300 dark:text-slate-700">radio_button_unchecked</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Transaction History -->
        <section class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div class="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
            <h3 class="text-slate-900 dark:text-slate-100 text-lg md:text-xl font-bold tracking-tight mb-0">Recent Transactions</h3>
            <router-link to="/app/history" class="text-primary text-sm font-semibold hover:underline">View All</router-link>
          </div>
          
          <div v-if="isLoading" class="flex justify-center py-8"><span class="material-symbols-outlined animate-spin text-primary text-3xl">refresh</span></div>
          <div v-else-if="recentTransactions.length === 0" class="p-8 text-center text-slate-400 font-medium">No recent transactions found.</div>
          <div v-else class="overflow-x-auto">
            <!-- Desktop Table -->
            <table class="w-full text-left text-sm hidden md:table">
              <thead>
                <tr class="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-bold text-xs uppercase tracking-wider">
                  <th class="p-4">Date</th>
                  <th class="p-4">Description</th>
                  <th class="p-4 text-right">Amount</th>
                  <th class="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                <tr v-for="tx in recentTransactions" :key="tx.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td class="p-4 text-xs text-slate-500">{{ tx.date }}</td>
                  <td class="p-4 font-semibold">{{ tx.description }} <span class="block text-[10px] text-slate-400 font-normal uppercase mt-0.5">{{ tx.category }}</span></td>
                  <td class="p-4 font-bold text-right" :class="tx.type === 'withdrawal' ? 'text-rose-500' : 'text-emerald-500'">
                    {{ tx.type === 'withdrawal' ? '-' : '+' }}Rp {{ formatNumber(tx.amount) }}
                  </td>
                  <td class="p-4 text-center">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest"
                      :class="tx.type === 'withdrawal' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-600'">
                      {{ tx.type === 'withdrawal' ? 'Expense' : 'Completed' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
            
            <!-- Mobile Stack -->
            <div class="flex flex-col md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              <div v-for="tx in recentTransactions" :key="tx.id" class="flex items-center justify-between p-4 bg-white dark:bg-slate-900">
                <div class="flex items-center gap-3">
                  <div class="size-10 rounded-full flex items-center justify-center shrink-0"
                    :class="tx.type === 'withdrawal' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'">
                    <span class="material-symbols-outlined">{{ tx.type === 'withdrawal' ? 'receipt_long' : 'payments' }}</span>
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{{ tx.description }}</p>
                    <p class="text-[11px] text-slate-400">{{ tx.date }} • {{ tx.category }}</p>
                  </div>
                </div>
                <div class="text-right shrink-0">
                  <p class="text-sm font-bold" :class="tx.type === 'withdrawal' ? 'text-rose-500' : 'text-emerald-500'">
                    {{ tx.type === 'withdrawal' ? '-' : '+' }} Rp {{ formatNumber(tx.amount) }}
                  </p>
                  <p class="text-[10px] text-slate-400 font-medium uppercase mt-0.5">{{ tx.type === 'withdrawal' ? 'Expense' : 'Paid' }}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Right Column: Bulletin -->
      <div class="lg:col-span-1 space-y-6 md:space-y-8">
        <section>
          <div class="flex items-center justify-between mb-4 mt-2 lg:mt-0">
            <h3 class="text-slate-900 dark:text-slate-100 text-lg md:text-xl font-bold tracking-tight">Management Bulletin</h3>
            <router-link to="/app/bulletin" class="text-primary text-sm font-semibold hover:underline">See All</router-link>
          </div>
          
          <div v-if="latestBulletin" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group" @click="$router.push('/app/bulletin')">
            <div class="h-64 md:h-56 w-full relative overflow-hidden">
              <!-- Image -->
              <img 
                v-if="getFileType(latestBulletin.content_url) === 'image'"
                :src="latestBulletin.content_url" 
                alt="Bulletin" 
                class="relative z-10 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <!-- Video -->
              <video
                v-else-if="getFileType(latestBulletin.content_url) === 'video'"
                :src="latestBulletin.content_url"
                class="w-full h-full object-cover relative z-10"
                controls
                preload="metadata"
                @click.stop
              ></video>
              <!-- PDF -->
              <div v-else-if="getFileType(latestBulletin.content_url) === 'pdf'" class="w-full h-full flex flex-col items-center justify-center bg-rose-50 dark:bg-rose-900/20 relative z-10">
                <span class="material-symbols-outlined text-5xl text-rose-500">picture_as_pdf</span>
                <p class="text-xs font-bold text-rose-500 mt-2">PDF Document</p>
              </div>
              <!-- None -->
              <div v-else class="absolute inset-0 bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                <span class="material-symbols-outlined text-slate-400 text-4xl">newspaper</span>
              </div>
              <div class="absolute top-3 left-3 z-20 bg-primary/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm">
                {{ latestBulletin.category || 'Update' }}
              </div>
            </div>
            <div class="p-6 relative z-20 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
              <h4 class="font-bold text-lg md:text-xl text-slate-900 dark:text-slate-100 mb-3 leading-tight group-hover:text-primary transition-colors">{{ latestBulletin.title }}</h4>
              <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-6 m-0 p-0">{{ latestBulletin.content }}</p>
              <div class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div class="flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-slate-400 text-[14px]">calendar_month</span>
                  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">{{ formatDate(latestBulletin.created_at) }}</span>
                </div>
                <span class="material-symbols-outlined text-sm text-slate-400 group-hover:translate-x-1 group-hover:text-primary transition-all">arrow_forward</span>
              </div>
            </div>
          </div>

          <div v-else class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl p-8 text-center">
            <span class="material-symbols-outlined text-slate-300 text-4xl mb-2">newspaper</span>
            <p class="text-xs text-slate-400 font-medium">No bulletins posted yet.</p>
          </div>
          
          <!-- Quick support CTA card (Desktop focus) -->
          <div class="mt-6 bg-slate-900 text-white p-6 justify-between rounded-2xl relative overflow-hidden group items-center hidden lg:flex cursor-pointer transition-transform hover:-translate-y-1">
            <div class="relative z-10 w-full">
              <h4 class="font-bold text-lg mb-1">Need help?</h4>
              <p class="text-slate-400 text-xs mb-4">Contact building management for support.</p>
              <button class="w-full py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-sm">
                Message Support
              </button>
            </div>
            <span class="material-symbols-outlined absolute -right-4 -bottom-4 text-7xl text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-500">support_agent</span>
          </div>
        </section>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth.js'
import { supabase } from '@/services/supabaseClient.js'
import { getUnitPaymentStatus, getUnitFullHistory } from '@/services/paymentService.js'
import { getKasBalance } from '@/services/transactionService.js'
import { getBulletins } from '@/services/bulletinService.js'
import PaymentModal from '@/components/modals/PaymentModal.vue'

const { displayName, unitCode, session } = useAuth()

// Get first name for friendly greeting
const firstName = computed(() => {
  if (!displayName.value) return 'Resident'
  return displayName.value.split(' ')[0]
})

// Reactive State
const mainBalance = ref(0)
const sinkingFund = ref(0)
const nextDueAmount = ref(0)
const recentTransactions = ref([])
const paymentMonths = ref(Array(12).fill(null))
const latestBulletin = ref(null)
const isLoading = ref(true)
const isPaymentModalOpen = ref(false)

const currentYear = new Date().getFullYear()
const currentMonth = new Date().getMonth() + 1
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatNumber(val) {
  if (!val && val !== 0) return '0'
  return new Intl.NumberFormat('id-ID').format(val)
}

onMounted(async () => {
  isLoading.value = true
  
  try {
    // 1. Fetch Main Balance (Sum of all IPL + THR records globally)
    // OLD ONE
    // const { data: allPayments } = await supabase
    //   .from('payment_transactions')
    //   .select('amount, obligation:payment_obligations(event:payment_events(key))')
    // 1. Fetch Main Balance (Global Community Fund) using transactionService
    const kasRes = await getKasBalance()
    if (kasRes.success) {
      mainBalance.value = kasRes.balance
    }
    
    // 2. Extrapolate Sinking Fund (Iuran Lainnya) specifically for context
    const { data: allDeposits } = await supabase
      .from('transactions')
      .select('amount, description')
      .eq('type', 'deposit')
    
    if (allDeposits) {
      sinkingFund.value = allDeposits
        .filter(d => d.description && d.description.includes('Iuran Lainnya'))
        .reduce((sum, d) => sum + (d.amount || 0), 0)
    }

    // Connect to specific resident data if logged in
    const uId = session.value?.unit_id || session.value?.id
    if (uId && unitCode.value) {
      // 3. Unified history (IPL/THR + Sinking Fund/General)
      const { data: historyData } = await getUnitFullHistory(uId, unitCode.value)
      if (historyData) {
        recentTransactions.value = historyData.slice(0, 10).map(p => ({
          id: p.id,
          date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          description: p.description,
          category: p.category_name,
          amount: Math.abs(p.amount),
          type: p.type,
          method: p.method
        }))
      }
      
      // 4. Tracker View matrix logic
      const { data: statusData } = await getUnitPaymentStatus(uId)
      if (statusData && statusData.obligations) {
        nextDueAmount.value = statusData.current_due_total || 0
        
        const iplObligations = statusData.obligations.filter(o => 
          o.year === currentYear && 
          (o.event_key?.toLowerCase() === 'ipl' || o.event_id === 2)
        )
        const months = Array(12).fill(null)
        
        iplObligations.forEach(o => {
          if (o.month >= 1 && o.month <= 12) {
            
            // Determine UI status
            let uiStatus = 'upcoming'
            if (o.status) {
              uiStatus = 'paid'
            } else {
              const today = new Date()
              const currentY = today.getFullYear()
              const currentM = today.getMonth() + 1
              if (o.year > currentY || (o.year === currentY && o.month >= currentM)) {
                uiStatus = 'upcoming'
              } else {
                const monthsDiff = (currentY * 12 + currentM) - (o.year * 12 + o.month)
                uiStatus = (monthsDiff < 2 && monthsDiff > 0) ? 'late' : 'unpaid'
              }
            }
            
            months[o.month - 1] = {
              status: o.status,
              uiStatus: uiStatus,
              amount_due: o.amount_due,
              amount_remaining: o.amount_remaining
            }
          }
        })
        paymentMonths.value = months
      }
    }

    // 5. Fetch latest bulletin
    const bulletinRes = await getBulletins({ limit: 1 })
    if (bulletinRes.success && bulletinRes.data.length > 0) {
      latestBulletin.value = bulletinRes.data[0]
    }

  } catch (err) {
    console.error("Dashboard Sync Error:", err)
  }
  
  isLoading.value = false
})

function formatDate(isoString) {
  if (!isoString) return ''
  return new Date(isoString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

function getFileType(url) {
  if (!url) return 'none'
  const lower = url.toLowerCase()
  if (/\.(jpg|jpeg|png|gif|webp|svg|bmp|avif)(\?|$)/i.test(lower)) return 'image'
  if (/\.(mp4|webm|mov|avi|mkv|ogg)(\?|$)/i.test(lower)) return 'video'
  if (/\.pdf(\?|$)/i.test(lower)) return 'pdf'
  if (lower.includes('youtube.com') || lower.includes('youtu.be') || lower.includes('vimeo.com')) return 'video'
  if (lower.includes('/storage/') && !lower.includes('.pdf')) return 'image'
  return 'unknown'
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
