import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/',
      component: () => import('@/components/layout/LayoutWrapper.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/DashboardView.vue'),
        },
        {
          path: 'history',
          name: 'history',
          component: () => import('@/views/HistoryView.vue'),
        },

        {
          path: 'bulletin',
          name: 'bulletin',
          component: () => import('@/views/BulletinView.vue'),
        },
        {
          path: 'tracker',
          name: 'tracker',
          component: () => import('@/views/TrackerView.vue'),
        },
        {
          path: 'transactions',
          name: 'transactions',
          component: () => import('@/views/ManageTransactionsView.vue'),
          meta: { roles: ['Super Admin'] }
        },
        {
          path: 'correction',
          name: 'correction',
          component: () => import('@/views/ManageTransactionsView.vue'),
          meta: { roles: ['Super Admin'] }
        },
        {
          path: 'cms',
          name: 'cms',
          component: () => import('@/views/BulletinView.vue'),
          meta: { roles: ['Super Admin', 'Admin'] }
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/views/DashboardView.vue'), // Placeholder
        },
      ],
    },
  ],
})

// Navigation guard — redirect to login if not authenticated and check roles
router.beforeEach((to, from, next) => {
  const session = JSON.parse(sessionStorage.getItem('dw_session') || 'null')
  
  if (to.meta.requiresAuth && !session) {
    return next({ name: 'login' })
  }
  
  if (to.meta.roles && session) {
    if (!to.meta.roles.includes(session.role)) {
      return next({ name: 'dashboard' }) // Redirect unauthorized users to dashboard
    }
  }
  
  next()
})

export default router
