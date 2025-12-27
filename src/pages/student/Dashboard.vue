<script setup>
import { ref, computed, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import { authStore } from '../../store/auth';
import { useStudentProfile } from '../../composables/useStudentProfile';
import { useClassDetails } from '../../composables/useClassDetails';
import { courseAPI } from '../../services/api';
import LoadingBar from '../../components/ui/LoadingBar.vue';
import IconChart from '~icons/solar/round-graph-bold';
import IconBook from '~icons/solar/book-bookmark-bold';
import IconUser from '~icons/solar/user-bold';
import IconClock from '~icons/basil/clock-solid';
import IconArrowRight from '~icons/basil/arrow-right-solid';
import IconBookSolid from '~icons/basil/book-solid';
import IconCalendar from '~icons/basil/calendar-outline';
import { formatDate } from '../../utils/formatters';

const router = useRouter();
const { studentProfile, isLoading } = useStudentProfile();

// Fetch class details (level and lecturer info)
const classId = computed(() => studentProfile.value?.classid);
const { classInfo, levelName, lecturerName, isLoading: classLoading } = useClassDetails(classId);

const user = computed(() => ({
  name: studentProfile.value?.nama_lengkap || studentProfile.value?.fullname || authStore.user?.username || authStore.user?.email?.split('@')[0] || 'Student',
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
const courses = ref([]);
const coursesLoading = ref(false);
const coursesError = ref(null);

/** Format time from 24h to 12h format */
const formatTime = (time) => {
  if (!time) return '';
  
  try {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  } catch {
    return time;
  }
};

/** Day name to number mapping (Sunday = 0) */
const dayToNumber = {
  'Sunday': 0,
  'Monday': 1,
  'Tuesday': 2,
  'Wednesday': 3,
  'Thursday': 4,
  'Friday': 5,
  'Saturday': 6
};

/** Get the next upcoming schedule based on current day */
const formattedSchedule = computed(() => {
  if (!classInfo.value) return 'Schedule not set';
  
  const schedule1 = classInfo.value.schedule_day;
  const time1 = classInfo.value.schedule_time;
  const schedule2 = classInfo.value.schedule_day_2;
  const time2 = classInfo.value.schedule_time_2;
  
  // If no schedules exist
  if (!schedule1 && !schedule2) return 'Schedule not set';
  
  // If only one schedule exists, show it
  if (!schedule2 || !time2) {
    if (schedule1 && time1) {
      return `${schedule1}, ${formatTime(time1)}`;
    }
    return 'Schedule not set';
  }
  
  if (!schedule1 || !time1) {
    return `${schedule2}, ${formatTime(time2)}`;
  }
  
  // Both schedules exist - find the next upcoming one
  const today = new Date().getDay(); // 0 = Sunday, 6 = Saturday
  const day1Num = dayToNumber[schedule1];
  const day2Num = dayToNumber[schedule2];
  
  // Calculate days until each schedule (0 = today, 7 = same day next week)
  const daysUntil1 = (day1Num - today + 7) % 7 || 7; // If today, show as 7 days (next week)
  const daysUntil2 = (day2Num - today + 7) % 7 || 7;
  
  // Show the schedule that comes sooner
  if (daysUntil1 <= daysUntil2) {
    return `${schedule1}, ${formatTime(time1)}`;
  } else {
    return `${schedule2}, ${formatTime(time2)}`;
  }
});

/** Default placeholder images */
const placeholderImages = [
  'https://semilir.co/wp-content/uploads/2023/01/buku-buku.jpg',
  'https://www.pertuni.or.id/wp-content/uploads/2021/01/books-690219_1920.jpg',
  'https://ichef.bbci.co.uk/ace/ws/640/amz/worldservice/live/assets/images/2016/03/26/160326125304_libreria_bookstore_1_640x360_iwanbaan_nocredit.jpg.webp'
];

const getPlaceholderImage = (index) => placeholderImages[index % placeholderImages.length];

/** Get course status based on upload date */
const getCourseStatus = (course) => {
  const daysSinceUpload = Math.floor(
    (new Date() - new Date(course.upload_date)) / (1000 * 60 * 60 * 24)
  );
  
  if (daysSinceUpload <= 7) return 'new';
  if (daysSinceUpload <= 30) return 'recent';
  return 'older';
};

/** Get status text for display */
const getCourseStatusText = (course) => {
  const status = getCourseStatus(course);
  return {
    new: 'New',
    recent: 'Recent',
    older: 'Older'
  }[status];
};

/** Get status badge classes */
const getStatusBadgeClass = (course) => {
  const status = getCourseStatus(course);
  return {
    'bg-green-500': status === 'new',
    'bg-blue-500': status === 'recent',
    'bg-gray-500': status === 'older'
  };
};

/** Dashboard courses (limited to 3, sorted by newest) */
const dashboardCourses = computed(() => {
  return [...courses.value]
    .sort((a, b) => new Date(b.upload_date) - new Date(a.upload_date))
    .slice(0, 3);
});

const fetchCourses = async () => {
  if (!studentProfile.value?.classid) return;
  
  coursesLoading.value = true;
  coursesError.value = null;
  
  try {
    const response = await courseAPI.getAllCourses();
    
    if (response.data.success) {
      // Filter by classid and sort by upload_date (newest first)
      const filtered = response.data.data
        .filter(course => course.classid === studentProfile.value.classid)
        .sort((a, b) => {
          const dateA = new Date(a.upload_date).getTime();
          const dateB = new Date(b.upload_date).getTime();
          
          if (dateB !== dateA) {
            return dateB - dateA;
          }
          
          return (b.courseid || 0) - (a.courseid || 0);
        });
      
      courses.value = filtered;
    }
  } catch (error) {
    coursesError.value = 'Failed to load courses';
    console.error('Failed to fetch courses:', error);
  } finally {
    coursesLoading.value = false;
  }
};

// Auto-fetch courses when profile loads
watchEffect(() => {
  if (!isLoading.value && studentProfile.value) {
    fetchCourses();
  }
});
</script>

<template>
  <!-- Welcome Section with Illustration -->
  <div class="relative bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 rounded-2xl p-6 md:p-8 mb-8 shadow-lg overflow-hidden">
    <!-- Decorative Background Elements -->
    <div class="absolute top-0 right-0 w-1/2 h-full pointer-events-none overflow-hidden">
      <div class="absolute -top-10 -right-10 w-40 h-48 bg-blue-400/30 rounded-lg transform rotate-12"></div>
      <div class="absolute top-20 -right-5 w-32 h-40 bg-blue-300/40 rounded-lg transform rotate-12"></div>
      <div class="absolute top-40 right-10 w-28 h-36 bg-white/20 rounded-lg transform rotate-12"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10">
      <p class="text-white/80 text-sm mb-1">{{ greeting }},</p>
      <h1 class="text-2xl md:text-3xl font-bold text-white mb-2">{{ user.name }}</h1>
      <p class="text-white/70 text-sm md:text-base max-w-md">
        Welcome back! Continue your learning journey and explore your course materials.
      </p>
    </div>
  </div>

  <!-- Quick Stats Cards -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    <!-- Level -->
    <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div class="flex items-start justify-between mb-3">
        <div class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
          <IconChart class="w-5 h-5 text-blue-600" />
        </div>
      </div>
      <p class="text-sm text-gray-500 mb-1">Level</p>
      <p class="text-lg font-semibold text-gray-900 line-clamp-1">{{ classLoading ? 'Loading...' : (levelName || '-') }}</p>
    </div>

    <!-- Courses -->
    <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div class="flex items-start justify-between mb-3">
        <div class="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
          <IconBook class="w-5 h-5 text-indigo-600" />
        </div>
      </div>
      <p class="text-sm text-gray-500 mb-1">Courses</p>
      <p class="text-lg font-semibold text-gray-900">{{ coursesLoading ? 'Loading...' : courses.length }}</p>
    </div>

    <!-- Lecturer -->
    <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div class="flex items-start justify-between mb-3">
        <div class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
          <IconUser class="w-5 h-5 text-blue-600" />
        </div>
      </div>
      <p class="text-sm text-gray-500 mb-1">Instructor</p>
      <p class="text-lg font-semibold text-gray-900 line-clamp-1">{{ classLoading ? 'Loading...' : (lecturerName || '-') }}</p>
    </div>

    <!-- Schedule -->
    <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div class="flex items-start justify-between mb-3">
        <div class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
          <IconClock class="w-5 h-5 text-blue-600" />
        </div>
      </div>
      <p class="text-sm text-gray-500 mb-1">Next Class</p>
      <p class="text-lg font-semibold text-gray-900 line-clamp-1">{{ classLoading ? 'Loading...' : formattedSchedule }}</p>
    </div>
  </div>

  <!-- My Courses Section -->
  <section class="mb-8">
    <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 md:p-8 border border-blue-100 shadow-sm">
      <!-- Section Header with View All -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">My Courses</h2>
          <p class="text-sm text-gray-500 mt-1">{{ courses.length }} course materials available</p>
        </div>
        <router-link to="/student/courses" class="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
          View All
          <IconArrowRight class="w-4 h-4" />
        </router-link>
      </div>

      <!-- Loading State -->
      <div v-if="coursesLoading" class="max-w-2xl mx-auto py-12">
        <LoadingBar :loading="true" color="blue" :duration="2000" />
        <p class="text-center text-gray-600 mt-4">Loading courses...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="coursesError" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p class="text-red-800 mb-4">{{ coursesError }}</p>
        <button 
          @click="fetchCourses"
          class="px-6 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="dashboardCourses.length === 0" class="text-center py-12">
        <IconBookSolid class="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p class="text-gray-500">No course materials available yet.</p>
      </div>

      <!-- Course Cards - Hybrid Layout -->
      <div v-else class="space-y-4">
        <!-- Hero card for latest course -->
        <article class="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all">
          <div class="flex flex-col md:flex-row">
            <div class="md:w-1/3 h-48 md:h-auto relative">
              <img 
                :src="getPlaceholderImage(0)" 
                :alt="dashboardCourses[0].title" 
                class="w-full h-full object-cover" 
              />
              <span 
                :class="getStatusBadgeClass(dashboardCourses[0])"
                class="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-white text-xs font-medium"
              >
                {{ getCourseStatusText(dashboardCourses[0]) }}
              </span>
            </div>
            
            <div class="p-6 md:w-2/3 flex flex-col justify-between">
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-xs font-medium px-2 py-1 rounded-full bg-white/20 text-white">Latest</span>
                  <span class="text-xs text-white/70 flex items-center gap-1">
                    <IconCalendar class="w-3.5 h-3.5" />
                    {{ formatDate(dashboardCourses[0].upload_date) }}
                  </span>
                </div>
                <h3 class="text-xl md:text-2xl font-bold text-white mb-2">{{ dashboardCourses[0].title }}</h3>
                <p class="text-white/80 text-sm md:text-base">Access your latest course materials and continue your learning journey.</p>
              </div>
              
              <div class="mt-4 md:mt-6">
                <router-link 
                  :to="{ name: 'StudentCourseDetail', params: { id: dashboardCourses[0].courseid } }" 
                  class="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 font-semibold rounded-full hover:bg-blue-50 transition-colors"
                >
                  Open Course
                  <IconArrowRight class="w-4 h-4" />
                </router-link>
              </div>
            </div>
          </div>
        </article>

        <!-- Compact list cards for remaining courses -->
        <div 
          v-for="(course, index) in dashboardCourses.slice(1)" 
          :key="course.courseid" 
          class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all"
        >
          <router-link :to="{ name: 'StudentCourseDetail', params: { id: course.courseid } }" class="flex items-center gap-4">
            <div class="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100 relative">
              <img :src="getPlaceholderImage(index + 1)" :alt="course.title" class="w-full h-full object-cover" />
              <span 
                :class="getStatusBadgeClass(course)"
                class="absolute top-1 left-1 z-10 px-1.5 py-0.5 rounded-full text-white text-[10px] font-medium"
              >
                {{ getCourseStatusText(course) }}
              </span>
            </div>
            
            <div class="flex-1 min-w-0">
              <h4 class="text-base font-semibold text-gray-900 mb-1 line-clamp-1">{{ course.title }}</h4>
              <p class="text-sm text-gray-500 flex items-center gap-2">
                <IconCalendar class="w-4 h-4" />
                {{ formatDate(course.upload_date) }}
              </p>
            </div>
            
            <div class="flex-shrink-0">
              <IconArrowRight class="w-5 h-5 text-gray-400" />
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </section>
</template>
