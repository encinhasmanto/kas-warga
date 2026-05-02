<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useAuth } from "@/composables/useAuth.js";
import {
  getBulletins,
  createBulletin,
  updateBulletin,
  deleteBulletin as apiDeleteBulletin,
  uploadBulletinImage,
  bulletinService
} from "@/services/bulletinService.js";
import RichTextEditor from "@/components/forms/RichTextEditor.vue";
import BulletinDetailModal from "@/components/modals/BulletinDetailModal.vue";
import { supabase } from "@/services/supabaseClient";
import { sanitizeHtml } from "@/utils/sanitizeHtml";

const { isAdmin, isSuperAdmin } = useAuth();
const canManage = computed(() => isAdmin.value || isSuperAdmin.value);

// --- State ---
const bulletins = ref([]);
const isLoading = ref(true);
const isSubmitting = ref(false);
const showForm = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const isUploading = ref(false);
const uploadProgress = ref(0);
const selectedBulletin = ref(null);
const isModalOpen = ref(false);

// Pagination
const pageSize = 10;
const currentPage = ref(0);
const hasMore = ref(false);
const isLoadingMore = ref(false);

const bulletinForm = ref({
  title: "",
  content: "",
  category: "General",
  content_url: "",
  is_published: true,
});

const categories = ['General', 'Meeting Update', 'Report', 'System Update'];

const selectedFile = ref(null);
const isLgScreen = ref(window.innerWidth >= 1024);

// --- Realtime Subscription ---
let bulletinSubscription = null;

const subscribeToBulletins = () => {
  bulletinSubscription = supabase
    .channel("bulletin-updates")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "bulletins" }, (payload) => {
      bulletins.value.unshift(payload.new);
    })
    .on("postgres_changes", { event: "UPDATE", schema: "public", table: "bulletins" }, (payload) => {
      const index = bulletins.value.findIndex((b) => b.id === payload.new.id);
      if (index !== -1) bulletins.value[index] = payload.new;
    })
    .on("postgres_changes", { event: "DELETE", schema: "public", table: "bulletins" }, (payload) => {
      bulletins.value = bulletins.value.filter((b) => b.id !== payload.old.id);
    })
    .subscribe();
};

// --- Logic ---
const fetchBulletins = async () => {
  isLoading.value = true;
  currentPage.value = 0;
  try {
    // Admins see ALL bulletins (published + drafts), residents only see published
    if (canManage.value) {
      const allBulletins = await bulletinService.getBulletins();
      bulletins.value = allBulletins;
      hasMore.value = false; // bulletinService.getBulletins returns all
    } else {
      const res = await getBulletins({ limit: pageSize, offset: 0 });
      if (res.success) {
        bulletins.value = res.data;
        hasMore.value = res.data.length >= pageSize;
      }
    }
  } catch (err) {
    console.error("Error loading bulletins:", err);
  } finally {
    isLoading.value = false;
  }
};

const loadMore = async () => {
  isLoadingMore.value = true;
  currentPage.value++;
  const offset = currentPage.value * pageSize;
  try {
    const res = await getBulletins({ limit: pageSize, offset });
    if (res.success) {
      bulletins.value.push(...res.data);
      hasMore.value = res.data.length >= pageSize;
    }
  } finally {
    isLoadingMore.value = false;
  }
};

const resetForm = () => {
  bulletinForm.value = {
    title: "",
    content: "",
    category: "General",
    content_url: "",
    is_published: true,
  };
  isEditing.value = false;
  editingId.value = null;
  selectedFile.value = null;
  const fileInput = document.getElementById("bulletin-file-input");
  if (fileInput) fileInput.value = "";
  if (window.innerWidth < 1024) showForm.value = false;
};

const handlePublish = async (publishNow = true) => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;
  let progressInterval = null;

  try {
    if (selectedFile.value) {
      isUploading.value = true;
      uploadProgress.value = 0;
      progressInterval = setInterval(() => {
        if (uploadProgress.value < 90) {
          uploadProgress.value += Math.floor(Math.random() * 15) + 5;
        }
      }, 500);

      const publicUrl = await uploadBulletinImage(selectedFile.value);
      clearInterval(progressInterval);
      uploadProgress.value = 100;
      bulletinForm.value.content_url = publicUrl;
      await new Promise((r) => setTimeout(r, 500));
      isUploading.value = false;
    }

    // Set is_published based on the action
    bulletinForm.value.is_published = publishNow;

    let res;
    if (isEditing.value) {
      res = await updateBulletin(editingId.value, bulletinForm.value);
    } else {
      res = await createBulletin(bulletinForm.value);
    }

    if (res.success) {
      await fetchBulletins();
      resetForm();
    } else {
      alert("Failed to save: " + res.error);
    }
  } catch (err) {
    console.error(err);
    alert("Save failed: " + err.message);
  } finally {
    isSubmitting.value = false;
    isUploading.value = false;
    if (progressInterval) clearInterval(progressInterval);
  }
};

