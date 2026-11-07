import { resolve } from 'node:path'

// KasWarga: Nuxt dalam mode SPA (ssr:false). Hash routing dipertahankan agar
// tautan lama (#/app/...) dan aturan Netlify (/* -> /index.html) tetap berfungsi.
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false,
  srcDir: 'src/',
  dir: { public: 'public' },
  modules: ['@pinia/nuxt'],
  pages: true,
  components: { dirs: [] }, // semua komponen diimpor eksplisit
  css: ['~/assets/styles/global.css'],
  router: { options: { hashMode: true } },
  postcss: {
    plugins: {
      tailwindcss: { config: resolve('tailwind.config.js') },
      autoprefixer: {},
    },
  },
  nitro: {
    // Netlify mempublikasikan folder "dist"
    output: { publicDir: resolve('dist') },
  },
  devtools: { enabled: false },
  app: {
    head: {
      htmlAttrs: { lang: 'id' },
      title: 'KasWarga — Permata Tajur Townhouse',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
        { name: 'theme-color', content: '#4caf50' },
        { name: 'description', content: 'Sistem pengelolaan kas warga Permata Tajur Townhouse' },
      ],
      link: [
        { rel: 'manifest', href: '/manifest.json' },
        { rel: 'icon', type: 'image/ico', href: '/icons/LogoPermataTajurTownhouse-alpha3.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL,GRAD,opsz@100..700,0..1,-50..200,20..48&display=swap' },
      ],
    },
  },
})
