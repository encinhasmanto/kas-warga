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
  </teleport>
</template>

<script setup>
const props = defineProps({
  bulletin: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["close"]);

const close = () => {
  emit("close");
};

const openMedia = (url) => {
  window.open(url, "_blank", "noopener,noreferrer");
};

import { computed } from "vue";
import { sanitizeHtml } from "@/utils/sanitizeHtml";

const sanitizedContent = computed(() => sanitizeHtml(props.bulletin?.content));

// Smart file type detection from URL (re-used logic)
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
</script>
