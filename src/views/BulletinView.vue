<template>
  <div class="bulletin-view p-4 md:p-8 space-y-6">
    <div class="flex items-end justify-between">
      <div>
        <h3 class="text-2xl font-black tracking-tight">
          Permata Tajur Townhouse Bulletin Board
        </h3>
        <p class="text-slate-500 text-sm">
          {{
            canManage
              ? "Manage announcements and community updates."
              : "Latest news and updates from management."
          }}
        </p>
      </div>
      <button
        v-if="canManage && !showForm"
        @click="showForm = true"
        class="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 transition-all flex items-center gap-2"
      >
        <span class="material-symbols-outlined text-sm">add</span> Create New
        Bulletin
      </button>
      <button
        v-if="canManage && showForm"
        @click="showForm = false"
        class="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-all flex items-center gap-2"
      >
        <span class="material-symbols-outlined text-sm">close</span> Cancel
      </button>
    </div>

    <div
      :class="[
        'grid gap-8',
        canManage ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1',
      ]"
    >
      <!-- Admin CMS Form -->
      <div
        v-if="canManage"
        v-show="showForm || isLgScreen"
        class="lg:col-span-1"
      >
        <div
          class="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl border border-primary/10 shadow-sm sticky top-8"
        >
          <h4 class="font-bold text-lg mb-6 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">{{
              isEditing ? "edit_note" : "add_circle"
            }}</span>
            {{ isEditing ? "Edit Bulletin" : "New Bulletin Entry" }}
          </h4>
          <form class="space-y-4" @submit.prevent="handlePublish">
            <div>
              <label
                class="block text-xs font-bold text-slate-500 uppercase mb-1.5"
                >Bulletin Title</label
              >
              <input
                v-model="bulletinForm.title"
                required
                class="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/50 font-medium placeholder:text-slate-300"
                placeholder="e.g. Annual Community Meeting"
                type="text"
              />
            </div>
            <div>
              <label
                class="block text-xs font-bold text-slate-500 uppercase mb-1.5"
                >Content (HTML/Text)</label
              >
              <RichTextEditor v-model="bulletinForm.content" />
            </div>
            <div>
              <label
                class="block text-xs font-bold text-slate-500 uppercase mb-1.5"
                >Attachment (Image / Video / PDF)</label
              >
              <!-- File Upload Option -->
              <div class="space-y-2">
                <div class="relative">
                  <input
                    type="file"
                    id="bulletin-file-input"
                    @change="(e) => (selectedFile = e.target.files[0])"
                    accept="image/*,video/*,.pdf"
                    class="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:font-bold file:cursor-pointer hover:file:bg-primary/20 transition-all"
                  />
                </div>
                <div
                  v-if="selectedFile"
                  class="flex items-center gap-2 text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-lg"
                >
                  <span class="material-symbols-outlined text-[14px]"
                    >attachment</span
                  >
                  {{ selectedFile.name }}
                  <button
                    type="button"
                    @click="clearFile"
                    class="ml-auto text-slate-400 hover:text-rose-500"
                  >
                    <span class="material-symbols-outlined text-[14px]"
                      >close</span
                    >
                  </button>
                </div>
                <!-- Fallback: URL Option -->
                <div v-if="!selectedFile" class="space-y-1">
                  <p class="text-[10px] text-slate-400 font-medium">
                    — or paste content URL —
                  </p>
                  <input
                    v-model="bulletinForm.content_url"
                    class="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/50 font-medium placeholder:text-slate-300"
                    placeholder="https://example.com/image.jpg or video URL"
                    type="url"
                  />
                </div>
              </div>
            </div>
            <div class="flex gap-3 pt-4">
              <button
                v-if="isEditing"
                @click="resetForm"
                class="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-200 transition-all text-xs"
                type="button"
                :disabled="isSubmitting"
              >
                Cancel Edit
              </button>
              <button
                :disabled="isSubmitting"
                class="flex-1 py-3 bg-primary text-white font-bold rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                type="submit"
              >
                <span
                  v-if="isSubmitting"
                  class="material-symbols-outlined animate-spin text-sm"
                  >refresh</span
                >
                {{
                  isSubmitting
                    ? "Processing..."
                    : isEditing
                      ? "Update Bulletin"
                      : "Publish Now"
                }}
              </button>
            </div>

            <!-- Upload Progress UI -->
            <div v-if="isUploading" class="pt-2">
              <div
                class="flex justify-between text-[10px] font-bold text-slate-500 mb-1"
              >
                <span>Uploading Media...</span>
                <span>{{ uploadProgress }}%</span>
              </div>
              <div
                class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden"
              >
                <div
                  class="bg-primary h-full rounded-full transition-all duration-300 ease-out"
                  :style="`width: ${uploadProgress}%`"
                ></div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Bulletin Cards Grid -->
      <div :class="[canManage ? 'lg:col-span-2' : 'col-span-1', 'space-y-4']">
        <div
          v-if="isLoading"
          class="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-primary/10 border-dashed"
        >
          <span
            class="material-symbols-outlined animate-spin text-4xl text-primary mb-4"
            >refresh</span
          >
          <p class="text-sm text-slate-500 font-medium">
            Fetching the latest updates...
          </p>
        </div>

        <div
          v-else-if="bulletins.length === 0"
          class="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-primary/10 border-dashed"
        >
          <span class="material-symbols-outlined text-4xl text-slate-300 mb-4"
            >newspaper</span
          >
          <p class="text-sm text-slate-500 font-medium">
            No bulletins found at the moment.
          </p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Live Cards -->
          <div
            v-for="bulletin in bulletins"
            :key="bulletin.id"
            class="bg-white dark:bg-slate-900 border border-primary/10 rounded-xl overflow-hidden shadow-sm group"
          >
            <!-- Smart Attachment Preview -->
            <div
              class="h-40 md:h-32 bg-slate-100 dark:bg-slate-800 relative overflow-hidden"
            >
              <!-- Image -->
              <img
                v-if="getFileType(bulletin.content_url) === 'image'"
                :src="bulletin.content_url"
                alt="Bulletin"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <!-- Video -->
              <video
                v-else-if="getFileType(bulletin.content_url) === 'video'"
                :src="bulletin.content_url"
                class="w-full h-full object-cover"
                controls
                preload="metadata"
              ></video>
              <!-- PDF -->
              <div
                v-else-if="getFileType(bulletin.content_url) === 'pdf'"
                class="w-full h-full flex flex-col items-center justify-center bg-rose-50 dark:bg-rose-900/20"
              >
                <span class="material-symbols-outlined text-4xl text-rose-500"
                  >picture_as_pdf</span
                >
                <p class="text-[10px] font-bold text-rose-500 mt-1">
                  PDF Document
                </p>
              </div>
              <!-- No attachment -->
              <div
                v-else
                class="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800"
              >
                <img
                  src="/icons/Logo Permata Tajur Townhouse.jpeg"
                  class="absolute w-1/2 opacity-20 grayscale pointer-events-none"
                  alt="Logo Placeholder"
                />
                <span class="material-symbols-outlined text-4xl text-slate-300"
                  >image</span
                >
              </div>
              <div class="absolute top-3 left-3" v-if="canManage">
                <span
                  :class="[
                    'px-2 py-1 text-white text-[9px] font-black uppercase tracking-wider rounded',
                    bulletin.is_published ? 'bg-emerald-500' : 'bg-amber-500',
                  ]"
                >
                  {{ bulletin.is_published ? "Published" : "Draft" }}
                </span>
              </div>
            </div>
            <div class="p-5">
              <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">
                {{ formatDate(bulletin.created_at) }}
              </p>
              <!-- <p class="text-xs text-slate-500 line-clamp-2 mb-4">{{ bulletin.content }}</p> -->
              <div class="cursor-pointer" @click="viewBulletinDetail(bulletin)">
                <h5
                  class="font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors"
                >
                  {{ bulletin.title }}
                </h5>
                <div
                  class="prose prose-sm prose-slate dark:prose-invert max-w-none line-clamp-3 mb-4 text-xs"
                  v-html="sanitizePreview(bulletin.content)"
                ></div>
              </div>

              <!-- Attachment Action Button -->
              <div v-if="bulletin.content_url" class="mb-3">
                <a
                  v-if="getFileType(bulletin.content_url) === 'video'"
                  :href="bulletin.content_url"
                  target="_blank"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-[10px] font-bold rounded-lg hover:bg-primary/20 transition-colors"
                >
                  <span class="material-symbols-outlined text-[14px]"
                    >play_circle</span
                  >
                  Play Video
                </a>
                <a
                  v-else-if="getFileType(bulletin.content_url) === 'pdf'"
                  :href="bulletin.content_url"
                  target="_blank"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 text-rose-600 text-[10px] font-bold rounded-lg hover:bg-rose-500/20 transition-colors"
                >
                  <span class="material-symbols-outlined text-[14px]"
                    >picture_as_pdf</span
                  >
                  Open PDF
                </a>
                <a
                  v-else-if="getFileType(bulletin.content_url) === 'image'"
                  :href="bulletin.content_url"
                  target="_blank"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 text-[10px] font-bold rounded-lg hover:bg-emerald-500/20 transition-colors"
                >
                  <span class="material-symbols-outlined text-[14px]"
                    >open_in_new</span
                  >
                  View Full Image
                </a>
              </div>

              <div
                v-if="canManage"
                class="flex items-center justify-between border-t border-slate-50 dark:border-slate-800 pt-4"
              >
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
                    <span class="material-symbols-outlined text-lg"
                      >delete</span
                    >
                  </button>
                </div>
                <span class="text-[10px] font-bold text-slate-400 uppercase">{{
                  bulletin.category || "General"
                }}</span>
              </div>
              <div
                v-else
                class="pt-2 border-t border-slate-50 dark:border-slate-800"
              >
                <span class="text-[10px] font-bold text-slate-400 uppercase">{{
                  bulletin.category || "General"
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <button
          v-if="hasMore"
          @click="loadMore"
          :disabled="isLoadingMore"
          class="w-full py-3 bg-white dark:bg-slate-900 border border-primary/10 text-slate-500 text-xs font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <span
            v-if="isLoadingMore"
            class="material-symbols-outlined animate-spin text-sm"
            >refresh</span
          >
          {{ isLoadingMore ? "Loading..." : "Load More Bulletins" }}
        </button>
      </div>
    </div>

    <!-- The New Full Detail Modal -->
    <BulletinDetailModal
      v-if="selectedBulletin"
      :bulletin="selectedBulletin"
      @close="selectedBulletin = null"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useAuth } from "@/composables/useAuth.js";
import {
  getBulletins,
  createBulletin,
  updateBulletin,
  deleteBulletin,
  uploadBulletinImage,
} from "@/services/bulletinService.js";
import RichTextEditor from "@/components/forms/RichTextEditor.vue";
import BulletinDetailModal from "@/components/common/BulletinDetailModal.vue";
import { supabase } from "@/services/supabaseClient";
import { sanitizeHtml } from "@/utils/sanitizeHtml";
import { formatDate as formatDateUtil, getFileType as getFileTypeUtil } from "@/utils/formatUtils";

let bulletinSubscription = null;

const subscribeToBulletins = () => {
  bulletinSubscription = supabase
    .channel("bulletin-updates") // Name doesn't matter, but keep it unique
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "bulletins" },
      (payload) => {
        console.log("New Bulletin!", payload.new);
        // Add the new item to the start of our array
        bulletins.value.unshift(payload.new);
      },
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "bulletins" },
      (payload) => {
        console.log("Bulletin Updated!", payload.new);
        // Find and update the bulletin in the array
        const index = bulletins.value.findIndex((b) => b.id === payload.new.id);
        if (index !== -1) {
          bulletins.value[index] = payload.new;
        }
      },
    )
    .on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "bulletins" },
      (payload) => {
        console.log("Bulletin Deleted!", payload.old);
        // Remove the bulletin from the array
        bulletins.value = bulletins.value.filter(
          (b) => b.id !== payload.old.id,
        );
      },
    )
    .subscribe();
};

