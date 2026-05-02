<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 overflow-hidden">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="close"></div>

        <!-- Modal Container -->
        <div class="relative bg-white dark:bg-slate-900 w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 z-10">
          <!-- Close Button -->
          <button
            @click="close"
            class="absolute top-4 right-4 z-20 w-9 h-9 flex items-center justify-center bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-all"
          >
            <span class="material-symbols-outlined text-base">close</span>
          </button>

          <!-- Scrollable Body -->
          <div class="flex-1 overflow-y-auto no-scrollbar">
            <!-- Media Peek -->
            <div v-if="bulletin?.content_url" class="w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center py-8 shrink-0">
              <img
                v-if="getFileType(bulletin.content_url) === 'image'"
                :src="bulletin.content_url"
                class="max-w-full max-h-[50vh] object-contain rounded-xl"
                alt="Bulletin media"
              />
              <video
                v-else-if="getFileType(bulletin.content_url) === 'video'"
                :src="bulletin.content_url"
                class="w-full max-h-[50vh] object-contain bg-black"
                controls
              ></video>
              <div
                v-else-if="getFileType(bulletin.content_url) === 'pdf'"
                class="p-6 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 flex flex-col items-center gap-4"
              >
                <span class="material-symbols-outlined text-4xl text-rose-500">picture_as_pdf</span>
                <p class="text-xs font-bold">Attached PDF Document</p>
                <a
                  :href="bulletin.content_url"
                  target="_blank"
                  class="px-4 py-2 bg-rose-500 text-white rounded-lg text-xs font-bold hover:bg-rose-600 transition-colors"
                >Open Document</a>
              </div>
            </div>

            <!-- Content -->
            <div class="p-6 md:p-10 space-y-6">
              <!-- Meta Row -->
              <div class="flex items-center gap-3 flex-wrap">
                <span class="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-primary/10 text-primary">
                  {{ bulletin?.category || "General Update" }}
                </span>
                <span class="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[14px]">calendar_month</span>
                  {{ formatDate(bulletin?.created_at) }}
                </span>
              </div>

              <!-- Title -->
              <h2 class="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                {{ bulletin?.title }}
              </h2>

              <!-- Divider -->
              <div class="w-12 h-1 bg-primary rounded-full"></div>

              <!-- Rich Text Content -->
              <div
                class="prose prose-slate dark:prose-invert max-w-none pb-12"
                v-html="sanitizedContent"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { computed, watch } from 'vue'
import { sanitizeHtml } from '~/utils/sanitizeHtml'

const props = defineProps({
  bulletin: { type: Object, default: null },
  isOpen: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'refresh'])

const close = () => emit('close')

const sanitizedContent = computed(() => sanitizeHtml(props.bulletin?.content || ''))

// Lock / restore body scroll when modal opens or closes
watch(() => props.isOpen, (val) => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = val ? 'hidden' : ''
})

function getFileType(url) {
  if (!url) return 'none'
  const lower = url.toLowerCase()
  if (/\.(jpg|jpeg|png|gif|webp|svg|bmp|avif)(\?|$)/i.test(lower)) return 'image'
  if (/\.(mp4|webm|mov|avi|mkv|ogg)(\?|$)/i.test(lower)) return 'video'
  if (/\.pdf(\?|$)/i.test(lower)) return 'pdf'
  if (lower.includes('youtube.com') || lower.includes('youtu.be') || lower.includes('vimeo.com')) return 'video'
  if (lower.includes('/storage/') && !lower.includes('.pdf')) return 'image'
  return 'unknown'
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('id-ID', { dateStyle: 'long' })
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
