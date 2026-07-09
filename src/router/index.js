import { createRouter, createWebHistory } from 'vue-router';
import { authStore } from '../store/auth';
import { studentAPI } from '../services/api';

/**
 * Lazy-loaded route components.
 * Code splitting is handled by manualChunks in vite.config.js.
 */

// Public pages - loaded immediately for faster initial access
const Home = () => import('../pages/Home.vue');
const Login = () => import('../pages/Login.vue');
const GoogleCallback = () => import('../pages/GoogleCallback.vue');
const NewUser = () => import('../pages/NewUser.vue');
const NotFound = () => import('../pages/NotFound.vue');

// Student pages - grouped in 'student' chunk
const StudentLayout = () => import('../pages/student/StudentLayout.vue');
const Dashboard = () => import('../pages/student/Dashboard.vue');
const Profile = () => import('../pages/student/Profile.vue');
const ProfileView = () => import('../pages/student/ProfileView.vue');
const MyCourses = () => import('../pages/student/MyCourses.vue');
const CourseDetail = () => import('../pages/student/CourseDetail.vue');
const Payment = () => import('../pages/student/Payment.vue');
const Grades = () => import('../pages/student/Grades.vue');

// Lecturer pages - grouped in 'lecturer' chunk
const LecturerLayout = () => import('../pages/lecturer/LecturerLayout.vue');
const LecturerDashboard = () => import('../pages/lecturer/DashboardLecturer.vue');
const ProfileViewLecturer = () => import('../pages/lecturer/ProfileViewLecturer.vue');
const ProfileLecturer = () => import('../pages/lecturer/ProfileLecturer.vue');
const ManageMaterials = () => import('../pages/lecturer/ManageMaterials.vue');
const ManageStudents = () => import('../pages/lecturer/ManageStudents.vue');
const StudentDetail = () => import('../pages/lecturer/StudentDetail.vue');

// Admin pages - grouped in 'admin' chunk
const AdminLayout = () => import('../pages/admin/AdminLayout.vue');
const DashboardAdmin = () => import('../pages/admin/DashboardAdmin.vue');
const ManageLecturers = () => import('../pages/admin/ManageLecturers.vue');
const ManageClasses = () => import('../pages/admin/ManageClasses.vue');
const ManagePrices = () => import('../pages/admin/ManagePrices.vue');
const AdminManageStudents = () => import('../pages/admin/ManageStudents.vue');
const ManagePrograms = () => import('../pages/admin/ManagePrograms.vue');
const ManageLevels = () => import('../pages/admin/ManageLevels.vue');
const ManageGrades = () => import('../pages/admin/ManageGrades.vue');
const ManagePayments = () => import('../pages/admin/ManagePayments.vue');
const AdminStudentDetail = () => import('../pages/admin/StudentDetail.vue');

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
    meta: { requiresAuth: true, role: 'student' },
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
        path: 'students/:id',
        name: 'AdminStudentDetail',
        component: AdminStudentDetail,
      },
      {
        path: 'students/:userid/add-grade',
        name: 'AdminAddGrade',
        component: () => import('../pages/admin/EditGrade.vue'),
      },
      {
        path: 'students/:userid/grades/:gradeid/edit',
        name: 'AdminEditGrade',
        component: () => import('../pages/admin/EditGrade.vue'),
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
        path: 'grades',
        name: 'AdminManageGrades',
        component: ManageGrades,
      },
      {
        path: 'external-links',
        name: 'AdminExternalLinks',
        component: () => import('../pages/admin/ExternalLinks.vue'),
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
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
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
router.beforeEach(async (to, from, next) => {
  const isAuthenticated = authStore.isAuthenticated();
  const userRole = authStore.role;

  // Special handling for NewUser page - only allow users without complete profile
  if (to.name === 'NewUser') {
    if (!isAuthenticated) {
      return next({ name: 'Login' });
    }

    if (userRole !== 'student') {
      return next({ name: getDefaultDashboard(userRole) });
    }
    
    // Check if student profile is already complete (has phone and address)
    // If complete, redirect to dashboard (no need for NewUser page)
    try {
      const userId = authStore.user?.id;
      if (userId) {
        const response = await studentAPI.getStudentById(userId);
        if (response.data.success) {
          const studentData = Array.isArray(response.data.data)
            ? response.data.data[0]
            : response.data.data;
          // Profile is complete if phone AND address are present
          if (studentData?.phone && studentData?.address) {
            return next({ name: getDefaultDashboard(userRole) });
          }
        }
      }
    } catch (error) {
      console.error('Error checking student profile:', error);
      // On error, allow access (fail gracefully)
    }
    
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
