<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { authStore } from '../../store/auth';
import { useLecturerProfile } from '../../composables/useLecturerProfile';

const router = useRouter();
const { lecturerProfile, isLoading, errorMessage, fetchLecturerProfile } = useLecturerProfile();

const user = computed(() => ({
  name: lecturerProfile.value?.nama_lengkap || authStore.user?.email?.split('@')[0] || 'Lecturer',
}));

// Function to get time-based greeting
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return 'Good Morning';
  } else if (hour >= 12 && hour < 17) {
    return 'Good Afternoon';
  } else if (hour >= 17 && hour < 21) {
    return 'Good Evening';
  } else {
    return 'Good Night';
  }
};

const greeting = ref(getGreeting());

// Dynamic stats that could be fetched from API later
const stats = computed(() => [
  { title: 'Active Classes', value: '3' },
  { title: 'Next Session', value: 'Wed 02:00 PM' },
  { title: 'Total Students', value: '24 students' }
]);

// Lecturer classes data - this should be fetched from database later
const myClasses = ref([
  {
    title: 'Advanced Grammar',
    description: 'Advanced grammar concepts, complex sentence structures, and writing techniques for intermediate students.',
    nextSession: 'Wed, Sep 3, 02:00 PM',
    studentsCount: 12,
    status: 'active'
  },
  {
    title: 'Business English',
    description: 'Professional communication, presentations, email writing, and workplace vocabulary.',
    nextSession: 'Thu, Sep 4, 04:30 PM',
    studentsCount: 8,
    status: 'active'
  },
  {
    title: 'IELTS Speaking',
    description: 'IELTS speaking test preparation with mock interviews and speaking strategies.',
    nextSession: 'Fri, Sep 5, 06:00 PM',
    studentsCount: 4,
    status: 'active'
  },
  {
    title: 'Conversation Practice',
    description: 'Interactive speaking sessions focusing on fluency and confidence building.',
    nextSession: 'Mon, Sep 8, 03:00 PM',
    studentsCount: 6,
    status: 'scheduled'
  }
]);

const handleLogout = () => {
  authStore.clearAuth();
  router.push('/login');
};

// Handle loading state and error display
const showError = computed(() => !isLoading.value && errorMessage.value);

onMounted(() => {
  // Ensure we have authentication and role check
  if (!authStore.isAuthenticated() || authStore.role !== 'lecturer') {
    router.push('/login');
    return;
  }
  
  // If lecturer profile is not loaded, try to fetch it
  if (!lecturerProfile.value && authStore.role === 'lecturer') {
    fetchLecturerProfile();
  }
});
</script>

