<template>
  <div class="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark font-display">
    <!-- Desktop Sidebar -->
    <aside class="hidden md:flex w-64 bg-white dark:bg-slate-900 border-r border-primary/10 flex-col shrink-0">
      <div class="p-6 flex items-center gap-3">
        <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
          <span class="material-symbols-outlined">{{ session?.role === 'Super Admin' ? 'shield_person' : 'person' }}</span>
        </div>
        <div>
          <h1 class="font-bold text-lg leading-none truncate w-32">{{ session?.displayName || 'Admin' }}</h1>
          <p class="text-xs text-primary font-medium mt-1">{{ session?.role || 'Administrator' }}</p>
        </div>
      </div>

      <nav class="flex-1 px-4 py-4 space-y-1 overflow-y-auto no-scrollbar">
        <div v-for="section in menuSections" :key="section.title">
          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2" :class="{ 'mt-6': section.title !== 'Main Menu' }">
            {{ section.title }}
          </div>
          <router-link 
            v-for="item in section.items" 
            :key="item.name"
            :to="{ name: item.name }"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group"
            :class="[
              $route.name === item.name 
                ? 'bg-primary text-white shadow-md shadow-primary/20' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary'
            ]"
          >
            <span 
              class="material-symbols-outlined transition-colors"
              :style="{ fontVariationSettings: AR_activeIcon(item.name) }"
            >
              {{ item.icon }}
            </span>
            <span class="text-sm font-medium">{{ item.label }}</span>
          </router-link>
        </div>
      </nav>

      <!-- Sidebar Footer / Logout -->
      <div class="p-4 border-t border-primary/10">
        <div class="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
          <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
             <span class="material-symbols-outlined text-primary text-xl">account_circle</span>
          </div>
          <div class="flex-1 overflow-hidden">
            <p class="text-sm font-semibold truncate">{{ session?.displayName }}</p>
            <p class="text-[10px] text-slate-500 truncate">{{ session?.username || session?.unitCode || 'Active Session' }}</p>
          </div>
          <button @click="handleLogout" class="text-slate-400 hover:text-rose-500 transition-colors">
            <span class="material-symbols-outlined text-lg">logout</span>
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top Header -->
      <header class="h-16 bg-white dark:bg-slate-900 border-b border-primary/10 flex items-center justify-between px-4 md:px-8 shrink-0">
        <div class="flex items-center gap-4">
          <!-- Mobile Menu Toggle (Simplified for now) -->
          <button class="md:hidden text-slate-600">
            <span class="material-symbols-outlined">menu</span>
          </button>
          
          <h2 class="hidden sm:block text-xl font-bold tracking-tight">Command Center</h2>
          <div class="hidden lg:block h-4 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
          
          <div class="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-1.5 gap-2 border border-transparent focus-within:border-primary/30 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all">
            <span class="material-symbols-outlined text-slate-400 text-lg">search</span>
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Search records..." 
              class="bg-transparent border-none text-sm focus:ring-0 p-0 w-48 lg:w-64 placeholder:text-slate-400 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div class="flex items-center gap-2 md:gap-3">
          <div class="relative">
            <button @click="showNotifications = !showNotifications" class="relative w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary transition-all">
              <span class="material-symbols-outlined">notifications</span>
              <span class="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>
            <div v-if="showNotifications" class="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl py-2 z-50">
              <div class="px-4 py-2 border-b border-slate-100 dark:border-slate-700 font-bold text-xs uppercase tracking-wider text-slate-400">Recent Notifications</div>
              <div class="p-8 text-center text-slate-400">
                <span class="material-symbols-outlined text-4xl mb-2 opacity-20">notifications_off</span>
                <p class="text-xs font-medium">No new notifications</p>
              </div>
            </div>
          </div>
          
          <div class="hidden sm:block h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
          
          <div class="hidden lg:text-right lg:block">
            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Server Status</p>
            <p class="text-[11px] font-semibold text-emerald-500 flex items-center justify-end gap-1">
              <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Connected
            </p>
          </div>
        </div>
      </header>

      <!-- View Content -->
      <main class="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar bg-background-light dark:bg-background-dark">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" :key="$route.fullPath" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { clearSession } from '@/services/supabaseClient.js'

const router = useRouter()
const route = useRoute()
const showNotifications = ref(false)
const searchQuery = ref('')

const session = computed(() => JSON.parse(sessionStorage.getItem('dw_session') || '{}'))

const AR_activeIcon = (name) => route.name === name ? "'FILL' 1" : "'FILL' 0"

const menuSections = computed(() => {
  const isSuperAdmin = session.value?.role === 'Super Admin'
  
  return [
    {
      title: 'Main Menu',
      items: [
        { name: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
        { name: 'tracker', icon: 'payments', label: 'Payment Tracker' },
        { name: 'history', icon: 'receipt_long', label: 'Transactions' },
        { name: 'cms', icon: 'campaign', label: 'Bulletin Board' }
      ]
    },
    {
      title: 'Operations',
      items: (session.value?.role === 'Super Admin') ? [
        { name: 'transactions', icon: 'swap_horiz', label: 'Input Transaction' },
        { name: 'correction', icon: 'build', label: 'Correction' }
      ] : []
    },
    {
      title: 'System',
      items: [
        { name: 'settings', icon: 'settings', label: 'System Settings' },
        ...(isSuperAdmin ? [{ name: 'special-events', icon: 'auto_mode', label: 'Special Events' }] : [])
      ]
    }
  ].filter(section => section.items.length > 0) // Hide empty Operations section for Admins
})

function handleLogout() {
  clearSession()
  router.push({ name: 'login' })
}
</script>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition: all 0.25s ease-out;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
