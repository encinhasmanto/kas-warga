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
          <div class="relative">
            <button @click="toggleNotifications" class="relative w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary transition-all shadow-sm">
              <span class="material-symbols-outlined">notifications</span>
              <!-- Unread Badge -->
              <span v-if="hasUnread" class="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
            </button>
            <div v-if="showNotifications" class="absolute right-0 top-full mt-2 w-72 md:w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl py-2 z-50 max-h-96 flex flex-col">
              <div class="px-4 py-3 border-b border-slate-100 dark:border-slate-700 font-bold text-xs uppercase tracking-wider text-slate-400 sticky top-0 bg-white dark:bg-slate-800 shrink-0">Recent Notifications</div>
              <div class="overflow-y-auto no-scrollbar flex-1">
                <div v-if="notifications.length === 0" class="p-8 text-center text-slate-400">
                  <span class="material-symbols-outlined text-4xl mb-2 opacity-20">notifications_off</span>
                  <p class="text-xs font-medium">No new notifications yet.</p>
                </div>
                <div v-else class="flex flex-col">
                  <div v-for="n in notifications" :key="n.id" class="px-4 py-3 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex gap-3 cursor-pointer group">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0" :class="n.color">
                      <span class="material-symbols-outlined text-[16px]">{{ n.icon }}</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-primary">{{ n.title }}</p>
                      <p class="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{{ n.description }}</p>
                      <p class="text-[9px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">{{ formatNotifDate(n.date) }}</p>
                    </div>
                    <div v-if="n.isNew" class="w-1.5 h-1.5 bg-primary rounded-full shrink-0 mt-1.5"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <button @click="handleLogout" class="md:hidden relative w-10 h-10 flex items-center justify-center rounded-full md:rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-500 transition-all ml-1">
            <span class="material-symbols-outlined text-xl">logout</span>
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
            <component :is="Component" :key="$route.fullPath" />
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
          :to="{ name: item.name }"
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

    <!-- Real-time Toast Pop-ups -->
    <div class="fixed bottom-24 right-4 z-[200] flex flex-col gap-2 pointer-events-none md:bottom-4 pl-4 pt-4">
      <transition-group name="toast">
        <div v-for="t in activeToasts" :key="t.id" class="w-72 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-4 flex gap-3 pointer-events-auto transform transition-all">
          <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0" :class="t.color">
            <span class="material-symbols-outlined">{{ t.icon }}</span>
          </div>
          <div class="flex-1">
            <p class="text-xs font-black uppercase text-primary mb-1">New Update</p>
            <p class="text-sm font-bold text-slate-800 dark:text-slate-100">{{ t.title }}</p>
            <p class="text-xs text-slate-500 line-clamp-2 mt-0.5">{{ t.description }}</p>
          </div>
        </div>
      </transition-group>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth.js'
import { fetchInitialNotifications, subscribeToRealtimeNotifications } from '@/services/notificationService.js'

const router = useRouter()
const route = useRoute()
const { session, logout } = useAuth()

const AR_activeIcon = (name) => route.name === name ? "'FILL' 1" : "'FILL' 0"

const navItems = [
  { name: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
  { name: 'tracker', icon: 'credit_card', label: 'Tracker' },
  { name: 'history', icon: 'history', label: 'History' },
  { name: 'bulletin', icon: 'newspaper', label: 'Bulletin' }
]

const showNotifications = ref(false)
const notifications = ref([])
const hasUnread = ref(false)
const activeToasts = ref([])
let unsubNotifications = null

onMounted(async () => {
  const res = await fetchInitialNotifications()
  if (res.success) {
    notifications.value = res.data.map(n => ({...n, isNew: false}))
  }

  unsubNotifications = subscribeToRealtimeNotifications((newNotif) => {
    notifications.value.unshift(newNotif)
    hasUnread.value = true
    
    activeToasts.value.push(newNotif)
    setTimeout(() => {
      activeToasts.value = activeToasts.value.filter(t => t.id !== newNotif.id)
    }, 5000)
  })
})

onUnmounted(() => {
  if (unsubNotifications) unsubNotifications()
})

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  if (showNotifications.value) {
    hasUnread.value = false
    notifications.value.forEach(n => n.isNew = false)
  }
}

const formatNotifDate = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour:'2-digit', minute:'2-digit' })
}

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

.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}

.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