const { isAdmin, isSuperAdmin } = useAuth();

// Only admins can see the CMS management tools
const canManage = computed(() => isAdmin.value || isSuperAdmin.value);

// State
const bulletins = ref([]);
const isLoading = ref(true);
const isSubmitting = ref(false);
const showForm = ref(false);
const isEditing = ref(false);
const editingId = ref(null);

const isUploading = ref(false);
const uploadProgress = ref(0);
const selectedBulletin = ref(null);

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

const selectedFile = ref(null);

// UI State
const isLgScreen = ref(window.innerWidth >= 1024);
const handleResize = () => {
  isLgScreen.value = window.innerWidth >= 1024;
};

// Single onMounted: fetch data + subscribe + resize listener
onMounted(() => {
  fetchBulletins();
  subscribeToBulletins();
  window.addEventListener("resize", handleResize);
});

// Single onUnmounted: cleanup all subscriptions and listeners
onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  if (bulletinSubscription) supabase.removeChannel(bulletinSubscription);
});

async function fetchBulletins() {
  isLoading.value = true;
  currentPage.value = 0;
  const res = await getBulletins({ limit: pageSize, offset: 0 });
  if (res.success) {
    bulletins.value = res.data;
    hasMore.value = res.data.length >= pageSize;
  }
  isLoading.value = false;
}

