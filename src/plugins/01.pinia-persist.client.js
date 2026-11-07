import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// Tetap memakai localStorage ("auth") seperti sebelumnya; supabaseClient membacanya.
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.$pinia.use(piniaPluginPersistedstate)
})