<template>
  <!-- Loading State -->
  <div v-if="isLoading" class="flex items-center justify-center min-h-[200px]">
    <div class="text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p class="text-gray-600">Loading your dashboard...</p>
    </div>
  </div>

  <!-- Error State -->
  <div v-else-if="showError" class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
    <div class="flex items-center">
      <svg class="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
      </svg>
      <p class="text-red-700">{{ errorMessage }}</p>
    </div>
  </div>

  <!-- Main Dashboard Content -->
  <div v-else>
    <!-- Welcome Section -->
    <div class="flex flex-col lg:flex-row gap-4 mb-8">
      <!-- Welcome card -->
      <div class="flex-1 bg-gradient-to-r from-blue-50 to-indigo-100 rounded-2xl p-8 shadow-sm">
        <h1 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{{ greeting }},</h1>
        <h2 class="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent leading-tight lg:leading-[1.1] pb-1 mb-4">{{ user.name }}</h2>
        <p class="text-gray-600 flex items-center text-lg">
          Ready to inspire and educate your students today
        </p>
      </div>

      <!-- Right quick stats -->
      <div class="w-full lg:w-[420px] shrink-0">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
          <!-- Left blue column wrapper -->
          <div class="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-2xl p-4 shadow-sm h-full flex flex-col gap-3">
            <div
              v-for="stat in stats.filter(s => s.title === 'Active Classes' || s.title === 'Total Students')"
              :key="stat.title"
              class="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow transition-all duration-200 min-h-24 flex items-center gap-4"
            >
              <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path v-if="stat.title === 'Active Classes'" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  <path v-else-if="stat.title === 'Next Session'" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
                  <path v-else d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"></path>
                </svg>
              </div>
              <div class="flex-1 text-left">
                <p class="text-sm font-medium text-gray-500 mb-1">{{ stat.title }}</p>
                <p class="text-base font-bold text-gray-900">{{ stat.value }}</p>
              </div>
            </div>
          </div>

          <!-- Right quick stats -->
          <div class="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-2xl p-4 shadow-sm h-full flex flex-col gap-3">
            <div
              v-for="stat in stats.filter(s => s.title === 'Next Session')"
              :key="stat.title"
              class="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow transition-all duration-200 min-h-24 flex items-center gap-4"
            >
              <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path v-if="stat.title === 'Active Classes'" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  <path v-else-if="stat.title === 'Next Session'" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
                  <path v-else d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"></path>
                </svg>
              </div>
              <div class="flex-1 text-left">
                <p class="text-sm font-medium text-gray-500 mb-1">{{ stat.title }}</p>
                <div class="leading-tight">
                  <span class="block text-lg font-semibold text-gray-900">{{ stat.value.split(' ')[0] }}</span>
                  <span class="block text-xl font-bold text-gray-900">{{ stat.value.split(' ').slice(1).join(' ') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Classes and Recent Activity Section -->
    <section class="mt-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- My Classes Section -->
        <div class="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-2xl p-6 shadow-sm">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-xl font-bold text-gray-900">My Classes</h2>
              <p class="text-sm text-gray-500 mt-1">Manage your ongoing classes</p>
            </div>
            <button class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-300 transition-colors">
              <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"></path>
              </svg>
              Add Class
            </button>
          </div>

          <div class="space-y-3">
            <div v-for="cls in myClasses" :key="cls.title" class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <h3 class="text-sm font-semibold text-gray-900 truncate">{{ cls.title }}</h3>
                      <span :class="[
                        'text-xs px-2 py-1 rounded-full',
                        cls.status === 'active' ? 'text-green-600 bg-green-50' : 'text-yellow-600 bg-yellow-50'
                      ]">
                        {{ cls.status }}
                      </span>
                    </div>
                    <p class="text-xs text-gray-600 mb-2 line-clamp-1">{{ cls.description }}</p>
                    <div class="flex items-center justify-between">
                      <span class="text-xs text-gray-500">{{ cls.nextSession }}</span>
                      <span class="text-xs text-blue-600 font-medium">{{ cls.studentsCount }} students</span>
                    </div>
                  </div>
                </div>
                <button class="ml-3 inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg focus:ring-2 focus:ring-blue-300 transition-colors flex-shrink-0">
                  Manage
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity Section -->
        <div class="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-2xl p-6 shadow-sm">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-xl font-bold text-gray-900">Recent Activity</h2>
              <p class="text-sm text-gray-500 mt-1">Latest updates from your classes</p>
            </div>
            <button class="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
          </div>

          <div class="space-y-4">
            <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900">Assignment submitted</p>
                  <p class="text-xs text-gray-500 mt-1">John Doe submitted "Grammar Exercise 5"</p>
                  <p class="text-xs text-gray-400 mt-1">2 hours ago</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z"></path>
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900">New student enrolled</p>
                  <p class="text-xs text-gray-500 mt-1">Sarah Johnson joined "Business English"</p>
                  <p class="text-xs text-gray-400 mt-1">4 hours ago</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg class="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900">Upcoming class reminder</p>
                  <p class="text-xs text-gray-500 mt-1">Advanced Grammar class starts in 30 minutes</p>
                  <p class="text-xs text-gray-400 mt-1">Now</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg class="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900">Class feedback received</p>
                  <p class="text-xs text-gray-500 mt-1">Mike Chen rated "IELTS Speaking" - 5 stars</p>
                  <p class="text-xs text-gray-400 mt-1">1 day ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>