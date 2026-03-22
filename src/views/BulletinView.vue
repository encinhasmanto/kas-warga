<template>
  <div class="bulletin-view p-4 md:p-8 space-y-6">
    <div class="flex items-end justify-between">
      <div>
        <h3 class="text-2xl font-black tracking-tight">Permata Tajur Townhouse Bulletin Board</h3>
        <p class="text-slate-500 text-sm">
          {{ canManage ? 'Manage announcements and community updates.' : 'Latest news and updates from management.' }}
        </p>
      </div>
      <button v-if="canManage && !showForm" @click="showForm = true" class="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 transition-all flex items-center gap-2">
        <span class="material-symbols-outlined text-sm">add</span> Create New Bulletin
      </button>
      <button v-if="canManage && showForm" @click="showForm = false" class="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-all flex items-center gap-2">
        <span class="material-symbols-outlined text-sm">close</span> Cancel
      </button>
    </div>

    <div :class="['grid gap-8', canManage ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1']">
      
      <!-- Admin CMS Form -->
      <div v-if="canManage" v-show="showForm || isLgScreen" class="lg:col-span-1">
        <div class="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl border border-primary/10 shadow-sm sticky top-8">
          <h4 class="font-bold text-lg mb-6 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">{{ isEditing ? 'edit_note' : 'add_circle' }}</span> 
            {{ isEditing ? 'Edit Bulletin' : 'New Bulletin Entry' }}
          </h4>
          <form class="space-y-4" @submit.prevent="handlePublish">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Bulletin Title</label>
              <input 
                v-model="bulletinForm.title"
                required
                class="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/50 font-medium placeholder:text-slate-300" 
                placeholder="e.g. Annual Community Meeting" 
                type="text"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Content (HTML/Text)</label>
              <textarea 
                v-model="bulletinForm.content"
                required
                class="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/50 min-h-[120px] placeholder:text-slate-300" 
                placeholder="Type bulletin content here..."
              ></textarea>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Thumbnail Image URL</label>
              <input 
                v-model="bulletinForm.image_url"
                class="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/50 font-medium placeholder:text-slate-300" 
                placeholder="https://example.com/image.jpg" 
                type="url"
              />
              <p class="text-[10px] text-slate-400 mt-1">Paste a direct image link for the thumbnail.</p>
            </div>
            <div class="flex gap-3 pt-4">
              <button 
                v-if="isEditing"
                @click="resetForm"
                class="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-200 transition-all text-xs" 
                type="button"
              >Cancel Edit</button>
              <button 
                :disabled="isSubmitting"
                class="flex-1 py-3 bg-primary text-white font-bold rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
                type="submit"
              >
                <span v-if="isSubmitting" class="material-symbols-outlined animate-spin text-sm">refresh</span>
                {{ isEditing ? 'Update Bulletin' : 'Publish Now' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Bulletin Cards Grid -->
      <div :class="[canManage ? 'lg:col-span-2' : 'col-span-1', 'space-y-4']">
        <div v-if="isLoading" class="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-primary/10 border-dashed">
          <span class="material-symbols-outlined animate-spin text-4xl text-primary mb-4">refresh</span>
          <p class="text-sm text-slate-500 font-medium">Fetching the latest updates...</p>
        </div>

        <div v-else-if="bulletins.length === 0" class="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-primary/10 border-dashed">
          <span class="material-symbols-outlined text-4xl text-slate-300 mb-4">newspaper</span>
          <p class="text-sm text-slate-500 font-medium">No bulletins found at the moment.</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Live Cards -->
          <div v-for="bulletin in bulletins" :key="bulletin.id" class="bg-white dark:bg-slate-900 border border-primary/10 rounded-xl overflow-hidden shadow-sm group">
            <div class="h-40 md:h-32 bg-slate-100 dark:bg-slate-800 relative">
              <img 
                v-if="bulletin.image_url"
                :src="bulletin.image_url" 
                alt="Bulletin" 
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div v-else class="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                <span class="material-symbols-outlined text-4xl text-slate-300">image</span>
              </div>
              <div class="absolute top-3 left-3" v-if="canManage">
                <span :class="['px-2 py-1 text-white text-[9px] font-black uppercase tracking-wider rounded', bulletin.is_published ? 'bg-emerald-500' : 'bg-amber-500']">
                  {{ bulletin.is_published ? 'Published' : 'Draft' }}
                </span>
              </div>
            </div>
            <div class="p-5">
              <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">{{ formatDate(bulletin.created_at) }}</p>
              <h5 class="font-bold text-sm mb-2 line-clamp-1 group-hover:text-primary transition-colors">{{ bulletin.title }}</h5>
              <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">{{ bulletin.content }}</p>
              
              <div v-if="canManage" class="flex items-center justify-between border-t border-slate-50 dark:border-slate-800 pt-4">
                <div class="flex gap-2">
                  <button 
                    @click="editBulletin(bulletin)"
                    class="p-1.5 text-slate-400 hover:text-primary transition-colors bg-slate-50 dark:bg-slate-800 rounded"
                    title="Edit Bulletin"
                  >
                    <span class="material-symbols-outlined text-lg">edit</span>
                  </button>
                  <button 
                    @click="handleDelete(bulletin.id)"
                    class="p-1.5 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 dark:bg-slate-800 rounded"
                    title="Delete Bulletin"
                  >
                    <span class="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
                <router-link :to="{ name: 'bulletin-detail', params: { id: bulletin.id }}" class="text-[10px] font-bold text-primary hover:underline">Full Details</router-link>
              </div>
              <div v-else class="pt-2 border-t border-slate-50 dark:border-slate-800">
                <router-link :to="{ name: 'bulletin-detail', params: { id: bulletin.id }}" class="text-xs font-bold text-primary hover:underline flex items-center gap-1">Read Full Story <span class="material-symbols-outlined text-[14px]">arrow_forward</span></router-link>
              </div>
            </div>
          </div>
        </div>
        
        <button v-if="bulletins.length > 0" class="w-full py-3 bg-white dark:bg-slate-900 border border-primary/10 text-slate-500 text-xs font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
          Load More Bulletins
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth.js'
import { getBulletins, createBulletin, updateBulletin, deleteBulletin } from '@/services/bulletinService.js'

const { isAdmin, isSuperAdmin } = useAuth()

// Only admins can see the CMS management tools
const canManage = computed(() => isAdmin.value || isSuperAdmin.value)

// State
const bulletins = ref([])
const isLoading = ref(true)
const isSubmitting = ref(false)
const showForm = ref(false)
const isEditing = ref(false)
const editingId = ref(null)

const bulletinForm = ref({
  title: '',
  content: '',
  category: 'General',
  image_url: '',
  is_published: true
})

// UI State
const isLgScreen = ref(window.innerWidth >= 1024)

// Initialization
onMounted(() => {
  fetchBulletins()
  window.addEventListener('resize', () => {
    isLgScreen.value = window.innerWidth >= 1024
  })
})

async function fetchBulletins() {
  isLoading.value = true
  const res = await getBulletins()
  if (res.success) {
    bulletins.value = res.data
  }
  isLoading.value = false
}

function resetForm() {
  bulletinForm.value = {
    title: '',
    content: '',
    category: 'General',
    image_url: '',
    is_published: true
  }
  isEditing.value = false
  editingId.value = null
  if (window.innerWidth < 1024) showForm.value = false
}

async function handlePublish() {
  if (isSubmitting.value) return
  isSubmitting.value = true
  
  try {
    let res
    if (isEditing.value) {
      res = await updateBulletin(editingId.value, bulletinForm.value)
    } else {
      res = await createBulletin(bulletinForm.value)
    }

    if (res.success) {
      await fetchBulletins()
      resetForm()
    } else {
      alert("Failed to save bulletin: " + res.error)
    }
  } catch (err) {
    console.error(err)
  } finally {
    isSubmitting.value = false
  }
}

function editBulletin(bulletin) {
  bulletinForm.value = {
    title: bulletin.title,
    content: bulletin.content,
    category: bulletin.category,
    image_url: bulletin.image_url || '',
    is_published: bulletin.is_published
  }
  isEditing.value = true
  editingId.value = bulletin.id
  showForm.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function handleDelete(id) {
  if (!confirm("Are you sure you want to delete this bulletin?")) return
  
  const res = await deleteBulletin(id)
  if (res.success) {
    await fetchBulletins()
  } else {
    alert("Failed to delete bulletin: " + res.error)
  }
}

function formatDate(isoString) {
  if (!isoString) return ''
  return new Date(isoString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}
</script>
