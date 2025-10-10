import { createRouter, createWebHistory } from 'vue-router';
import { authStore } from '../store/auth'; // <-- Impor auth store
import Home from '../pages/Home.vue';
import Login from '../pages/Login.vue';
// student pages
import StudentLayout from '../pages/student/StudentLayout.vue';
import Dashboard from '../pages/student/Dashboard.vue';
import Profile from '../pages/student/Profile.vue';
import ProfileView from '../pages/student/ProfileView.vue';
import MyCourses from '../pages/student/MyCourses.vue';
// lecturer pages
import LecturerLayout from '../pages/lecturer/LecturerLayout.vue';
import LecturerDashboard from '../pages/lecturer/DashboardLecturer.vue';
import ProfileViewLecturer from '../pages/lecturer/ProfileViewLecturer.vue';
import ProfileLecturer from '../pages/lecturer/ProfileLecturer.vue';
import ManageMaterials from '../pages/lecturer/ManageMaterials.vue';
import ManageStudents from '../pages/lecturer/ManageStudents.vue';
// admin pages
import AdminLayout from '../pages/admin/AdminLayout.vue';
import DashboardAdmin from '../pages/admin/DashboardAdmin.vue';
import ManageLecturers from '../pages/admin/ManageLecturers.vue';
import ManageClasses from '../pages/admin/ManageClasses.vue';
import ManagePrices from '../pages/admin/ManagePrices.vue';

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
      {
        path: 'courses',
        name: 'StudentMyCourses',
        component: MyCourses,
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
        path: 'materials',
        name: 'LecturerMaterials',
        component: ManageMaterials,
      },
      {
        path: 'students',
        name: 'LecturerStudents',
        component: ManageStudents,
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

  // Admin routes (owner, admin, moderator)
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, roles: ['owner', 'admin', 'moderator'] },
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
        path: 'lecturers',
        name: 'AdminManageLecturers',
        component: ManageLecturers,
      },
      {
        path: 'classes',
        name: 'AdminManageClasses',
        component: ManageClasses,
      },
      {
        path: 'prices',
        name: 'AdminManagePrices',
        component: ManagePrices,
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
 * Get default dashboard route based on user role.
 * @param {string} role - User role
 * @returns {string} Route name
 */
const getDefaultDashboard = (role) => {
  const dashboards = {
    owner: 'AdminDashboard',
    admin: 'AdminDashboard',
    moderator: 'AdminDashboard',
    lecturer: 'LecturerDashboard',
    student: 'StudentDashboard'
  };
  return dashboards[role] || 'StudentDashboard';
};

// Navigation Guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = authStore.isAuthenticated();
  const userRole = authStore.role;

  console.log('Router guard check:', {
    to: to.path,
    requiresAuth: to.meta.requiresAuth,
    isAuthenticated,
    userRole
  });

  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      return next({ name: 'Login' });
    }

    // Check role-based access (single role or multiple roles)
    if (to.meta.role && to.meta.role !== userRole) {
      return next({ name: getDefaultDashboard(userRole) });
    }
    
    if (to.meta.roles && !to.meta.roles.includes(userRole)) {
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
