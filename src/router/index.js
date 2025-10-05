import { createRouter, createWebHistory } from 'vue-router';
import { authStore } from '../store/auth'; // <-- Impor auth store
import Home from '../pages/Home.vue';
import Login from '../pages/Login.vue';
// student pages
import StudentLayout from '../pages/student/StudentLayout.vue';
import Dashboard from '../pages/student/Dashboard.vue';
import Profile from '../pages/student/Profile.vue';
import ProfileView from '../pages/student/ProfileView.vue';
// lecturer pages
import LecturerLayout from '../pages/lecturer/LecturerLayout.vue';
import LecturerDashboard from '../pages/lecturer/DashboardLecturer.vue';
import ProfileViewLecturer from '../pages/lecturer/ProfileViewLecturer.vue';
import ProfileLecturer from '../pages/lecturer/ProfileLecturer.vue';
// admin pages
import AdminLayout from '../pages/admin/AdminLayout.vue';
import DashboardAdmin from '../pages/admin/DashboardAdmin.vue';
import ManageLecturers from '../pages/admin/ManageLecturers.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  // Student routes with nested layout
  {
    path: '/student',
    component: StudentLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'StudentDashboard',
        component: Dashboard,
      },
      {
        path: 'profile',
        name: 'StudentProfile',
        component: Profile,
      },
      {
        path: 'profile-view',
        name: 'StudentProfileView',
        component: ProfileView,
      },
      // Default child route for /student
      {
        path: '',
        redirect: { name: 'StudentDashboard' }
      }
    ]
  },

  {
    path: '/lecturer',
    component: LecturerLayout,
    meta: { requiresAuth: true, role: 'lecturer' }, // Meta untuk otentikasi & peran
    children: [
      {
        path: 'dashboard',
        name: 'LecturerDashboard',
        component: LecturerDashboard,
      },
      {
        path: 'profile-view',
        name: 'LecturerProfileView',
        component: ProfileViewLecturer,
      },
      {
        path: 'profile',
        name: 'LecturerProfile',
        component: ProfileLecturer,
      },
      // Default child route for /lecturer
      {
        path: '',
        redirect: { name: 'LecturerDashboard' }
      }
    ]
  },

  // Admin routes
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, role: 'admin' }, // Kunci: hanya untuk peran 'admin'
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: DashboardAdmin,
      },
      {
        path: '',
        redirect: { name: 'AdminDashboard' }
      },
      {
        path: 'lecturers', // URL: /admin/lecturers
        name: 'AdminManageLecturers',
        component: ManageLecturers,
      },
    ]
  },

  // Legacy redirects for backward compatibility
  {
    path: '/dashboardstudent',
    redirect: '/student/dashboard'
  },
  {
    path: '/profile',
    redirect: '/student/profile'
  },
  {
    path: '/profile-view',
    redirect: '/student/profile-view'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

/**
 * Get default dashboard route for user role.
 * @param {string} role - User role
 * @returns {string} Route name
 */
const getDefaultDashboard = (role) => {
  const dashboards = {
    admin: 'AdminDashboard',
    lecturer: 'LecturerDashboard',
    student: 'StudentDashboard',
    authenticated: 'StudentDashboard' // OAuth users default to student
  };
  return dashboards[role] || 'StudentDashboard';
};

// Navigation Guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = authStore.isAuthenticated();
  const userRole = authStore.role || authStore.user?.role;

  console.log('Router guard check:', {
    to: to.path,
    from: from.path,
    requiresAuth: to.meta.requiresAuth,
    isAuthenticated,
    userRole,
    storeRole: authStore.role,
    tokenExpired: authStore.isTokenExpired(),
    currentTime: new Date().toLocaleString()
  });

  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      return next({ name: 'Login' });
    }

    // Check role-specific access
    if (to.meta.role && to.meta.role !== userRole) {
      return next({ name: getDefaultDashboard(userRole) });
    }
  }

  // Redirect authenticated users from public pages
  if (isAuthenticated && (to.name === 'Login' || to.name === 'Home')) {
    return next({ name: getDefaultDashboard(userRole) });
  }

  next();
});

export default router;
