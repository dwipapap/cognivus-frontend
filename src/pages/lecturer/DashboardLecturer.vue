<script setup>
import { ref, computed, onMounted, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import { authStore } from '../../store/auth';
import { useLecturerProfile } from '../../composables/useLecturerProfile';
import { classAPI, studentAPI, levelAPI } from '../../services/api';
import LoadingBar from '../../components/ui/LoadingBar.vue';

const router = useRouter();
const { lecturerProfile, isLoading, errorMessage, fetchLecturerProfile } = useLecturerProfile();

const user = computed(() => ({
  name: lecturerProfile.value?.nama_lengkap || lecturerProfile.value?.fullname || authStore.user?.username || authStore.user?.email?.split('@')[0] || 'Lecturer',
}));

/** Get time-based greeting */
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good Morning';
  if (hour >= 12 && hour < 17) return 'Good Afternoon';
  if (hour >= 17 && hour < 21) return 'Good Evening';
  return 'Good Night';
};

const greeting = ref(getGreeting());

const myClasses = ref([]);
const allStudents = ref([]);
const levels = ref([]);
const dataLoading = ref(false);
const dataError = ref(null);

/** Calculate total students across all classes */
const totalStudents = computed(() => {
  if (myClasses.value.length === 0) return 0;
  const classIds = myClasses.value.map(c => c.classid);
  return allStudents.value.filter(s => classIds.includes(s.classid)).length;
});

/** Dynamic stats */
const stats = computed(() => [
  { title: 'Active Classes', value: myClasses.value.length.toString() },
  { title: 'Total Students', value: `${totalStudents.value} students` }
]);

/** Get level name by id */
const getLevelName = (levelid) => {
  const level = levels.value.find(l => l.levelid === levelid);
  return level?.name || '-';
};

/** Get student count for class */
const getStudentCount = (classid) => {
  return allStudents.value.filter(s => s.classid === classid).length;
};

/** Fetch lecturer's classes and related data */
const fetchDashboardData = async () => {
  if (!lecturerProfile.value?.lecturerid) return;

  try {
    dataLoading.value = true;
    dataError.value = null;
    const lecturerid = lecturerProfile.value.lecturerid;

    const [classesRes, studentsRes, levelsRes] = await Promise.all([
      classAPI.getAllClasses(),
      studentAPI.getAllStudents(),
      levelAPI.getAllLevels()
    ]);

    if (classesRes.data.success) {
      myClasses.value = classesRes.data.data.filter(c => c.lecturerid === lecturerid);
    }

    if (studentsRes.data.success) {
      allStudents.value = studentsRes.data.data;
    }

    if (levelsRes.data.success) {
      levels.value = levelsRes.data.data;
    }
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    dataError.value = error.message || 'Failed to load dashboard data';
  } finally {
    dataLoading.value = false;
  }
};

/** Navigate to materials page */
const goToMaterials = () => {
  router.push({ name: 'LecturerMaterials' });
};

const handleLogout = () => {
  authStore.clearAuth();
  router.push('/login');
};

const showError = computed(() => !isLoading.value && errorMessage.value);

/** Auto-fetch dashboard data when profile loads */
watchEffect(() => {
  if (!isLoading.value && lecturerProfile.value) {
    fetchDashboardData();
  }
});

onMounted(() => {
  if (!authStore.isAuthenticated() || authStore.role !== 'lecturer') {
    router.push('/login');
    return;
  }
  
  if (!lecturerProfile.value && authStore.role === 'lecturer') {
    fetchLecturerProfile();
  }
});
</script>

