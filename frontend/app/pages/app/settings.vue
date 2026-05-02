<template>
  <div class="max-w-4xl mx-auto space-y-6 pb-20 p-4 md:p-8">
    <header class="mb-8">
      <h1 class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">System Settings</h1>
      <p class="text-slate-500 dark:text-slate-400 mt-1">Manage your profile and security preferences.</p>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Profile Card -->
      <div class="md:col-span-1">
        <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-primary/10 shadow-sm relative overflow-hidden group">
          <div class="relative flex flex-col items-center text-center">
            <div class="relative mb-4">
              <div class="size-24 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-100">
                <img :src="avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`" class="w-full h-full object-cover" />
              </div>
              <label for="avatar-upload" class="absolute bottom-0 right-0 size-8 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg border-2 border-white">
                <span class="material-symbols-outlined text-sm">photo_camera</span>
                <input id="avatar-upload" type="file" class="hidden" accept="image/*" @change="handlePhotoUpload" />
              </label>
            </div>
            <h2 class="text-xl font-bold">{{ displayName }}</h2>
            <p class="text-sm text-slate-500 font-medium">Unit {{ unitCode }}</p>
          </div>
        </div>
      </div>

      <!-- Settings Forms -->
      <div class="md:col-span-2 space-y-6">
        <div v-if="!isAdmin" class="bg-white dark:bg-slate-900 rounded-2xl border border-primary/10 shadow-sm overflow-hidden">
          <div class="p-6 border-b">
            <h3 class="font-bold text-lg">Change Security PIN</h3>
          </div>
          <div class="p-6 space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input v-model="pinForm.oldPin" type="password" maxlength="6" placeholder="Current PIN" class="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm" />
              <input v-model="pinForm.newPin" type="password" maxlength="6" placeholder="New PIN" class="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm" />
            </div>
            <button @click="handleChangePin" :disabled="isUpdatingPin" class="w-full py-2.5 bg-primary text-white rounded-xl font-bold disabled:opacity-50">
              Update PIN
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'app',
  middleware: ['auth']
})

const { session, displayName, unitCode, avatarUrl, isAdmin } = useAuth()
const { uploadAvatar, updateUnitPin } = useProfileService()

const pinForm = ref({ oldPin: '', newPin: '' })
const isUpdatingPin = ref(false)

async function handlePhotoUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  const res = await uploadAvatar(file, session.value.id, session.value.role === 'resident' ? 'resident' : 'admin')
  if (res.success) avatarUrl.value = res.publicUrl
}

async function handleChangePin() {
  isUpdatingPin.value = true
  try {
    const res = await updateUnitPin(session.value.id, pinForm.value.oldPin, pinForm.value.newPin)
    if (res.success) alert("PIN updated successfully")
  } finally {
    isUpdatingPin.value = false
  }
}
</script>
