/**
 * Auth middleware — protects routes that require authentication.
 * Mirrors the logic from the old router.beforeEach guard.
 */
import { authStore } from '~/store/auth';

export default defineNuxtRouteMiddleware((to) => {
  const isAuthenticated = authStore.isAuthenticated();
  const userRole = authStore.role;

  // Role → dashboard mapping
  const dashboards = {
    siswa: '/student/dashboard',
    dosen: '/lecturer/dashboard',
    admin: '/admin/dashboard',
  };
  const getDefaultDashboard = (role) => dashboards[role] || '/student/dashboard';

  // If the page requires auth and user is NOT authenticated → redirect to login
  if (to.meta.requiresAuth && !isAuthenticated) {
    return navigateTo('/login');
  }

  // If authenticated but wrong role → redirect to their own dashboard
  if (to.meta.requiresAuth && to.meta.role && to.meta.role !== userRole) {
    return navigateTo(getDefaultDashboard(userRole));
  }
  if (to.meta.requiresAuth && to.meta.roles && !to.meta.roles.includes(userRole)) {
    return navigateTo(getDefaultDashboard(userRole));
  }

  // Redirect authenticated users away from public pages (login/home)
  if (isAuthenticated && (to.path === '/login' || to.path === '/')) {
    return navigateTo(getDefaultDashboard(userRole));
  }
});
