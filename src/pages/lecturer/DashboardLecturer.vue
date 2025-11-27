<script setup>
import { ref, computed, onMounted, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import { authStore } from '../../store/auth';
import { useLecturerProfile } from '../../composables/useLecturerProfile';
import { classAPI, studentAPI, levelAPI } from '../../services/api';
import LoadingBar from '../../components/ui/LoadingBar.vue';
import IconCheckCircle from '~icons/solar/check-circle-bold';
import IconUsersGroup from '~icons/solar/users-group-rounded-bold';
import IconBook from '~icons/basil/book-solid';
import IconUpload from '~icons/solar/upload-bold';
import IconCalendar from '~icons/solar/calendar-bold';
import IconDocument from '~icons/solar/document-text-bold';
import IconArrowRight from '~icons/basil/arrow-right-solid';
import IconClock from '~icons/basil/clock-solid';

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

/** Format class schedule for display */
const formatSchedule = (cls) => {
  if (!cls) return null;
  
  const schedules = [];
  
  // Primary schedule
  if (cls.schedule_day && cls.schedule_time) {
    const day = cls.schedule_day.substring(0, 3); // Mon, Tue, etc.
    const time = cls.schedule_time.substring(0, 5); // HH:MM
    schedules.push(`${day} ${time}`);
  }
  
  // Secondary schedule
  if (cls.schedule_day_2 && cls.schedule_time_2) {
    const day = cls.schedule_day_2.substring(0, 3);
    const time = cls.schedule_time_2.substring(0, 5);
    schedules.push(`${day} ${time}`);
  }
  
  return schedules.length > 0 ? schedules.join(' & ') : null;
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

/** Navigate to manage students page */
const goToManageStudents = () => {
  router.push({ name: 'LecturerStudents' });
};

/** Quick action items */
const quickActions = computed(() => [
  {
    title: 'Input Nilai',
    description: 'Add student grades',
    icon: 'grade',
    color: 'from-blue-500 to-indigo-500',
    bgColor: 'from-blue-50 to-indigo-50',
    action: () => router.push({ name: 'LecturerStudents' })
  },
  {
    title: 'Upload Materi',
    description: 'Add course materials',
    icon: 'upload',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'from-purple-50 to-pink-50',
    action: () => router.push({ name: 'LecturerMaterials' })
  },
  {
    title: 'Lihat Jadwal',
    description: 'View class schedules',
    icon: 'schedule',
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'from-emerald-50 to-teal-50',
    action: () => {} // Will show schedules from classes
  }
]);

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
          <h1 class="text-lg md:text-2xl lg:text-2xl text-white/90 mb-2">
            {{ greeting }},
          </h1>
          <h2 class="text-2xl md:text-4xl lg:text-4xl font-bold text-white mb-6 leading-tight">
            {{ user.name }}
          </h2>
          <p class="text-white/80 text-sm md:text-base lg:text-2x1 leading-relaxed max-w-lg">
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

    <!-- New Grid Layout Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-[auto_auto] gap-6">
      
      <!-- Top-Left Large Card: Active Classes & Today's Schedule (Span 2 cols, 1 row) -->
      <div class="lg:col-span-2 lg:row-span-1 bg-white/60 backdrop-blur-sm border border-white/50 shadow-lg rounded-3xl p-6 hover:shadow-xl transition-all duration-300">
        <div class="flex items-start justify-between mb-6">
          <div>
            <p class="text-sm font-medium text-gray-500 mb-2">Active Classes</p>
            <p class="text-5xl font-bold text-gray-900 mb-2">{{ myClasses.length }}</p>
            <p class="text-sm text-gray-400">Total teaching assignments</p>
          </div>
          <div class="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
            <IconCheckCircle class="w-7 h-7 text-blue-600" />
          </div>
        </div>
        
        <!-- Today's Schedule Section -->
        <div class="mt-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-bold text-gray-900 flex items-center gap-2">
              <IconClock class="w-4 h-4 text-blue-600" />
              Today's Schedule
            </h3>
            <button 
              @click="goToMaterials"
              class="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full hover:from-blue-700 hover:to-indigo-700 hover:scale-105 active:scale-95 focus:ring-2 focus:ring-blue-300 transition-all shadow-md hover:shadow-lg"
            >
              View All
            </button>
          </div>

          <!-- No Classes -->
          <div v-if="myClasses.length === 0" class="text-center py-6 text-gray-500">
            <IconCalendar class="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p class="text-sm">No classes scheduled today</p>
          </div>

          <!-- Schedule Grid -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div 
              v-for="cls in myClasses.slice(0, 6)" 
              :key="cls.classid"
              class="bg-white/80 backdrop-blur-sm rounded-2xl p-3 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200"
            >
              <div class="flex items-start gap-2">
                <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <IconBook class="w-4 h-4 text-white" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-1 mb-1">
                    <h4 class="text-xs font-semibold text-gray-900 truncate">{{ cls.class_code }}</h4>
                    <span class="text-xs px-1.5 py-0.5 rounded-full text-blue-600 bg-blue-50">
                      {{ getLevelName(cls.levelid) }}
                    </span>
                  </div>
                  <div v-if="formatSchedule(cls)" class="flex items-center gap-1 mt-1">
                    <IconClock class="w-3 h-3 text-blue-600 flex-shrink-0" />
                    <span class="text-xs text-gray-700 font-medium">{{ formatSchedule(cls) }}</span>
                  </div>
                  <span class="text-xs text-gray-500 mt-0.5 block">{{ getStudentCount(cls.classid) }} students</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top-Right Tall Card: Quick Actions (Span 1 col, 2 rows) -->
      <div class="lg:col-span-1 lg:row-span-2 bg-white/60 backdrop-blur-sm border border-white/50 shadow-lg rounded-3xl p-6">
        <div class="mb-6">
          <h2 class="text-xl font-bold text-gray-900">Quick Actions</h2>
          <p class="text-sm text-gray-500 mt-1">Shortcuts to tasks</p>
        </div>

        <div class="space-y-4">
          <button
            v-for="action in quickActions"
            :key="action.title"
            @click="action.action"
            class="w-full group"
          >
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-200">
              <div class="flex items-center gap-4">
                <!-- Icon -->
                <div :class="`w-14 h-14 bg-gradient-to-r ${action.color} rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform duration-200`">
                  <!-- Grade Icon -->
                  <IconDocument v-if="action.icon === 'grade'" class="w-7 h-7 text-white" />
                  <!-- Upload Icon -->
                  <IconUpload v-else-if="action.icon === 'upload'" class="w-7 h-7 text-white" />
                  <!-- Schedule Icon -->
                  <IconCalendar v-else-if="action.icon === 'schedule'" class="w-7 h-7 text-white" />
                </div>

                <!-- Content -->
                <div class="flex-1 text-left">
                  <h3 class="text-base font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {{ action.title }}
                  </h3>
                  <p class="text-sm text-gray-500">{{ action.description }}</p>
                </div>

                <!-- Arrow Icon -->
                <IconArrowRight class="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0" />
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Bottom-Left Small Card 1: Total Students (Span 1 col, 1 row) -->
      <div class="lg:col-span-1 lg:row-span-1 bg-white/60 backdrop-blur-sm border border-white/50 shadow-lg rounded-3xl p-6 hover:shadow-xl transition-all duration-300">
        <div class="absolute top-4 right-4">
          <div class="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
            <IconUsersGroup class="w-6 h-6 text-purple-600" />
          </div>
        </div>
        <div class="text-center mt-6">
          <p class="text-sm font-medium text-gray-500 mb-2">Total Students</p>
          <p class="text-5xl font-bold text-gray-900 mb-1">{{ totalStudents }}</p>
          <p class="text-sm text-gray-400">students</p>
        </div>
      </div>

      <!-- Bottom-Left Small Card 2: Total Classes (Span 1 col, 1 row) -->
      <div class="lg:col-span-1 lg:row-span-1 bg-white/60 backdrop-blur-sm border border-white/50 shadow-lg rounded-3xl p-6 hover:shadow-xl transition-all duration-300">
        <div class="absolute top-4 right-4">
          <div class="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
            <IconBook class="w-6 h-6 text-emerald-600" />
          </div>
        </div>
        <div class="text-center mt-6">
          <p class="text-sm font-medium text-gray-500 mb-2">Total Classes</p>
          <p class="text-5xl font-bold text-gray-900 mb-1">{{ myClasses.length }}</p>
          <p class="text-sm text-gray-400">classes</p>
        </div>
      </div>

    </div>
  </div>
</template>