async function loadMore() {
  isLoadingMore.value = true;
  currentPage.value++;
  const offset = currentPage.value * pageSize;
  const res = await getBulletins({ limit: pageSize, offset });
  if (res.success) {
    bulletins.value.push(...res.data);
    hasMore.value = res.data.length >= pageSize;
  }
  isLoadingMore.value = false;
}

function resetForm() {
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
}

function clearFile() {
  selectedFile.value = null;
  const fileInput = document.getElementById("bulletin-file-input");
  if (fileInput) fileInput.value = "";
}

async function handlePublish() {
  if (isSubmitting.value) return;
  isSubmitting.value = true;

  let progressInterval = null;

  try {
    // If a file is selected, upload it first and get the public URL
    if (selectedFile.value) {
      isUploading.value = true;
      uploadProgress.value = 0;

      // Simulate progress bar up to 90%
      progressInterval = setInterval(() => {
        if (uploadProgress.value < 90) {
          uploadProgress.value += Math.floor(Math.random() * 15) + 5;
          if (uploadProgress.value > 90) uploadProgress.value = 90;
        }
      }, 500);

      const publicUrl = await uploadBulletinImage(selectedFile.value);

      // Complete bar
      clearInterval(progressInterval);
      uploadProgress.value = 100;
      bulletinForm.value.content_url = publicUrl;

      // Short delay so user sees 100%
      await new Promise((r) => setTimeout(r, 500));
      isUploading.value = false;
    }

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
      alert("Failed to save bulletin: " + res.error);
    }
  } catch (err) {
    if (progressInterval) clearInterval(progressInterval);
    console.error(err);
    alert("Upload or save failed: " + err.message);
  } finally {
    isSubmitting.value = false;
    isUploading.value = false;
    if (progressInterval) clearInterval(progressInterval);
  }
}

