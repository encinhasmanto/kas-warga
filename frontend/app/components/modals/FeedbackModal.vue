<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 overflow-hidden">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="emit('close')"></div>

        <!-- Modal Container -->
        <div class="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 z-10 flex flex-col max-h-[90vh]">
          <!-- Header -->
          <div class="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
            <div>
              <h3 class="text-xl font-black tracking-tight">Feedback Center</h3>
              <p class="text-xs text-slate-500">Issues, Questions & Suggestions</p>
            </div>
            <button @click="emit('close')" class="size-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Tabs -->
          <div class="flex border-b border-slate-100 dark:border-slate-800 shrink-0">
            <button 
              @click="activeTab = 'submit'" 
              :class="['flex-1 py-4 text-sm font-bold transition-all border-b-2', activeTab === 'submit' ? 'border-primary text-primary' : 'border-transparent text-slate-400']"
            >
              New Feedback
            </button>
            <button 
              @click="activeTab = 'list'" 
              :class="['flex-1 py-4 text-sm font-bold transition-all border-b-2', activeTab === 'list' ? 'border-primary text-primary' : 'border-transparent text-slate-400']"
            >
              My Submissions
            </button>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto p-6 md:p-8 no-scrollbar">
            <!-- Submit Form -->
            <div v-if="activeTab === 'submit'" class="space-y-6">
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                <div class="grid grid-cols-3 gap-2">
                  <button 
                    v-for="type in types" :key="type.id"
                    @click="form.type = type.id"
                    :class="['py-3 px-1 rounded-2xl text-[10px] font-black uppercase tracking-wider border-2 transition-all', form.type === type.id ? 'border-primary bg-primary/10 text-primary' : 'border-slate-100 dark:border-slate-800 text-slate-400']"
                  >
                    <span class="material-symbols-outlined block text-[20px] mb-1">{{ type.icon }}</span>
                    {{ type.label }}
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Subject</label>
                <input v-model="form.subject" type="text" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl py-4 px-5 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="Brief summary of your feedback..." />
              </div>

              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Message</label>
                <textarea v-model="form.message" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl py-4 px-5 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[120px] resize-none" placeholder="Tell us more details..."></textarea>
              </div>

              <button 
                @click="handleSubmit" 
                :disabled="isSubmitting || !isFormValid"
                class="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-lg shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {{ isSubmitting ? 'Sending...' : 'Send Feedback' }}
              </button>
            </div>

            <!-- Submissions List -->
            <div v-else class="space-y-4">
              <div v-if="isLoadingList" class="flex justify-center py-12">
                <span class="material-symbols-outlined animate-spin text-primary">refresh</span>
              </div>
              <div v-else-if="feedbackList.length === 0" class="text-center py-12 opacity-30">
                <span class="material-symbols-outlined text-6xl mb-2">history</span>
                <p class="text-sm font-bold">No feedback yet</p>
              </div>
              <div v-else v-for="item in feedbackList" :key="item.id" class="p-5 rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <div class="flex items-center justify-between mb-3">
                  <span :class="['px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest', getStatusClass(item.status)]">
                    {{ item.status }}
                  </span>
                  <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    {{ new Date(item.created_at).toLocaleDateString() }}
                  </span>
                </div>
                <h4 class="font-bold text-sm mb-1">{{ item.subject }}</h4>
                <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed">{{ item.message }}</p>
                <div v-if="item.admin_notes" class="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <p class="text-[9px] font-black text-primary uppercase tracking-widest mb-1">Admin Response:</p>
                  <p class="text-xs italic text-slate-600 dark:text-slate-400">{{ item.admin_notes }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';

const props = defineProps({
  isOpen: Boolean
});

const emit = defineEmits(['close']);

const { submitFeedback, getFeedbackList } = useFeedbackService();

const activeTab = ref('submit');
const isSubmitting = ref(false);
const isLoadingList = ref(false);
const feedbackList = ref([]);

const types = [
  { id: 'issue', label: 'Issue', icon: 'report_problem' },
  { id: 'question', label: 'Question', icon: 'help' },
  { id: 'suggestion', label: 'Suggestion', icon: 'lightbulb' }
];

const form = reactive({
  type: 'issue',
  subject: '',
  message: ''
});

const isFormValid = computed(() => {
  return form.subject.trim().length > 3 && form.message.trim().length > 10;
});

async function handleSubmit() {
  if (!isFormValid.value) return;
  isSubmitting.value = true;
  try {
    const res = await submitFeedback(form);
    if (res.success) {
      form.subject = '';
      form.message = '';
      activeTab.value = 'list';
      fetchList();
    }
  } finally {
    isSubmitting.value = false;
  }
}

async function fetchList() {
  isLoadingList.value = true;
  try {
    const res = await getFeedbackList();
    if (res.success) {
      feedbackList.value = res.data;
    }
  } finally {
    isLoadingList.value = false;
  }
}

function getStatusClass(status) {
  switch (status) {
    case 'open': return 'bg-amber-100 text-amber-600';
    case 'in_progress': return 'bg-blue-100 text-blue-600';
    case 'resolved': return 'bg-emerald-100 text-emerald-600';
    case 'closed': return 'bg-slate-100 text-slate-600';
    default: return 'bg-slate-100 text-slate-600';
  }
}

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    fetchList();
    activeTab.value = 'submit';
  }
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.no-scrollbar::-webkit-scrollbar { display: none; }
</style>
