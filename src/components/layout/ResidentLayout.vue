<template>
  <div class="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark font-display relative">
    
    <!-- Desktop Sidebar (Hidden on Mobile) -->
    <aside class="hidden md:flex w-64 bg-white dark:bg-slate-900 border-r border-primary/10 flex-col shrink-0">
      <div class="p-6 flex items-center gap-3">
        <div class="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary shadow-sm overflow-hidden">
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Resident" 
            alt="Profile" 
            class="object-cover size-full"
          />
        </div>
        <div>
          <h1 class="font-bold text-lg leading-none truncate w-32">{{ session?.displayName || 'Resident' }}</h1>
          <p class="text-xs text-slate-500 font-medium mt-1">Unit {{ session?.unitCode || 'A1' }}</p>
        </div>
      </div>

      <nav class="flex-1 px-4 py-4 space-y-1 overflow-y-auto no-scrollbar">
        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
          Main Menu
        </div>
        <router-link 
          v-for="item in navItems" 
          :key="item.name"
          :to="item.path"
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
      </nav>

      <!-- Sidebar Footer / Logout -->
      <div class="p-4 border-t border-primary/10">
        <div class="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
          <div class="flex-1 overflow-hidden px-2">
            <p class="text-xs font-semibold text-slate-500">Resident Portal</p>
          </div>
          <button @click="handleLogout" class="text-slate-400 hover:text-rose-500 transition-colors p-1">
            <span class="material-symbols-outlined text-lg">logout</span>
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col overflow-hidden relative">
      
      <!-- Top Header (Mobile Sticky, Desktop Normal) -->
      <header class="flex items-center bg-white/90 md:bg-white dark:bg-slate-900/90 md:dark:bg-slate-900 backdrop-blur-md md:backdrop-blur-none p-4 md:px-8 border-b border-slate-200 dark:border-slate-800 justify-between shrink-0 z-20">
        
        <!-- Mobile Profile Area -->
        <div class="flex md:hidden size-10 shrink-0 items-center overflow-hidden rounded-full bg-slate-100">
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Resident" 
            alt="Profile" 
            class="object-cover size-full"
          />
        </div>
        <h2 class="md:hidden text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center">
          Resident Portal
        </h2>

        <!-- Desktop Search & Title Area -->
        <div class="hidden md:flex items-center gap-4">
          <h2 class="text-xl font-bold tracking-tight">Resident Dashboard</h2>
          <div class="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
          <div class="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-1.5 gap-2 border border-transparent focus-within:border-primary/30 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all">
            <span class="material-symbols-outlined text-slate-400 text-lg">search</span>
            <input 
              type="text" 
              placeholder="Search records..." 
              class="bg-transparent border-none text-sm focus:ring-0 p-0 w-48 lg:w-64 placeholder:text-slate-400 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>
        
        <!-- Common Notification Area -->
        <div class="flex items-center justify-end relative">
          <button class="relative w-10 h-10 flex items-center justify-center rounded-full md:rounded-lg md:bg-slate-100 md:dark:bg-slate-800 text-slate-500 md:text-slate-600 md:dark:text-slate-400 hover:bg-primary/10 hover:text-primary transition-all">
            <span class="material-symbols-outlined">notifications</span>
            <span class="absolute top-2 right-2 md:top-2.5 md:right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-background-dark md:dark:border-slate-900"></span>
          </button>
          
          <div class="hidden lg:block h-4 w-px bg-slate-200 dark:bg-slate-700 mx-3"></div>
          <div class="hidden lg:block text-right">
            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Unit Status</p>
            <p class="text-[11px] font-semibold text-emerald-500 flex items-center justify-end gap-1">
              <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Active
            </p>
          </div>
        </div>
      </header>

      <!-- View Content -->
      <main class="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 no-scrollbar bg-background-light dark:bg-background-dark relative z-10 w-full max-w-xl md:max-w-none mx-auto">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>

    </div>

    <!-- Mobile Bottom Navigation Bar (Hidden on Desktop) -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 z-50 flex h-auto w-full flex-col bg-white/95 dark:bg-background-dark/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 safe-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div class="flex gap-2 px-4 pb-6 pt-3 max-w-xl mx-auto w-full">
        <router-link 
          v-for="item in navItems" 
          :key="item.name"
          :to="item.path"
          class="flex flex-1 flex-col items-center justify-center gap-1 transition-colors relative"
          :class="[$route.name === item.name ? 'text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300']"
        >
          <div class="flex h-8 items-center justify-center relative">
            <span 
              class="material-symbols-outlined transition-all text-[26px]"
              :style="{ fontVariationSettings: AR_activeIcon(item.name) }"
            >
              {{ item.icon }}
            </span>
          </div>
          <p class="text-[10px] font-bold leading-normal uppercase tracking-wider">{{ item.label }}</p>
        </router-link>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth.js'

const router = useRouter()
const route = useRoute()
const { session, logout } = useAuth()

const AR_activeIcon = (name) => route.name === name ? "'FILL' 1" : "'FILL' 0"

const navItems = [
  { name: 'dashboard', path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { name: 'history', path: '/history', icon: 'history', label: 'History' },
  { name: 'tracker', path: '/tracker', icon: 'credit_card', label: 'Payments' },
  { name: 'bulletin', path: '/bulletin', icon: 'newspaper', label: 'Bulletin' }
]

function handleLogout() {
  logout()
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

.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
