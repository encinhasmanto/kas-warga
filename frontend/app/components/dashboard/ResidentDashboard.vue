<template>
  <div class="resident-dashboard flex flex-col gap-6 md:gap-8 px-0 md:px-0">
    <!-- Hero Section -->
    <section class="flex flex-col gap-4 pt-2">
      <div class="flex gap-4 items-center">
        <div class="bg-primary/10 rounded-xl p-4 flex flex-col items-center justify-center min-h-24 w-24 border border-primary/20 shrink-0 shadow-sm">
          <span class="text-primary font-bold text-2xl">{{ unitCode || "---" }}</span>
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

    <!-- Next Due Banner (Mobile Only) -->
    <div v-if="nextDueAmount > 0" class="lg:hidden bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500 mb-2">
      <div class="flex items-center gap-3">
        <div class="size-10 bg-primary rounded-xl flex items-center justify-center text-white scale-90 shadow-sm">
          <span class="material-symbols-outlined text-lg">event_upcoming</span>
        </div>
        <div>
          <p class="text-[10px] font-bold text-primary uppercase tracking-widest leading-none mb-1">
            Due: {{ nextDueMonthLabel }}
          </p>
          <p class="text-slate-900 dark:text-white font-black text-lg">
            Rp {{ formatNumber(nextDueAmount) }}
          </p>
        </div>
      </div>
      <button @click="isPaymentModalOpen = true" class="bg-primary hover:bg-primary/90 text-white text-xs font-bold px-4 py-2.5 rounded-xl active:scale-95 transition-all shadow-sm">
        Pay Now
      </button>
    </div>

    <!-- Balance Section -->
    <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      <div class="flex flex-col flex-1 justify-between rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
        <div class="absolute top-0 right-0 p-4 opacity-10 text-primary group-hover:scale-110 transition-transform">
          <span class="material-symbols-outlined text-6xl">account_balance_wallet</span>
        </div>
        <div>
          <p class="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider mb-2 mt-0">
            Main Balance (IPL & THR)
          </p>
          <p v-if="!isLoading" class="text-slate-900 dark:text-slate-100 tracking-tight font-extrabold leading-tight text-2xl md:text-4xl">
            Rp {{ formatNumber(mainBalance) }}
          </p>
          <div v-else class="h-10 w-32 bg-slate-100 dark:bg-slate-800 animate-pulse rounded"></div>
        </div>
        <div class="flex items-center gap-1 mt-4">
          <span class="text-emerald-600 dark:text-emerald-400 text-sm font-bold bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px]">public</span> Global
          </span>
          <span class="text-slate-400 text-xs text-nowrap pl-1">community sum</span>
        </div>
      </div>

      <div class="flex flex-col flex-1 justify-between rounded-2xl p-6 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <div class="flex justify-between items-start mb-2">
            <p class="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Sinking Fund</p>
          </div>
          <p class="text-slate-900 dark:text-slate-100 tracking-tight text-xl md:text-2xl font-bold">(Iuran Lainnya)</p>
          <p v-if="!isLoading" class="text-primary tracking-tight font-bold mt-1 text-lg md:text-2xl">
            Rp {{ formatNumber(sinkingFund) }}
          </p>
        </div>
      </div>

      <div class="hidden lg:flex flex-col justify-between rounded-2xl p-6 bg-primary text-white shadow-lg shadow-primary/20 relative overflow-hidden group">
        <div>
          <p class="text-white/80 text-sm font-medium uppercase tracking-wider mb-2">Next Due: {{ nextDueMonthLabel }}</p>
          <p v-if="!isLoading" class="text-white tracking-tight font-extrabold leading-tight text-2xl md:text-4xl">
            Rp {{ formatNumber(nextDueAmount) }}
          </p>
        </div>
        <div class="mt-4">
          <button @click="isPaymentModalOpen = true" class="w-full py-2.5 bg-white text-primary rounded-lg font-bold text-sm hover:bg-slate-50 transition-all shadow-sm active:scale-95">
            Pay Now
          </button>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
      <div class="lg:col-span-2 space-y-6 md:space-y-8">
        <!-- Tracker -->
        <section class="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg md:text-xl font-bold tracking-tight">Payment Tracker {{ currentYear }}</h3>
            <span class="text-xs uppercase tracking-widest text-slate-400">Condensed timeline</span>
          </div>

          <div v-if="isLoading" class="flex justify-center py-4">
            <span class="material-symbols-outlined animate-spin text-primary text-3xl">refresh</span>
          </div>

          <div v-else class="overflow-x-auto pb-2 -mx-6 px-6 md:mx-0 md:px-0">
            <div class="flex items-stretch gap-3 min-w-[560px]">
              <template v-for="item in trackerItems" :key="item.key">
                <div v-if="item.type !== 'ellipsis'" class="flex-shrink-0 min-w-[92px] rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 text-center shadow-sm">
                  <button
                    v-if="item.status"
                    @click="handleShowReceipt(item)"
                    type="button"
                    class="group flex w-full flex-col items-center justify-center gap-2"
                  >
                    <span
                      class="material-symbols-outlined text-3xl transition-transform"
                      :class="item.uiStatus === 'paid'
                        ? 'text-emerald-500 group-hover:scale-110'
                        : item.uiStatus === 'late'
                        ? 'text-amber-500'
                        : item.uiStatus === 'unpaid'
                        ? 'text-rose-500'
                        : 'text-slate-400'"
                    >
                      {{ item.uiStatus === 'paid' ? 'check_circle' : item.uiStatus === 'late' ? 'warning' : item.uiStatus === 'unpaid' ? 'close' : 'radio_button_unchecked' }}
                    </span>
                    <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ item.label }}</p>
                    <p class="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                      {{ item.type === 'thr' ? 'THR' : item.uiStatus === 'paid' ? 'Paid' : item.uiStatus === 'late' ? 'Late' : item.uiStatus === 'unpaid' ? 'Unpaid' : 'Upcoming' }}
                    </p>
                  </button>

                  <div v-else class="flex flex-col items-center justify-center gap-2">
                    <span
                      class="material-symbols-outlined text-3xl"
                      :class="item.uiStatus === 'paid'
                        ? 'text-emerald-500'
                        : item.uiStatus === 'late'
                        ? 'text-amber-500'
                        : item.uiStatus === 'unpaid'
                        ? 'text-rose-500'
                        : 'text-slate-400'"
                    >
                      {{ item.uiStatus === 'paid' ? 'check_circle' : item.uiStatus === 'late' ? 'warning' : item.uiStatus === 'unpaid' ? 'close' : 'radio_button_unchecked' }}
                    </span>
                    <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ item.label }}</p>
                    <p class="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                      {{ item.type === 'thr' ? 'THR' : item.uiStatus === 'paid' ? 'Paid' : item.uiStatus === 'late' ? 'Late' : item.uiStatus === 'unpaid' ? 'Unpaid' : 'Upcoming' }}
                    </p>
                  </div>
                </div>

                <div v-else class="flex-shrink-0 min-w-[92px] flex items-center justify-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-400 shadow-sm">
                  <span class="material-symbols-outlined text-3xl">more_horiz</span>
                </div>
              </template>
            </div>
          </div>
        </section>

        <ClientOnly>
          <ModalsReceiptPreviewModal
            :is-open="isReceiptPreviewOpen"
            :receipt-data="selectedReceiptData"
            :error-message="receiptError"
            @close="closeReceiptPreview"
          />
        </ClientOnly>

        <!-- History -->
        <section class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div class="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
            <h3 class="text-lg md:text-xl font-bold tracking-tight">Recent Transactions</h3>
            <NuxtLink to="/app/history" class="text-primary text-sm font-semibold hover:underline">View All</NuxtLink>
          </div>
          <div v-if="isLoading" class="flex justify-center py-8">
            <span class="material-symbols-outlined animate-spin text-primary text-3xl">refresh</span>
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full text-left text-sm hidden md:table">
              <thead>
                <tr class="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-bold text-xs uppercase tracking-wider">
                  <th class="p-4">Date</th>
                  <th class="p-4">Description</th>
                  <th class="p-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                <tr v-for="tx in recentTransactions" :key="tx.id" class="hover:bg-slate-50">
                  <td class="p-4 text-xs text-slate-50">{{ tx.date }}</td>
                  <td class="p-4 font-semibold">{{ tx.description }}</td>
                  <td class="p-4 font-bold text-right" :class="tx.type === 'withdrawal' ? 'text-rose-500' : 'text-emerald-500'">
                    {{ tx.type === 'withdrawal' ? '-' : '+' }}Rp {{ formatNumber(tx.amount) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <!-- Bulletin -->
      <div class="lg:col-span-1">
        <section>
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg md:text-xl font-bold tracking-tight">Bulletin Board</h3>
            <NuxtLink to="/app/bulletin" class="text-primary text-sm font-semibold hover:underline">See All</NuxtLink>
          </div>
          <div v-if="latestBulletin" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm group cursor-pointer" @click="selectedBulletin = latestBulletin">
            <img v-if="latestBulletin.content_url" :src="latestBulletin.content_url" class="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div class="p-6">
              <h4 class="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{{ latestBulletin.title }}</h4>
              <div class="text-sm text-slate-500 line-clamp-3 prose prose-slate dark:prose-invert max-w-none" v-html="sanitizedLatestBulletin"></div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- Modals -->
    <ModalsPaymentModal 
      :is-open="isPaymentModalOpen" 
      :unit-id="unitId" 
      @close="isPaymentModalOpen = false" 
    />

    <BulletinDetailModal 
      :bulletin="selectedBulletin" 
      :is-open="!!selectedBulletin" 
      @close="selectedBulletin = null" 
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { sanitizeHtml } from '~/utils/sanitizeHtml'
import BulletinDetailModal from '~/components/modals/BulletinDetailModal.vue'
const { firstName, unitCode, unitId } = useAuth()
const { getKasBalance } = useTransactionService()
const { getUnitPaymentStatus, getUnitFullHistory } = usePaymentService()
const { getBulletins } = useBulletinService()
const { getReceiptByObligation, generateReceipt } = useReceiptService()

const mainBalance = ref(0)
const sinkingFund = ref(0)
const nextDueAmount = ref(0)
const recentTransactions = ref([])
const trackerItems = ref([])
const latestBulletin = ref(null)
const selectedBulletin = ref(null)
const sanitizedLatestBulletin = computed(() => sanitizeHtml(latestBulletin.value?.content || ""))
const isLoading = ref(true)
const isPaymentModalOpen = ref(false)
const isReceiptPreviewOpen = ref(false)
const selectedReceiptData = ref(null)
const receiptError = ref(null)
const nextDueMonthLabel = ref("")

const currentYear = new Date().getFullYear()
const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

async function fetchData() {
  isLoading.value = true
  try {
    const [kas, bulletins, status, history] = await Promise.all([
      getKasBalance(),
      getBulletins({ limit: 1 }),
      getUnitPaymentStatus(unitId.value),
      getUnitFullHistory(unitId.value)
    ])

    if (kas.success) mainBalance.value = kas.balance
    if (bulletins.success && bulletins.data.length) latestBulletin.value = bulletins.data[0]
    if (status.success) {
      nextDueAmount.value = status.data.current_due_total
      trackerItems.value = buildTrackerItems(status.data.obligations)
    }
    if (history.success) {
      recentTransactions.value = history.data.slice(0, 5).map(t => ({
        ...t,
        date: new Date(t.date).toLocaleDateString()
      }))
    }
  } catch (err) {
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

function getTrackerStatus(item) {
  if (item.status) return 'paid'

  if (item.type === 'thr') return 'upcoming'

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  if (!item.month) return 'upcoming'
  if (item.year > currentYear || (item.year === currentYear && item.month >= currentMonth)) {
    return 'upcoming'
  }

  const monthsDiff = currentYear * 12 + currentMonth - (item.year * 12 + item.month)
  return monthsDiff < 2 ? 'late' : 'unpaid'
}

function buildTrackerItems(obligations) {
  const rawItems = obligations.map((obl) => ({
    key: `obligation-${obl.obligation_id}-${obl.month ?? 'thr'}`,
    label: obl.month ? `${monthNames[obl.month - 1]} ${obl.year}` : `THR ${obl.year}`,
    type: obl.month ? 'month' : 'thr',
    month: obl.month,
    year: obl.year,
    obligation_id: obl.obligation_id,
    status: obl.status,
    amount_due: obl.amount_due,
    eventName: obl.event_name,
  }))

  const months = rawItems
    .filter((item) => item.type === 'month')
    .sort((a, b) => (a.year - b.year) || (a.month - b.month))

  const thrItem = rawItems.find((item) => item.type === 'thr')
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  const annotated = months.map((item) => ({
    ...item,
    uiStatus: getTrackerStatus(item),
  }))

  const paidMonths = annotated.filter((item) => item.status)
  const unpaidPast = annotated.filter((item) => item.uiStatus === 'late' || item.uiStatus === 'unpaid')
  const upcomingMonths = annotated.filter((item) => item.uiStatus === 'upcoming')
  const currentMonthItem = annotated.find((item) => item.year === currentYear && item.month === currentMonth)

  const timeline = []
  const lastPaid = paidMonths.length ? paidMonths[paidMonths.length - 1] : null
  const firstUnpaid = unpaidPast.length ? unpaidPast[0] : null
  const secondUnpaid = unpaidPast.length > 1 ? unpaidPast[1] : null
  const nextUpcoming = upcomingMonths.find((item) => !currentMonthItem || item.key !== currentMonthItem.key)

  if (lastPaid) timeline.push(lastPaid)
  if (firstUnpaid) timeline.push(firstUnpaid)
  if (secondUnpaid) timeline.push(secondUnpaid)

  if (unpaidPast.length > 2 && currentMonthItem) {
    timeline.push({
      key: 'ellipsis',
      label: '...',
      type: 'ellipsis',
      uiStatus: 'ellipsis',
      status: false,
    })
  }

  if (currentMonthItem && !timeline.some((item) => item.key === currentMonthItem.key)) {
    timeline.push(currentMonthItem)
  }

  if (nextUpcoming && !timeline.some((item) => item.key === nextUpcoming.key)) {
    timeline.push(nextUpcoming)
  }

  if (thrItem) {
    timeline.push({
      ...thrItem,
      uiStatus: thrItem.status ? 'paid' : 'upcoming',
    })
  }

  return timeline
}

function formatNumber(val) {
  return new Intl.NumberFormat('id-ID').format(val)
}

function closeReceiptPreview() {
  isReceiptPreviewOpen.value = false
  selectedReceiptData.value = null
  receiptError.value = null
}

async function handleShowReceipt(item) {
  receiptError.value = null
  selectedReceiptData.value = null
  isReceiptPreviewOpen.value = true

  if (!item?.obligation_id) {
    receiptError.value = 'Receipt data is unavailable.'
    return
  }

  try {
    const description = item.type === 'thr'
      ? `THR ${item.year}`
      : `Iuran Bulanan ${item.label}`

    const res = await generateReceipt({
      obligation_id: Number(item.obligation_id),
      unit_id: unitId.value,
      unit_code: unitCode.value,
      owner_name: firstName.value || 'Resident',
      amount: item.amount_due || 0,
      description,
    })

    if (!res.success || !res.data) {
      throw new Error(res.error || 'Unable to load receipt')
    }

    selectedReceiptData.value = res.data
  } catch (err) {
    console.error('Receipt preview failed:', err)
    receiptError.value = err?.message || 'Failed to load receipt preview.'
  }
}

onMounted(() => {
  fetchData()
})
</script>
