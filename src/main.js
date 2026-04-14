import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import * as Sentry from "@sentry/vue"
import { systemService } from './services/systemService'
import App from './App.vue'
import router from './router'
import './assets/styles/global.css'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// --- Sentry Initialization (Monitoring) ---
Sentry.init({
  app,
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration({ router }),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

app.use(pinia)
app.use(router)

// Start System Health Monitoring
systemService.startHeartbeat()

app.mount('#app')
