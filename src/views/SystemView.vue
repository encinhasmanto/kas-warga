<template>
  <div class="max-w-4xl mx-auto space-y-6 pb-20">
    <!-- Header Section -->
    <header class="mb-8">
      <h1 class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">System Settings</h1>
      <p class="text-slate-500 dark:text-slate-400 mt-1">Manage your profile and security preferences.</p>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Profile Card -->
      <div class="md:col-span-1 space-y-6">
        <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-primary/10 shadow-sm overflow-hidden relative group">
          <div class="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div class="relative flex flex-col items-center text-center">
            <div class="relative mb-4">
              <div class="size-24 rounded-full border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img 
                  :src="unitData?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${unitData?.name || 'Unit'}`" 
                  class="w-full h-full object-cover"
                  alt="Avatar"
                />
              </div>
              <label 
                for="avatar-upload" 
                class="absolute bottom-0 right-0 size-8 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary-dark transition-colors border-2 border-white dark:border-slate-800"
              >
                <span class="material-symbols-outlined text-sm">photo_camera</span>
                <input 
                  id="avatar-upload" 
                  type="file" 
                  class="hidden" 
                  accept="image/*" 
                  @change="handlePhotoUpload"
                  :disabled="isUploading"
                />
              </label>
            </div>
            
            <h2 class="text-xl font-bold">{{ unitData?.name || 'Loading...' }}</h2>
            <p class="text-sm text-slate-500 font-medium">Unit {{ unitData?.code || '...' }}</p>
            
            <div v-if="isUploading" class="mt-4 w-full flex flex-col items-center">
              <div class="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div class="h-full bg-primary animate-progress w-full"></div>
              </div>
              <p class="text-[10px] uppercase font-black text-primary mt-2">Uploading...</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Settings Forms -->
      <div class="md:col-span-2 space-y-6">
        <!-- Change PIN Card - Only for Residents -->
        <div v-if="session?.type === 'resident'" class="bg-white dark:bg-slate-900 rounded-2xl border border-primary/10 shadow-sm overflow-hidden">
          <div class="p-6 border-b border-primary/5">
            <div class="flex items-center gap-3">
              <div class="size-10 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center">
                <span class="material-symbols-outlined">lock_reset</span>
              </div>
              <div>
                <h3 class="font-bold text-lg">Change Security PIN</h3>
                <p class="text-xs text-slate-500 font-medium">Ensure your account stays secure</p>
              </div>
            </div>
          </div>
          
          <div class="p-6 space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Current PIN Field -->
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Current PIN</label>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">key</span>
                  
                  <input 
                    v-model="pinForm.oldPin"
                    :type="showPins ? 'text' : 'password'" 
                    inputmode="numeric"
                    pattern="[0-9]*"
                    maxlength="6"
                    @input="enforceNumeric($event, 'oldPin')"
                    placeholder="••••••"
                    class="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium tracking-widest"
                  />
            
                  <!-- Visibility Toggle Button -->
                  <button 
                    type="button"
                    @click="showPins = !showPins"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    <span class="material-symbols-outlined text-lg">
                      {{ showPins ? 'visibility' : 'visibility_off' }}
                    </span>
                  </button>
                </div>
              </div>
            
              <!-- New PIN Field -->
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">New PIN</label>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">password</span>
                  
                  <input 
                    v-model="pinForm.newPin"
                    :type="showPins ? 'text' : 'password'" 
                    inputmode="numeric"
                    pattern="[0-9]*"
                    maxlength="6"
                    @input="enforceNumeric($event, 'newPin')"
                    placeholder="••••••"
                    class="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium tracking-widest"
                  />
                </div>
              </div>
            </div>            
            
            <div class="flex justify-end pt-2">
              <button 
                @click="handleChangePin"
                :disabled="isUpdatingPin || !pinForm.oldPin || !pinForm.newPin"
                class="px-6 py-2.5 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:bg-primary-dark transition-all shadow-md shadow-primary/20 disabled:opacity-50 disabled:grayscale cursor-pointer"
              >
                <span v-if="!isUpdatingPin" class="material-symbols-outlined text-lg">save</span>
                <span v-else class="material-symbols-outlined text-lg animate-spin">sync</span>
                Update PIN
              </button>
            </div>
          </div>
        </div>

        <!-- System Preferences Card -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-primary/10 shadow-sm overflow-hidden">
          <div class="p-6 border-b border-primary/5">
            <div class="flex items-center gap-3">
              <div class="size-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                <span class="material-symbols-outlined">settings_suggest</span>
              </div>
              <div>
                <h3 class="font-bold text-lg">System Preferences</h3>
                <p class="text-xs text-slate-500 font-medium">General system behavior</p>
              </div>
            </div>
          </div>
          <div class="p-6">
            <p class="text-sm text-slate-500 italic">Advanced settings Coming Soon...</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modals -->
    <teleport to="body">
      <!-- Success Modal -->
      <transition name="modal">
        <div v-if="showSuccessModal" class="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="showSuccessModal = false"></div>
          <div class="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center">
            <div class="size-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mb-6 scale-animate">
              <span class="material-symbols-outlined text-5xl">check_circle</span>
            </div>
            <h3 class="text-2xl font-bold mb-2">{{ successContent.title }}</h3>
            <p class="text-slate-500 dark:text-slate-400 mb-8">{{ successContent.message }}</p>
            <button 
              @click="showSuccessModal = false"
              class="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-bold transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { getProfileData, updateUnitPin, uploadAvatar, subscribeToProfileChanges } from '@/services/profileService';

