<template>
  <teleport to="body">
    <div
      v-if="bulletin"
      class="fixed inset-0 z-[9999] flex items-center justify-center"
    >
      <!-- Backdrop (Edge-to-edge background) -->
      <div 
        class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        @click="close"
      ></div>

      <!-- Modal Content Container (with padding/margin so it doesn't touch edges) -->
      <div
        class="relative bg-white dark:bg-slate-900 w-[calc(100%-2rem)] max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden transform transition-all m-4"
        @click.stop
      >
      <!-- Close Button (Floating) -->
      <button
        @click="close"
        class="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-black/20 hover:bg-black/40 text-white rounded-full transition-all backdrop-blur-md"
      >
        <span class="material-symbols-outlined text-sm">close</span>
      </button>

      <!-- Scrollable Content Area -->
      <div class="flex-1 overflow-y-auto no-scrollbar">
        <!-- Media Header -->
        <div
          v-if="bulletin.content_url"
          class="w-full bg-slate-100 dark:bg-slate-800 relative group flex items-center justify-center pt-8 pb-4"
          :class="{
            'min-h-[200px]': getFileType(bulletin.content_url) !== 'pdf',
          }"
        >
          <!-- Image full -->
          <img
            v-if="getFileType(bulletin.content_url) === 'image'"
            :src="bulletin.content_url"
            alt="Bulletin Image"
            class="max-w-full max-h-[50vh] object-contain cursor-zoom-in"
            @click="openMedia(bulletin.content_url)"
          />

          <!-- Video fully playable -->
          <video
            v-else-if="getFileType(bulletin.content_url) === 'video'"
            :src="bulletin.content_url"
            class="w-full max-h-[50vh] object-contain bg-black"
            controls
            controlsList="nodownload"
            preload="metadata"
          ></video>

          <!-- PDF Peek / Button -->
          <div
            v-else-if="getFileType(bulletin.content_url) === 'pdf'"
            class="w-full flex justify-center py-6"
          >
            <a
              :href="bulletin.content_url"
              target="_blank"
              class="w-full max-w-xs block group/pdf"
            >
              <div
                class="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col items-center gap-4 hover:shadow-md transition-all hover:border-primary/50 relative overflow-hidden"
              >
                <div
                  class="absolute inset-0 bg-rose-500/5 group-hover/pdf:bg-primary/5 transition-colors"
                ></div>
                <div
                  class="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-900/30 text-rose-500 flex items-center justify-center"
                >
                  <span class="material-symbols-outlined text-3xl"
                    >picture_as_pdf</span
                  >
                </div>
                <div class="text-center relative z-10">
                  <h4
                    class="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover/pdf:text-primary transition-colors"
                  >
                    Attached PDF Document
                  </h4>
                  <p class="text-xs text-slate-400 mt-1">
                    Click to securely open and read the full PDF in a new secure
                    tab.
                  </p>
                </div>
                <div
                  class="w-full py-2 bg-rose-500 text-white rounded-lg font-bold text-xs flex justify-center items-center gap-2 mt-2 group-hover/pdf:bg-primary transition-colors hover:scale-[1.02]"
                >
                  <span class="material-symbols-outlined text-sm"
                    >open_in_new</span
                  >
                  Open Document
                </div>
              </div>
            </a>
          </div>
        </div>

        <!-- Bulletin Text Details -->
        <div class="p-6 md:p-8 lg:px-10 space-y-6">
          <div class="flex items-center gap-3">
            <span
              class="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg"
              :class="
                bulletin.category === 'Emergency'
                  ? 'bg-rose-100 text-rose-600'
                  : 'bg-primary/10 text-primary'
              "
            >
              {{ bulletin.category || "General Update" }}
            </span>
            <span
              class="text-xs font-semibold text-slate-500 flex items-center gap-1.5"
            >
              <span class="material-symbols-outlined text-[14px]"
                >calendar_month</span
              >
              {{ formatDate(bulletin.created_at) }}
            </span>
          </div>

          <h2
            class="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight"
          >
            {{ bulletin.title }}
          </h2>

          <div class="w-12 h-1 bg-primary rounded-full"></div>

          <!-- Rich Text Formatting Wrapper -->
          <div
            class="prose prose-slate prose-lg dark:prose-invert max-w-none prose-img:rounded-xl pb-12"
            v-html="sanitizedContent"
          ></div>
        </div>
      </div>
      </div>
    </div>
    <transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="confirmClose"></div>

        <div class="relative bg-white dark:bg-slate-900 w-full max-w-4xl h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
            <input 
              v-model="bulletinData.title"
              type="text" 
              placeholder="Bulletin Title..."
              class="text-xl font-bold bg-transparent border-none focus:ring-0 p-0 w-full text-slate-900 dark:text-white placeholder:text-slate-400"
            />
            
            <div class="flex items-center gap-2 shrink-0 ml-4">
              <!-- Category Dropdown -->
              <select 
                v-model="bulletinData.category" 
                class="px-3 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-primary/50 cursor-pointer"
              >
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
              <!-- Save Draft -->
              <button @click="saveDraft" :disabled="isSaving" class="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-lg transition-colors">
                <span v-if="isSaving" class="material-symbols-outlined text-sm animate-spin">refresh</span>
                <span v-else>Draft</span>
              </button>
              <!-- Publish -->
              <button @click="publishBulletin" :disabled="isSaving" class="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-lg transition-colors shadow-sm shadow-primary/20 disabled:opacity-50">
                Publish
              </button>
              <button @click="confirmClose" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>

          <!-- Editor -->
          <div class="flex-1 overflow-hidden p-6 bg-slate-100 dark:bg-slate-950">
            <RichTextEditor 
              v-model="bulletinData.content" 
              :is-saving="isSaving"
              :last-saved="lastSaved"
            />
          </div>
          
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { sanitizeHtml } from "@/utils/sanitizeHtml";
import { bulletinService } from '@/services/bulletinService';
import RichTextEditor from '@/components/forms/RichTextEditor.vue';