<template>
  <!-- Loading State -->
    <div v-if="isLoading || dataLoading" class="max-w-2xl mx-auto py-20">
    <LoadingBar :loading="true" color="blue" :duration="2000" />
  </div>

  <!-- Error State -->
  <div v-else-if="showError" class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
        </svg>
        <p class="text-red-700">{{ errorMessage }}</p>
      </div>
      <button 
        @click="fetchLecturerProfile"
        class="px-4 py-2 text-sm font-semibold text-red-700 hover:text-white bg-gradient-to-r from-red-50 to-rose-50 hover:from-red-600 hover:to-rose-600 border-2 border-red-200 hover:border-red-600 rounded-full transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
      >
        Retry
      </button>
    </div>
  </div>

  <!-- Dashboard Data Error -->
  <div v-else-if="dataError" class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
        </svg>
        <p class="text-red-700">{{ dataError }}</p>
      </div>
      <button 
        @click="fetchDashboardData"
        class="px-4 py-2 text-sm font-semibold text-red-700 hover:text-white bg-gradient-to-r from-red-50 to-rose-50 hover:from-red-600 hover:to-rose-600 border-2 border-red-200 hover:border-red-600 rounded-full transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
      >
        Retry
      </button>
    </div>
  </div>

  <!-- Main Dashboard Content -->
  <div v-else>
    <!-- Welcome Section -->
    <div class="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 rounded-3xl shadow-lg mb-8 overflow-hidden">
      <div class="flex flex-col lg:flex-row items-center">
        <!-- Left: Text Content -->
        <div class="flex-1 p-8 lg:p-12">
          <h1 class="text-2xl lg:text-3xl font-semibold text-white/90 mb-2">
            {{ greeting }},
          </h1>
          <h2 class="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {{ user.name }}
          </h2>
          <p class="text-white/80 text-base lg:text-lg leading-relaxed max-w-lg">
            Ready to inspire and educate your students today. Your dedication shapes their future success.
          </p>
        </div>

        <!-- Right: SVG Illustration -->
        <div class="w-full lg:w-1/2 p-8 lg:p-12 flex items-center justify-center">
          <svg class="w-auto max-w-[16rem] h-40 text-white" aria-hidden="true" width="609" height="495" viewBox="0 0 609 495" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M584.052 275.388C584.052 277.731 583.625 279.974 582.846 282.044C582.197 283.766 582.641 285.782 584.047 286.97C590.409 292.342 594.45 300.378 594.45 309.357C594.45 312.534 593.944 315.594 593.008 318.459C592.523 319.946 592.932 321.602 594.094 322.65C602.826 330.517 608.315 341.913 608.315 354.591C608.315 378.328 589.072 397.571 565.334 397.571C541.597 397.571 522.354 378.328 522.354 354.591C522.354 342.031 527.741 330.73 536.33 322.871C537.484 321.815 537.881 320.155 537.384 318.672C536.403 315.745 535.872 312.613 535.872 309.357C535.872 300.378 539.912 292.342 546.274 286.97C547.68 285.782 548.124 283.766 547.476 282.044C546.697 279.974 546.27 277.731 546.27 275.388C546.27 264.955 554.728 256.498 565.161 256.498C575.594 256.498 584.052 264.955 584.052 275.388Z" fill="#d6e2fb"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M564.987 274.215C565.54 274.215 565.987 274.663 565.987 275.215L565.987 441.245C565.987 441.798 565.54 442.245 564.987 442.245C564.435 442.245 563.987 441.798 563.987 441.245L563.987 275.215C563.987 274.663 564.435 274.215 564.987 274.215Z" fill="#9ab7f6"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M584.633 349.271C585.082 349.592 585.187 350.217 584.866 350.666L565.802 377.356C565.481 377.805 564.856 377.909 564.407 377.588C563.957 377.267 563.853 376.643 564.174 376.193L583.238 349.504C583.559 349.054 584.184 348.95 584.633 349.271Z" fill="#9ab7f6"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M545.343 308.023C544.893 308.344 544.789 308.969 545.11 309.418L564.174 336.108C564.495 336.557 565.12 336.661 565.569 336.34C566.018 336.019 566.122 335.395 565.801 334.945L546.737 308.256C546.416 307.806 545.792 307.702 545.343 308.023Z" fill="#9ab7f6"/>
            <path d="M147.659 6.00001C147.659 2.68631 150.345 0 153.659 0H466.787C470.101 0 472.787 2.68629 472.787 6V310.809C472.787 314.123 470.101 316.809 466.787 316.809H153.659C150.345 316.809 147.659 314.123 147.659 310.809V6.00001Z" fill="#d6e2fb"/>
            <path d="M220.103 153.086C220.103 151.429 221.446 150.086 223.103 150.086H397.691C399.347 150.086 400.691 151.429 400.691 153.086V175.508C400.691 177.165 399.347 178.508 397.691 178.508H223.103C221.446 178.508 220.103 177.165 220.103 175.508V153.086Z" fill="white"/>
            <path d="M355.284 78.162C355.284 102.952 335.187 123.049 310.397 123.049C285.606 123.049 265.51 102.952 265.51 78.162C265.51 53.3715 285.606 33.2749 310.397 33.2749C335.187 33.2749 355.284 53.3715 355.284 78.162Z" fill="white"/>
            <path d="M310.137 76.3858C313.906 76.3858 316.961 73.3305 316.961 69.5617C316.961 65.7929 313.906 62.7377 310.137 62.7377C306.368 62.7377 303.313 65.7929 303.313 69.5617C303.313 73.3305 306.368 76.3858 310.137 76.3858Z" fill="#d6e2fb"/>
            <path d="M306.237 82.2349H314.036C316.105 82.2349 318.088 83.0566 319.551 84.5192C321.014 85.9818 321.835 87.9655 321.835 90.0338V93.9333H298.438V90.0338C298.438 87.9655 299.26 85.9818 300.723 84.5192C302.185 83.0566 304.169 82.2349 306.237 82.2349Z" fill="#d6e2fb"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- Quick Stats Section -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
      <div
        v-for="stat in stats"
        :key="stat.title"
        class="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200"
      >
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path v-if="stat.title === 'Active Classes'" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              <path v-else d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"></path>
            </svg>
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-600 mb-1">{{ stat.title }}</p>
            <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
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
              <p class="text-sm text-gray-500 mt-1">Your teaching assignments</p>
            </div>
            <button 
              @click="goToMaterials"
              class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full hover:from-blue-700 hover:to-indigo-700 hover:scale-105 active:scale-95 focus:ring-2 focus:ring-blue-300 transition-all shadow-md hover:shadow-lg"
            >
              View All
            </button>
          </div>

          <!-- No Classes -->
          <div v-if="myClasses.length === 0" class="text-center py-12 text-gray-500">
            No classes assigned yet.
          </div>

          <!-- Classes List -->
          <div v-else class="space-y-3">
            <div 
              v-for="cls in myClasses" 
              :key="cls.classid" 
              class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"></path>
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <h3 class="text-sm font-semibold text-gray-900 truncate">{{ cls.class_code }}</h3>
                      <span class="text-xs px-2 py-1 rounded-full text-blue-600 bg-blue-50">
                        {{ getLevelName(cls.levelid) }}
                      </span>
                    </div>
                    <p class="text-xs text-gray-600 mb-2 line-clamp-1">{{ cls.description || 'No description' }}</p>
                    <span class="text-xs text-blue-600 font-medium">{{ getStudentCount(cls.classid) }} students</span>
                  </div>
                </div>
                <button 
                  @click="goToMaterials"
                  class="ml-3 inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-full focus:ring-2 focus:ring-blue-300 transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95 flex-shrink-0"
                >
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
          </div>

          <div class="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
            <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Coming Soon</h3>
            <p class="text-sm text-gray-500">
              Activity tracking will be available in a future update.
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>