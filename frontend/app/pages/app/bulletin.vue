<template>
  <div class="bulletin-view p-4 md:p-8 space-y-6">
    <div class="flex items-end justify-between">
      <div>
        <h3 class="text-2xl font-black tracking-tight">Townhouse Bulletin Board</h3>
        <p class="text-slate-500 text-sm">
          {{ isAdmin ? "Manage announcements and community updates." : "Latest news and updates from management." }}
        </p>
      </div>
      <button v-if="isAdmin && !showForm" @click="showForm = true" class="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 transition-all flex items-center gap-2">
        <span class="material-symbols-outlined text-sm">add</span> Create New Bulletin
      </button>
      <button v-if="isAdmin && showForm" @click="showForm = false" class="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-all flex items-center gap-2">
        <span class="material-symbols-outlined text-sm">close</span> Cancel
      </button>
    </div>

    <div :class="['grid gap-8', isAdmin ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1']">
      <!-- Rendering the Admin CMS form for creating and editing bulletins -->
      <div v-if="isAdmin" v-show="showForm" class="lg:col-span-1">
        <div class="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl border border-primary/10 shadow-sm sticky top-8">
          <h4 class="font-bold text-lg mb-6 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">{{ isEditing ? "edit_note" : "add_circle" }}</span>
            {{ isEditing ? "Edit Bulletin" : "New Bulletin Entry" }}
          </h4>
          <form class="space-y-4" @submit.prevent="handlePublish(true)">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Bulletin Title</label>
              <input v-model="bulletinForm.title" required class="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/50 font-medium" placeholder="e.g. Annual Community Meeting" type="text" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Category</label>
              <select v-model="bulletinForm.category" class="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/50 font-medium">
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Content</label>
              <ClientOnly>
                <RichTextEditor v-model="bulletinForm.content" :is-saving="isSubmitting" />
              </ClientOnly>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Media URL</label>
              <input v-model="bulletinForm.content_url" class="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/50 font-medium placeholder:text-slate-300" placeholder="Paste content URL (image/video/pdf)..." type="url" />
            </div>
            <div class="flex gap-3 pt-4">
              <button @click.prevent="handlePublish(false)" :disabled="isSubmitting" class="flex-1 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-lg text-xs disabled:opacity-50 flex items-center justify-center gap-2" type="button">
                <span class="material-symbols-outlined text-sm">save</span>
                Save Draft
              </button>
              <button :disabled="isSubmitting" class="flex-1 py-3 bg-primary text-white font-bold rounded-lg text-xs disabled:opacity-50 flex items-center justify-center gap-2" type="submit">
                <span v-if="isSubmitting" class="material-symbols-outlined animate-spin text-sm">refresh</span>
                {{ isSubmitting ? "Processing..." : isEditing ? "Update" : "Publish" }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Displaying the grid of bulletin cards for users -->
      <div :class="[isAdmin ? 'lg:col-span-2' : 'col-span-1', 'space-y-4']">
        <div v-if="isLoading" class="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-primary/10 border-dashed">
          <span class="material-symbols-outlined animate-spin text-4xl text-primary mb-4">refresh</span>
          <p class="text-sm text-slate-500 font-medium">Fetching updates...</p>
        </div>
        <div v-else-if="bulletins.length === 0" class="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-primary/10 border-dashed">
          <span class="material-symbols-outlined text-4xl text-slate-300 mb-4">newspaper</span>
          <p class="text-sm text-slate-500 font-medium">No bulletins found.</p>
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="bulletin in bulletins" :key="bulletin.id" class="bg-white dark:bg-slate-900 border border-primary/10 rounded-xl overflow-hidden shadow-sm group cursor-pointer" @click="openDetailModal(bulletin)">
            <div class="h-40 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
              <img v-if="getFileType(bulletin.content_url) === 'image'" :src="bulletin.content_url" class="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
              <video v-else-if="getFileType(bulletin.content_url) === 'video'" :src="bulletin.content_url" class="w-full h-full object-cover" controls preload="metadata" @click.stop></video>
              <div v-else-if="getFileType(bulletin.content_url) === 'pdf'" class="w-full h-full flex flex-col items-center justify-center bg-rose-50 dark:bg-rose-900/20">
                <span class="material-symbols-outlined text-4xl text-rose-500">picture_as_pdf</span>
                <p class="text-[10px] font-bold text-rose-500 mt-1">PDF</p>
              </div>
              <div v-else class="w-full h-full flex items-center justify-center"><span class="material-symbols-outlined text-4xl text-slate-300">image</span></div>
              
              <div class="absolute top-3 left-3" v-if="isAdmin">
                <span :class="['px-2 py-1 text-white text-[9px] font-black uppercase tracking-wider rounded', bulletin.is_published ? 'bg-emerald-500' : 'bg-amber-500']">{{ bulletin.is_published ? "Published" : "Draft" }}</span>
              </div>
            </div>
            <div class="p-5">
              <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">{{ formatDate(bulletin.created_at) }}</p>
              <h5 class="font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">{{ bulletin.title }}</h5>
              <div class="prose prose-sm prose-slate dark:prose-invert max-w-none line-clamp-3 mb-4 text-xs" v-html="sanitizeHtml(bulletin.content)"></div>
              <div v-if="isAdmin" class="flex items-center justify-between border-t border-slate-50 dark:border-slate-800 pt-4 mt-4">
                <div class="flex gap-2">
                  <button @click.stop="editBulletin(bulletin)" class="p-1.5 text-slate-400 hover:text-primary transition-colors bg-slate-50 dark:bg-slate-800 rounded"><span class="material-symbols-outlined text-lg">edit</span></button>
                  <button @click.stop="handleDelete(bulletin.id)" class="p-1.5 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 dark:bg-slate-800 rounded"><span class="material-symbols-outlined text-lg">delete</span></button>
                </div>
                <span class="text-[10px] font-bold text-slate-400 uppercase">{{ bulletin.category || "General" }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Including the detail modal component for reading full bulletins -->
    <BulletinDetailModal :bulletin="selectedBulletin" :is-open="!!selectedBulletin" @close="selectedBulletin = null" />
  </div>
</template>

<script setup>
import { sanitizeHtml } from '~/utils/sanitizeHtml'
import RichTextEditor from '~/components/forms/RichTextEditor.vue'
import BulletinDetailModal from '~/components/modals/BulletinDetailModal.vue'

definePageMeta({
  layout: 'app',
  middleware: ['auth']
})

const { isAdmin } = useAuth()
const { getBulletins, saveBulletin, deleteBulletin } = useBulletinService()

const bulletins = ref([])
const isLoading = ref(true)
const isSubmitting = ref(false)
const showForm = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const selectedBulletin = ref(null)

const bulletinForm = ref({
  title: "",
  content: "",
  category: "General",
  content_url: "",
  is_published: true
})

const categories = ['General', 'Meeting Update', 'Report', 'System Update']

const getFileType = (url) => {
  if (!url) return "none";
  const lower = url.toLowerCase();
  if (/\.(jpg|jpeg|png|gif|webp|svg|bmp|avif)(\?|$)/i.test(lower)) return "image";
  if (/\.(mp4|webm|mov|avi|mkv|ogg)(\?|$)/i.test(lower)) return "video";
  if (/\.pdf(\?|$)/i.test(lower)) return "pdf";
  if (lower.includes("youtube.com") || lower.includes("youtu.be") || lower.includes("vimeo.com")) return "video";
  if (lower.includes("/storage/") && !lower.includes(".pdf")) return "image";
  return "unknown";
};

async function fetchData() {
  isLoading.value = true
  try {
    const res = await getBulletins()
    if (res && res.success) {
      if (isAdmin.value) {
        bulletins.value = res.data || []
      } else {
        bulletins.value = (res.data || []).filter(b => b.is_published)
      }
    }
  } catch (err) {
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

async function handlePublish(publishNow = true) {
  isSubmitting.value = true
  bulletinForm.value.is_published = publishNow
  
  try {
    const payload = {
      ...bulletinForm.value
    }
    if (isEditing.value) {
      payload.id = editingId.value
    }
    
    const res = await saveBulletin(payload)
    
    if (res.success) {
      await fetchData()
      resetForm()
    }
  } catch (err) {
    console.error(err)
  } finally {
    isSubmitting.value = false
  }
}

function editBulletin(bulletin) {
  bulletinForm.value = { ...bulletin }
  isEditing.value = true
  editingId.value = bulletin.id
  showForm.value = true
  window.scrollTo({ top: 0, behavior: "smooth" })
}

async function handleDelete(id) {
  if (!confirm("Are you sure you want to delete this bulletin?")) return
  const res = await deleteBulletin(id)
  if (res.success) fetchData()
}

function resetForm() {
  bulletinForm.value = { title: "", content: "", category: "General", content_url: "", is_published: true }
  isEditing.value = false
  editingId.value = null
  showForm.value = false
}

function openDetailModal(bulletin) {
  selectedBulletin.value = bulletin
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('id-ID', { dateStyle: 'medium' })
}

onMounted(fetchData)
</script>

<style>
.prose.line-clamp-3 p { margin: 0 !important; display: inline !important; }
.prose.line-clamp-3 { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; line-clamp: 3; overflow: hidden; }
</style>