const props = defineProps({
  // View mode prop
  bulletin: {
    type: Object,
    default: null,
  },
  // Edit mode props
  isOpen: {
    type: Boolean,
    default: false
  },
  existingBulletin: { 
    type: Object, 
    default: null 
  } 
});

const emit = defineEmits(["close", "refresh"]);

// --- Shared Logic ---
const close = () => {
  emit("close");
};

const openMedia = (url) => {
  window.open(url, "_blank", "noopener,noreferrer");
};

const sanitizedContent = computed(() => sanitizeHtml(props.bulletin?.content));

// Smart file type detection from URL
function getFileType(url) {
  if (!url) return "none";
  const lower = url.toLowerCase();
  if (/\.(jpg|jpeg|png|gif|webp|svg|bmp|avif)(\?|$)/i.test(lower))
    return "image";
  if (/\.(mp4|webm|mov|avi|mkv|ogg)(\?|$)/i.test(lower)) return "video";
  if (/\.pdf(\?|$)/i.test(lower)) return "pdf";
  if (
    lower.includes("youtube.com") ||
    lower.includes("youtu.be") ||
    lower.includes("vimeo.com")
  )
    return "video";
  if (lower.includes("/storage/") && !lower.includes(".pdf")) return "image";
  return "unknown";
}

function formatDate(isoString) {
  if (!isoString) return "";
  return new Date(isoString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// --- Edit Mode Logic ---
const categories = ['General', 'Meeting Update', 'Report', 'System Update'];

const bulletinData = ref({
  id: null,
  title: '',
  content: '',
  category: 'General',
  is_published: false
});

const isSaving = ref(false);
const lastSaved = ref(null);
let autoSaveInterval = null;

// Start/stop 2-minute auto-save interval when modal opens/closes
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.existingBulletin) {
      bulletinData.value = { ...props.existingBulletin };
    } else {
      bulletinData.value = { id: null, title: '', content: '', category: 'General', is_published: false };
    }
    lastSaved.value = null;
    startAutoSave();
  } else {
    stopAutoSave();
  }
});

const startAutoSave = () => {
  stopAutoSave();
  autoSaveInterval = setInterval(async () => {
    if (!bulletinData.value.title && !bulletinData.value.content) return;
    await performAutoSave();
  }, 120000); // 2 minutes
};

const stopAutoSave = () => {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
    autoSaveInterval = null;
  }
};

const performAutoSave = async () => {
  try {
    isSaving.value = true;
    const payload = { ...bulletinData.value };
    const savedResponse = await bulletinService.saveBulletin(payload);
    if (!bulletinData.value.id && savedResponse.id) {
      bulletinData.value.id = savedResponse.id;
    }
    lastSaved.value = new Date();
  } catch (error) {
    console.error("Auto-save failed:", error);
  } finally {
    isSaving.value = false;
  }
};

const saveDraft = async () => {
  try {
    isSaving.value = true;
    bulletinData.value.is_published = false;
    const savedResponse = await bulletinService.saveBulletin(bulletinData.value);
    if (!bulletinData.value.id && savedResponse.id) {
      bulletinData.value.id = savedResponse.id;
    }
    lastSaved.value = new Date();
    emit('refresh');
  } catch (error) {
    console.error("Draft save failed:", error);
    alert("Failed to save draft.");
  } finally {
    isSaving.value = false;
  }
};

const publishBulletin = async () => {
  try {
    isSaving.value = true;
    bulletinData.value.is_published = true;
    await bulletinService.saveBulletin(bulletinData.value);
    emit('refresh'); 
    emit('close');
  } catch (error) {
    console.error("Publish failed:", error);
    alert("Failed to publish bulletin.");
    bulletinData.value.is_published = false;
  } finally {
    isSaving.value = false;
  }
};

const confirmClose = () => {
  stopAutoSave();
  emit('close');
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>