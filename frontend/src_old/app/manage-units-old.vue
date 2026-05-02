<template>
  <div class="space-y-6 pb-12">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-2xl font-black tracking-tight">Unit Management</h3>
        <p class="text-slate-500 text-sm">Manage residents, unit details, and impersonate accounts.</p>
      </div>
    </div>

    <!-- Search & Filter -->
    <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-primary/10 shadow-sm flex flex-col md:flex-row gap-4">
      <div class="relative flex-1">
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search by unit code or resident name..." 
          class="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20"
        >
      </div>
    </div>

    <!-- Units Grid -->
    <div v-if="isLoading" class="flex justify-center p-12">
      <span class="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="unit in filteredUnits" 
        :key="unit.id"
        class="bg-white dark:bg-slate-900 rounded-xl border border-primary/10 shadow-sm overflow-hidden group hover:border-primary/30 transition-all"
      >
        <div class="p-5 flex items-start gap-4">
          <div class="relative w-12 h-12 shrink-0">
            <img 
              :src="unit.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${unit.name}`" 
              class="w-full h-full rounded-full object-cover bg-slate-100 dark:bg-slate-800"
            >
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="font-bold text-lg leading-tight truncate">{{ unit.name }}</h4>
            <p class="text-xs font-black text-primary uppercase tracking-wider mb-1">Unit {{ unit.code }}</p>
            <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
              {{ unit.category || 'Resident' }}
            </span>
          </div>
        </div>

        <div class="px-5 py-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-primary/5 flex items-center justify-between">
          <div class="text-[10px] text-slate-400 font-medium">
            Joined {{ formatDate(unit.created_at) }}
          </div>
          
          <div class="flex gap-2">
            <!-- Impersonation Button (Super Admin Only) -->
            <button 
              v-if="isSuperAdmin"
              @click="handleImpersonate(unit)"
              class="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-50"
              :disabled="isProcessing === unit.id"
              title="Login as this Resident"
            >
              <span class="material-symbols-outlined text-sm">{{ isProcessing === unit.id ? 'sync' : 'visibility' }}</span>
              {{ isProcessing === unit.id ? 'Loading...' : 'Login as' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!isLoading && filteredUnits.length === 0" class="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-primary/10 border-dashed">
      <span class="material-symbols-outlined text-5xl text-slate-300 mb-4">person_off</span>
      <h3 class="text-lg font-bold text-slate-500">No units found</h3>
      <p class="text-sm text-slate-400">Try adjusting your search filters.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/services/supabaseClient';
import { useAuth } from '@/composables/useAuth';
import { auditService } from '@/services/auditService';

const router = useRouter();
const { isSuperAdmin, impersonateUnit } = useAuth();

const isLoading = ref(true);
const isProcessing = ref(null);
const units = ref([]);
const searchQuery = ref('');

onMounted(async () => {
  await fetchUnits();
});

async function fetchUnits() {
  isLoading.value = true;
  try {
    const { data, error } = await supabase
      .from('units')
      .select('*')
      .order('code', { ascending: true });
    
    if (error) throw error;
    units.value = data || [];
  } catch (err) {
    console.error('❌ Error fetching units:', err.message);
  } finally {
    isLoading.value = false;
  }
}

const filteredUnits = computed(() => {
  if (!searchQuery.value) return units.value;
  const q = searchQuery.value.toLowerCase();
  return units.value.filter(u => 
    u.code.toLowerCase().includes(q) || 
    u.name.toLowerCase().includes(q)
  );
});

async function handleImpersonate(unit) {
  // if (!confirm(`Are you sure you want to log in as ${unit.name} (Unit ${unit.code})? You will see exactly what they see.`)) return;
  
  isProcessing.value = unit.id;
  
  try {
    // Log the impersonation action
    await auditService.logAction('START_IMPERSONATION', { type: 'units', id: unit.id }, { 
      target_unit: unit.code,
      target_name: unit.name
    });

    const res = await impersonateUnit(unit.id);
    
    if (res.success) {
      await router.push({ name: 'dashboard' });
    } else {
      alert('Impersonation failed: ' + res.error);
    }
  } catch (err) {
    console.error(err);
    alert('Unhandled Exception in handleImpersonate: ' + err.message);
  } finally {
    isProcessing.value = null;
  }
}

function formatDate(iso) {
  if (!iso) return 'N/A';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
</script>
