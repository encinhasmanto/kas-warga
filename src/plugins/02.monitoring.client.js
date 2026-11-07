import * as Sentry from '@sentry/vue'
import { systemService } from '@/services/systemService'

export default defineNuxtPlugin((nuxtApp) => {
  Sentry.init({
    app: nuxtApp.vueApp,
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration({ router: useRouter() }),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  })

  // Pemantauan kesehatan sistem
  systemService.startHeartbeat()
})