const { session, avatarUrl } = useAuth();
const unitData = ref(null);
const isUploading = ref(false);
const isUpdatingPin = ref(false);

const showSuccessModal = ref(false);
const successContent = ref({ title: '', message: '' });

const pinForm = ref({
  oldPin: '',
  newPin: ''
});

let profileSub = null;

onMounted(async () => {
  if (session.value?.id) {
    const res = await getProfileData(session.value.id, session.value.type);
    if (res.success) {
      unitData.value = res.data;
    }

    // Subscribe to changes in case they happen elsewhere
    profileSub = subscribeToProfileChanges(session.value.type, session.value.id, (newData) => {
      unitData.value = { ...unitData.value, ...newData };
    });
  }
});

onUnmounted(() => {
  if (profileSub) profileSub.unsubscribe();
});

const handlePhotoUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  isUploading.value = true;
  const res = await uploadAvatar(file, session.value.id, session.value.type);
  
  if (res.success) {
    unitData.value.avatar_url = res.publicUrl;
    avatarUrl.value = res.publicUrl; // Update global reactive state
    
    // Update session storage manually too for persistence
    const raw = JSON.parse(sessionStorage.getItem("dw_session") || "{}");
    raw.avatarUrl = res.publicUrl;
    sessionStorage.setItem("dw_session", JSON.stringify(raw));

    successContent.value = {
      title: 'Profile Updated',
      message: 'Your profile photo has been successfully updated.'
    };
    showSuccessModal.value = true;
  } else {
    alert("Upload failed: " + res.error);
  }
  isUploading.value = false;
};

const handleChangePin = async () => {
  if (pinForm.value.newPin.length < 4) {
    alert("New PIN must be at least 4 digits");
    return;
  }

  isUpdatingPin.value = true;
  const res = await updateUnitPin(session.value.id, pinForm.value.oldPin, pinForm.value.newPin);
  
  if (res.success) {
    successContent.value = {
      title: 'PIN Changed',
      message: 'Your security PIN has been updated successfully.'
    };
    showSuccessModal.value = true;
    pinForm.value = { oldPin: '', newPin: '' };
  } else {
    alert(res.error || "Failed to update PIN");
  }
  isUpdatingPin.value = false;
};
</script>

<style scoped>
@keyframes progress {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.animate-progress {
  animation: progress 1.5s infinite linear;
}

.scale-animate {
  animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes scaleIn {
  0% { transform: scale(0); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.modal-enter-active, .modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
