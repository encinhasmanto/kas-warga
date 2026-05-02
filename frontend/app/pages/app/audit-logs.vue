<template>
  <div class="space-y-6 pb-12 p-4 md:p-8">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-2xl font-black tracking-tight">Audit Logs</h3>
        <p class="text-slate-500 text-sm">Review the history of system actions and administrator activities.</p>
      </div>
      <div class="flex gap-2">
        <button @click="fetchLogs" class="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold">
          <span class="material-symbols-outlined text-sm" :class="{ 'animate-spin': isLoading }">refresh</span> Refresh
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-primary/10 shadow-sm">
      <select v-model="filters.action" @change="fetchLogs" class="w-full bg-slate-50 border-none rounded-lg text-xs font-bold">
        <option value="">All Actions</option>
        <option value="LOGIN">Login</option>
        <option value="START_IMPERSONATION">Impersonation Started</option>
        <option value="UPDATE_TRANSACTION">Transaction Update</option>
        <option value="UPLOAD_AVATAR">Photo Upload</option>
        <option value="CHANGE_PIN">PIN Change</option>
      </select>
    </div>

    <!-- Logs Table -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-primary/10 shadow-sm overflow-hidden">
      <div v-if="isLoading" class="p-20 flex justify-center">
        <span class="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase text-slate-400">
              <th class="p-4">Timestamp</th>
              <th class="p-4">Actor</th>
              <th class="p-4">Action</th>
              <th class="p-4">Details</th>
            </tr>
          </thead>
          <tbody class="divide-y text-xs">
            <tr v-for="log in logs" :key="log.id">
              <td class="p-4 text-slate-500">{{ formatDate(log.created_at) }}</td>
              <td class="p-4 font-bold">{{ log.actor_name }}</td>
              <td class="p-4">
                <span class="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-blue-100 text-blue-700">
                  {{ log.action.replace(/_/g, ' ') }}
                </span>
              </td>
              <td class="p-4">
                <pre class="bg-slate-50 p-2 rounded text-[9px] max-w-xs overflow-x-auto">{{ JSON.stringify(log.details, null, 2) }}</pre>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'app',
  middleware: ['super-admin']
})

const { getAuditLogs } = useAuditService()

const logs = ref([])
const isLoading = ref(true)
const filters = ref({ action: '' })

async function fetchLogs() {
  isLoading.value = true
  try {
    const res = await getAuditLogs(filters.value)
    if (res.success) logs.value = res.data
  } finally {
    isLoading.value = false
  }
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })
}

onMounted(fetchLogs)
</script>