const editBulletin = (bulletin) => {
  bulletinForm.value = {
    title: bulletin.title,
    content: bulletin.content,
    category: bulletin.category,
    content_url: bulletin.content_url || "",
    is_published: bulletin.is_published,
  };
  isEditing.value = true;
  editingId.value = bulletin.id;
  showForm.value = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const handleDelete = async (id) => {
  if (!confirm("Are you sure you want to delete this bulletin?")) return;
  const res = await apiDeleteBulletin(id);
  if (res.success) {
    await fetchBulletins();
  } else {
    alert("Failed to delete: " + res.error);
  }
};

const openDetailModal = (bulletin) => {
  selectedBulletin.value = bulletin;
  // If user is admin, they might want to EDIT via the modal
  isModalOpen.value = true;
};

const handleResize = () => {
  isLgScreen.value = window.innerWidth >= 1024;
};

// Lifecycle
onMounted(() => {
  fetchBulletins();
  subscribeToBulletins();
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  if (bulletinSubscription) supabase.removeChannel(bulletinSubscription);
});

// Watch for modal close to refresh if needed
watch(isModalOpen, (newVal, oldVal) => {
  if (oldVal === true && newVal === false) {
    fetchBulletins();
  }
});

// Utils
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

const formatDate = (isoString) => {
  if (!isoString) return "";
  return new Date(isoString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
</script>

<template>
  <div class="bulletin-view p-4 md:p-8 space-y-6">
    <div class="flex items-end justify-between">
      <div>
        <h3 class="text-2xl font-black tracking-tight">
          Permata Tajur Townhouse Bulletin Board
        </h3>
        <p class="text-slate-500 text-sm">
          {{ canManage ? "Manage announcements and community updates." : "Latest news and updates from management." }}
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
            <span class="material-symbols-outlined text-primary">{{ isEditing ? "edit_note" : "add_circle" }}</span>
            {{ isEditing ? "Edit Bulletin" : "New Bulletin Entry" }}
          </h4>
          <form class="space-y-4" @submit.prevent="handlePublish(true)">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Bulletin Title</label>
              <input v-model="bulletinForm.title" required class="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/50 font-medium placeholder:text-slate-300" placeholder="e.g. Annual Community Meeting" type="text" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Category</label>
              <select v-model="bulletinForm.category" class="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/50 font-medium cursor-pointer">
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Content</label>
              <RichTextEditor v-model="bulletinForm.content" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Attachment</label>
              <div class="space-y-2">
                <input type="file" id="bulletin-file-input" @change="(e) => (selectedFile = e.target.files[0])" accept="image/*,video/*,.pdf" class="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:bg-primary/10 file:text-primary file:font-bold file:cursor-pointer transition-all" />
                <div v-if="selectedFile" class="flex items-center gap-2 text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-lg">
                  <span class="material-symbols-outlined text-[14px]">attachment</span> {{ selectedFile.name }}
                  <button type="button" @click="selectedFile = null" class="ml-auto text-slate-400 hover:text-rose-500"><span class="material-symbols-outlined text-[14px]">close</span></button>
                </div>
                <input v-if="!selectedFile" v-model="bulletinForm.content_url" class="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/50 font-medium placeholder:text-slate-300" placeholder="Paste content URL..." type="url" />
              </div>
            </div>
            <div class="flex gap-3 pt-4">
              <button v-if="isEditing" @click="resetForm" class="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-lg text-xs" type="button">Cancel</button>
              <button @click.prevent="handlePublish(false)" :disabled="isSubmitting" class="flex-1 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-lg text-xs disabled:opacity-50 flex items-center justify-center gap-2" type="button">
                <span class="material-symbols-outlined text-sm">save</span>
                Save Draft
              </button>
              <button :disabled="isSubmitting" class="flex-1 py-3 bg-primary text-white font-bold rounded-lg text-xs disabled:opacity-50 flex items-center justify-center gap-2" type="submit">
                <span v-if="isSubmitting" class="material-symbols-outlined animate-spin text-sm">refresh</span>
                {{ isSubmitting ? "Processing..." : isEditing ? "Update" : "Publish" }}
              </button>
            </div>
            <div v-if="isUploading" class="pt-2">
              <div class="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                <span>Uploading Media...</span><span>{{ uploadProgress }}%</span>
              </div>
              <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div class="bg-primary h-full rounded-full transition-all duration-300" :style="`width: ${uploadProgress}%`"></div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Bulletin Cards Grid -->
      <div :class="[canManage ? 'lg:col-span-2' : 'col-span-1', 'space-y-4']">
        <div v-if="isLoading" class="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-primary/10 border-dashed">
          <span class="material-symbols-outlined animate-spin text-4xl text-primary mb-4">refresh</span>
          <p class="text-sm text-slate-500 font-medium">Fetching updates...</p>
        </div>
        <div v-else-if="bulletins.length === 0" class="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-primary/10 border-dashed">
          <span class="material-symbols-outlined text-4xl text-slate-300 mb-4">newspaper</span>
          <p class="text-sm text-slate-500 font-medium">No bulletins found.</p>
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="bulletin in bulletins" :key="bulletin.id" class="bg-white dark:bg-slate-900 border border-primary/10 rounded-xl overflow-hidden shadow-sm group">
            <div class="h-40 md:h-32 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
              <img v-if="getFileType(bulletin.content_url) === 'image'" :src="bulletin.content_url" class="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
              <video v-else-if="getFileType(bulletin.content_url) === 'video'" :src="bulletin.content_url" class="w-full h-full object-cover" controls preload="metadata"></video>
              <div v-else-if="getFileType(bulletin.content_url) === 'pdf'" class="w-full h-full flex flex-col items-center justify-center bg-rose-50 dark:bg-rose-900/20">
                <span class="material-symbols-outlined text-4xl text-rose-500">picture_as_pdf</span>
                <p class="text-[10px] font-bold text-rose-500 mt-1">PDF</p>
              </div>
              <div v-else class="w-full h-full flex items-center justify-center"><span class="material-symbols-outlined text-4xl text-slate-300">image</span></div>
              <div class="absolute top-3 left-3" v-if="canManage">
                <span :class="['px-2 py-1 text-white text-[9px] font-black uppercase tracking-wider rounded', bulletin.is_published ? 'bg-emerald-500' : 'bg-amber-500']">{{ bulletin.is_published ? "Published" : "Draft" }}</span>
              </div>
            </div>
            <div class="p-5">
              <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">{{ formatDate(bulletin.created_at) }}</p>
              <div class="cursor-pointer" @click="openDetailModal(bulletin)">
                <h5 class="font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">{{ bulletin.title }}</h5>
                <div class="prose prose-sm prose-slate dark:prose-invert max-w-none line-clamp-3 mb-4 text-xs" v-html="sanitizeHtml(bulletin.content)"></div>
              </div>
              <div v-if="canManage" class="flex items-center justify-between border-t border-slate-50 dark:border-slate-800 pt-4">
                <div class="flex gap-2">
                  <button @click="editBulletin(bulletin)" class="p-1.5 text-slate-400 hover:text-primary transition-colors bg-slate-50 dark:bg-slate-800 rounded"><span class="material-symbols-outlined text-lg">edit</span></button>
                  <button @click="handleDelete(bulletin.id)" class="p-1.5 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 dark:bg-slate-800 rounded"><span class="material-symbols-outlined text-lg">delete</span></button>
                </div>
                <span class="text-[10px] font-bold text-slate-400 uppercase">{{ bulletin.category || "General" }}</span>
              </div>
            </div>
          </div>
        </div>
        <button v-if="hasMore" @click="loadMore" :disabled="isLoadingMore" class="w-full py-3 bg-white dark:bg-slate-900 border border-primary/10 text-slate-500 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
          <span v-if="isLoadingMore" class="material-symbols-outlined animate-spin text-sm">refresh</span>
          {{ isLoadingMore ? "Loading..." : "Load More Bulletins" }}
        </button>
      </div>
    </div>

    <!-- The Detail/Edit Modal -->
    <BulletinDetailModal v-if="selectedBulletin || isModalOpen" :isOpen="isModalOpen" :bulletin="selectedBulletin" :existingBulletin="selectedBulletin" @close="isModalOpen = false; selectedBulletin = null" @refresh="fetchBulletins" />
  </div>
</template>

<style>
.prose.line-clamp-3 p { margin: 0 !important; display: inline !important; }
.prose.line-clamp-3 { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; line-clamp: 3; overflow: hidden; }
</style>