function viewBulletinDetail(bulletin) {
  selectedBulletin.value = bulletin;
}

function editBulletin(bulletin) {
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
}

async function handleDelete(id) {
  if (!confirm("Are you sure you want to delete this bulletin?")) return;

  const res = await deleteBulletin(id);
  if (res.success) {
    await fetchBulletins();
  } else {
    alert("Failed to delete bulletin: " + res.error);
  }
}

// Smart file type detection from URL
function getFileType(url) {
  if (!url) return "none";
  const lower = url.toLowerCase();
  // Check file extension
  if (/\.(jpg|jpeg|png|gif|webp|svg|bmp|avif)(\?|$)/i.test(lower))
    return "image";
  if (/\.(mp4|webm|mov|avi|mkv|ogg)(\?|$)/i.test(lower)) return "video";
  if (/\.pdf(\?|$)/i.test(lower)) return "pdf";
  // Check common URL patterns (YouTube, etc.)
  if (
    lower.includes("youtube.com") ||
    lower.includes("youtu.be") ||
    lower.includes("vimeo.com")
  )
    return "video";
  // Default: if from our Supabase storage, try to guess from content
  if (lower.includes("/storage/") && !lower.includes(".pdf")) return "image";
  return "unknown";
}

function formatDate(isoString) {
  if (!isoString) return "";
  return new Date(isoString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function sanitizePreview(html) {
  // Keep short preview but sanitize fully
  return sanitizeHtml(html);
}
</script>

<style>
/* Paste it here at the very bottom of the file */
.prose.line-clamp-3 p {
  margin: 0 !important;
  display: inline !important;
}

/* Optional: This ensures the text looks like a normal paragraph 
   even though we forced it to be 'inline' for the clamp */
.prose.line-clamp-3 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  overflow: hidden;
}
</style>
