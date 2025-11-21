import { createRouter, createWebHistory } from 'vue-router';
import { authStore } from '../store/auth';

/**
 * Lazy-loaded route components.
 * Grouped by role using webpackChunkName for optimal code splitting.
 */

// Public pages - loaded immediately for faster initial access
const Home = () => import('../pages/Home.vue');
const Login = () => import('../pages/Login.vue');
const GoogleCallback = () => import('../pages/GoogleCallback.vue');
const NewUser = () => import('../pages/NewUser.vue');

// Student pages - grouped in 'student' chunk
const StudentLayout = () => import(/* webpackChunkName: "student" */ '../pages/student/StudentLayout.vue');
const Dashboard = () => import(/* webpackChunkName: "student" */ '../pages/student/Dashboard.vue');
const Profile = () => import(/* webpackChunkName: "student" */ '../pages/student/Profile.vue');
const ProfileView = () => import(/* webpackChunkName: "student" */ '../pages/student/ProfileView.vue');
const MyCourses = () => import(/* webpackChunkName: "student" */ '../pages/student/MyCourses.vue');
const CourseDetail = () => import(/* webpackChunkName: "student" */ '../pages/student/CourseDetail.vue');
const Payment = () => import(/* webpackChunkName: "student" */ '../pages/student/Payment.vue');
const Grades = () => import(/* webpackChunkName: "student" */ '../pages/student/Grades.vue');

// Lecturer pages - grouped in 'lecturer' chunk
const LecturerLayout = () => import(/* webpackChunkName: "lecturer" */ '../pages/lecturer/LecturerLayout.vue');
const LecturerDashboard = () => import(/* webpackChunkName: "lecturer" */ '../pages/lecturer/DashboardLecturer.vue');
const ProfileViewLecturer = () => import(/* webpackChunkName: "lecturer" */ '../pages/lecturer/ProfileViewLecturer.vue');
const ProfileLecturer = () => import(/* webpackChunkName: "lecturer" */ '../pages/lecturer/ProfileLecturer.vue');
const ManageMaterials = () => import(/* webpackChunkName: "lecturer" */ '../pages/lecturer/ManageMaterials.vue');
const ManageStudents = () => import(/* webpackChunkName: "lecturer" */ '../pages/lecturer/ManageStudents.vue');
const StudentDetail = () => import(/* webpackChunkName: "lecturer" */ '../pages/lecturer/StudentDetail.vue');

// Admin pages - grouped in 'admin' chunk
const AdminLayout = () => import(/* webpackChunkName: "admin" */ '../pages/admin/AdminLayout.vue');
const DashboardAdmin = () => import(/* webpackChunkName: "admin" */ '../pages/admin/DashboardAdmin.vue');
const ManageLecturers = () => import(/* webpackChunkName: "admin" */ '../pages/admin/ManageLecturers.vue');
const ManageClasses = () => import(/* webpackChunkName: "admin" */ '../pages/admin/ManageClasses.vue');
const ManagePrices = () => import(/* webpackChunkName: "admin" */ '../pages/admin/ManagePrices.vue');
const AdminManageStudents = () => import(/* webpackChunkName: "admin" */ '../pages/admin/ManageStudents.vue');
const ManagePrograms = () => import(/* webpackChunkName: "admin" */ '../pages/admin/ManagePrograms.vue');
const ManageLevels = () => import(/* webpackChunkName: "admin" */ '../pages/admin/ManageLevels.vue');
const ManageTeacherLevels = () => import(/* webpackChunkName: "admin" */ '../pages/admin/ManageTeacherLevels.vue');
const ManageGrades = () => import(/* webpackChunkName: "admin" */ '../pages/admin/ManageGrades.vue');
const ManagePayments = () => import(/* webpackChunkName: "admin" */ '../pages/admin/ManagePayments.vue');

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
  {
    path: '/auth/callback',
    name: 'GoogleCallback',
    component: GoogleCallback,
  },
  {
    path: '/new-user',
    name: 'NewUser',
    component: NewUser,
    meta: { requiresAuth: true }
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
      {
        path: 'courses/:id',
        name: 'StudentCourseDetail',
        component: CourseDetail,
      },
      {
        path: 'grades',
        name: 'StudentGrades',
        component: Grades,
      },
      {
        path: 'payment',
        name: 'StudentPayment',
        component: Payment,
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
        path: 'student/:id',
        name: 'StudentDetail',
        component: StudentDetail,
      },
      {
        path: 'add-grade/:userid',
        name: 'AddGrade',
        component: () => import('../pages/lecturer/AddGrade.vue'),
      },
      {
        path: 'edit-grade/:userid/:gradeid',
        name: 'EditGrade',
        component: () => import('../pages/lecturer/EditGrade.vue'),
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
      {
        path: 'students',
        name: 'AdminManageStudents',
        component: AdminManageStudents,
      },
      {
        path: 'payments',
        name: 'AdminManagePayments',
        component: ManagePayments,
      },
      {
        path: 'programs',
        name: 'AdminManagePrograms',
        component: ManagePrograms,
      },
      {
        path: 'levels',
        name: 'AdminManageLevels',
        component: ManageLevels,
      },
      {
        path: 'teacher-levels',
        name: 'AdminManageTeacherLevels',
        component: ManageTeacherLevels,
      },
      {
        path: 'grades',
        name: 'AdminManageGrades',
        component: ManageGrades,
      }
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
 * Returns default dashboard route for a user role.
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

  // Allow access to NewUser page for authenticated users (bypass role checks)
  if (to.name === 'NewUser' && isAuthenticated) {
    return next();
  }

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

  // Redirect authenticated users from public pages (except NewUser)
  if (isAuthenticated && (to.name === 'Login' || to.name === 'Home')) {
    return next({ name: getDefaultDashboard(userRole) });
  }

  next();
});

export default router;
