<template>
  <div class="space-y-6 pb-12">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-2xl font-black tracking-tight">Audit Logs</h3>
        <p class="text-slate-500 text-sm">Review the history of system actions and administrator activities.</p>
      </div>
      <div class="flex gap-2">
        <button 
          @click="triggerTestError" 
          class="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg text-xs font-bold hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
        >
          <span class="material-symbols-outlined text-sm">bug_report</span>
          Test Sentry
        </button>
        <button 
          @click="fetchLogs" 
          class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-primary/10 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all"
          :disabled="isLoading"
        >
          <span class="material-symbols-outlined text-sm" :class="{ 'animate-spin': isLoading }">refresh</span>
          Refresh Logs
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-primary/10 shadow-sm flex flex-wrap gap-4">
      <div class="flex-1 min-w-[200px]">
        <label class="block text-[10px] font-black uppercase text-slate-400 mb-1">Filter by Action</label>
        <select v-model="filters.action" @change="fetchLogs" class="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-xs font-bold focus:ring-2 focus:ring-primary/20">
          <option value="">All Actions</option>
          <option value="LOGIN">Login</option>
          <option value="START_IMPERSONATION">Impersonation Started</option>
          <option value="UPDATE_TRANSACTION">Transaction Update</option>
          <option value="UPLOAD_AVATAR">Photo Upload</option>
          <option value="CHANGE_PIN">PIN Change</option>
        </select>
      </div>
    </div>

    <!-- Logs Table -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-primary/10 shadow-sm overflow-hidden">
      <div v-if="isLoading" class="p-20 flex justify-center">
        <span class="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
      </div>

      <div v-else-if="logs.length === 0" class="p-20 text-center">
        <span class="material-symbols-outlined text-5xl text-slate-200 mb-4">history_toggle_off</span>
        <p class="text-slate-400 font-medium">No activity logs found matching your criteria.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-800/50">
              <th class="p-4 text-[10px] font-black uppercase text-slate-400 w-48">Timestamp</th>
              <th class="p-4 text-[10px] font-black uppercase text-slate-400 w-48">Actor</th>
              <th class="p-4 text-[10px] font-black uppercase text-slate-400">Action</th>
              <th class="p-4 text-[10px] font-black uppercase text-slate-400">Entity</th>
              <th class="p-4 text-[10px] font-black uppercase text-slate-400">Details</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-for="log in logs" :key="log.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all">
              <td class="p-4 text-xs font-medium text-slate-500">
                {{ formatDateTime(log.created_at) }}
              </td>
              <td class="p-4">
                <div class="flex flex-col">
                  <span class="text-xs font-bold">{{ log.actor_name }}</span>
                  <span class="text-[10px] text-primary font-black uppercase tracking-tighter">{{ log.actor_type }}</span>
                </div>
              </td>
              <td class="p-4">
                <span :class="getActionClass(log.action)" class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">
                  {{ log.action.replace(/_/g, ' ') }}
                </span>
              </td>
              <td class="p-4">
                <div class="text-[10px] text-slate-500 font-bold uppercase" v-if="log.entity_type">
                  {{ log.entity_type }} #{{ log.entity_id?.substring(0, 8) }}
                </div>
              </td>
              <td class="p-4 text-xs text-slate-500">
                <pre class="bg-slate-100 dark:bg-slate-800 p-2 rounded text-[10px] max-w-xs overflow-x-auto no-scrollbar">{{ JSON.stringify(log.details, null, 2) }}</pre>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { auditService } from '@/services/auditService';

const isLoading = ref(true);
const logs = ref([]);
const filters = ref({
  action: '',
  entity_type: '',
  actor_id: ''
});

onMounted(() => {
  fetchLogs();
});

async function fetchLogs() {
  isLoading.value = true;
  const res = await auditService.getLogs(filters.value);
  if (res.success) {
    logs.value = res.data;
  }
  isLoading.value = false;
}

function triggerTestError() {
  console.log("🧨 Triggering intentional test error for Sentry...");
  // This function doesn't exist, which will trigger a reference error
  // which Sentry and our Error Boundary will catch.
  const intentionalError = new Error("Sentry Test: Connection Verified! ✅");
  throw intentionalError;
}

function formatDateTime(iso) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getActionClass(action) {
  if (action.includes('LOGIN')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  if (action.includes('IMPERSONATION')) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
  if (action.includes('UPDATE')) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
  return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
}
</script>
