<template>
  <div class="manage-units-view space-y-6 pb-12 p-4 md:p-8">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-2xl font-black tracking-tight">Unit Management</h3>
        <p class="text-slate-500 text-sm">Manage residents, unit details, and impersonate accounts.</p>
      </div>
    </div>

    <!-- Search -->
    <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-primary/10 shadow-sm">
      <div class="relative">
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
        <input v-model="searchQuery" type="text" placeholder="Search by unit code or resident name..." class="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm" />
      </div>
    </div>

    <!-- Units Grid -->
    <div v-if="isLoading" class="flex justify-center p-12">
      <span class="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="unit in filteredUnits" :key="unit.id" class="bg-white dark:bg-slate-900 rounded-xl border border-primary/10 shadow-sm overflow-hidden group hover:border-primary/30 transition-all">
        <div class="p-5 flex items-start gap-4">
          <div class="relative w-12 h-12 shrink-0">
            <img :src="unit.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${unit.name}`" class="w-full h-full rounded-full object-cover bg-slate-100" />
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="font-bold text-lg leading-tight truncate">{{ unit.name }}</h4>
            <p class="text-xs font-black text-primary uppercase tracking-wider mb-1">Unit {{ unit.code }}</p>
            <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">{{ unit.category || 'Resident' }}</span>
          </div>
        </div>

        <div class="px-5 py-4 bg-slate-50 border-t flex items-center justify-between">
          <div class="text-[10px] text-slate-400 font-medium">Joined {{ formatDate(unit.created_at) }}</div>
          <div class="flex gap-2">
            <button v-if="isSuperAdmin" @click="handleImpersonate(unit)" :disabled="isProcessing === unit.id" class="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all">
              {{ isProcessing === unit.id ? 'Loading...' : 'Login as' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'app',
  middleware: ['super-admin'] // Only super-admins usually manage units
})

const { isSuperAdmin, impersonateUnit } = useAuth()
const { logAction } = useAuditService()
const supabase = useSupabaseClient()

const units = ref([])
const isLoading = ref(true)
const isProcessing = ref(null)
const searchQuery = ref("")

const filteredUnits = computed(() => {
  if (!searchQuery.value) return units.value
  const q = searchQuery.value.toLowerCase()
  return units.value.filter(u => u.code.toLowerCase().includes(q) || u.name.toLowerCase().includes(q))
})

async function fetchData() {
  isLoading.value = true
  try {
    const { data, error } = await supabase.from('units').select('*').order('code')
    if (error) throw error
    units.value = data || []
  } catch (err) {
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

async function handleImpersonate(unit) {
  isProcessing.value = unit.id
  try {
    await logAction('START_IMPERSONATION', { type: 'units', id: unit.id }, { target_unit: unit.code })
    const res = await impersonateUnit(unit.id)
    if (res.success) await navigateTo('/app/dashboard')
  } catch (err) {
    console.error(err)
  } finally {
    isProcessing.value = null
  }
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('id-ID', { dateStyle: 'medium' })
}

onMounted(fetchData)
</script>
