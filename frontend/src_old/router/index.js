import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/app',
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
          meta: { requiresAuth: true, role: 'admin' }
        },
        {
          path: 'units',
          name: 'manage-units',
          component: () => import('@/views/ManageUnitsView.vue'),
          meta: { requiresAuth: true, role: 'admin' }
        },
        {
          path: 'audit-logs',
          name: 'audit-logs',
          component: () => import('@/views/AuditLogsView.vue'),
          meta: { requiresAuth: true, role: 'super_admin' }
        },
        {
          path: 'correction',
          name: 'correction',
          component: () => import('@/views/CorrectionView.vue'),
          meta: { requiresAuth: true, requiresSuperAdmin: true }
        },
        {
          path: 'bulletin',
          name: 'bulletin',
          component: () => import('@/views/BulletinView.vue'),
          meta: { roles: ['Super Admin', 'Admin'] }
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/views/SystemView.vue'),
        },
        {
          path: 'special-events',
          name: 'special-events',
          component: () => import('@/views/SpecialEventsView.vue'),
          meta: { requiresSuperAdmin: true }
        },
      ],
    },
    // Catch-all: redirect unknown paths to login
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

// Navigation guard — redirect to login if not authenticated and check roles
router.beforeEach((to, from) => {
  const { isLoggedIn, isAdmin, isSuperAdmin } = useAuth();

  // 1. Check if the route requires authentication
  if (to.meta.requiresAuth && !isLoggedIn.value) {
    return { name: 'login' }; // Simply return the destination
  }

  // 2. Check for Admin-only routes
  if (to.meta.requiresAdmin && !isAdmin.value) {
    return { name: 'dashboard' }; // Redirect unauthorized residents back to dashboard
  }

  // 3. Check for Super Admin-only routes
  if (to.meta.requiresSuperAdmin && !isSuperAdmin.value) {
    return { name: 'dashboard' };
  }

  // If we reach here, navigation is allowed automatically!
});

export default router
