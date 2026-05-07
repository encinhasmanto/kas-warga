// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
    head: {
      htmlAttrs: { lang: 'id' },
      title: 'KasWarga — Permata Tajur Townhouse',
      meta: [
        { name: 'description', content: 'Sistem pengelolaan kas warga Permata Tajur Townhouse' },
        { name: 'theme-color', content: '#137fec' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/icons/LogoPermataTajurTownhouse-alpha3.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL,GRAD,opsz@100..700,0..1,-50..200,20..48&display=swap' },
      ],
    },
  },

  modules: [
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    '@nuxtjs/supabase',
    '@nuxtjs/tailwindcss',
    '@sentry/nuxt/module'
  ],

  // Supabase Configuration
  supabase: {
    redirect: false, // We handle auth redirects manually in middleware
  },

  // Sentry Configuration
  sentry: {
    sourceMapsUploadOptions: {
      enabled: false // Disable for local dev by default
    }
  },

  // Tailwind Configuration
  tailwindcss: {
    cssPath: '~/assets/styles/global.css',
    configPath: 'tailwind.config.js'
  },

  // Runtime config for public environment variables
  runtimeConfig: {
    public: {
      // Add other public variables here if needed
    },
    private: {
      supabaseServiceRole: process.env.SUPABASE_SERVICE_ROLE || ''
    }
  },

  // Future-proofing for Go backend
  nitro: {
    devProxy: {
      // '/api': 'http://localhost:8080' // Example for Step 2
    }
  }
})
