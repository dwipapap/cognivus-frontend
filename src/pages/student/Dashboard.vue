<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { authStore } from '../../store/auth';
import { useStudentProfile } from '../../composables/useStudentProfile';
import { useClassDetails } from '../../composables/useClassDetails';
import { useDashboardUtils } from '../../composables/useDashboardUtils';
import { courseAPI } from '../../services/api';
import IconChart from '~icons/solar/round-graph-bold';
import IconBook from '~icons/solar/book-bookmark-bold';
import IconUser from '~icons/solar/user-bold';
import IconClock from '~icons/basil/clock-solid';
import IconArrowRight from '~icons/basil/arrow-right-solid';
import IconBookSolid from '~icons/basil/book-solid';
import IconCalendar from '~icons/basil/calendar-outline';
import { formatDate } from '../../utils/formatters';

const router = useRouter();
const { studentProfile, fetchStudentProfile } = useStudentProfile();
const { greeting, getFormattedSchedule, getDashboardCourses, getPlaceholderImage, getCourseStatusText, getStatusBadgeClass } = useDashboardUtils();

onMounted(async () => {
  await fetchStudentProfile();
  fetchCourses();
});

const classId = computed(() => studentProfile.value?.classid);
const { classInfo, levelName, lecturerName, isLoading: classLoading } = useClassDetails(classId);

const user = computed(() => ({
  name: studentProfile.value?.nama_lengkap || studentProfile.value?.fullname || authStore.user?.username || authStore.user?.email?.split('@')[0] || 'Student',
}));

const formattedSchedule = computed(() => getFormattedSchedule(classInfo.value));

const courses = ref([]);
const coursesLoading = ref(false);
const coursesError = ref(null);

const dashboardCourses = computed(() => getDashboardCourses(courses.value, 4));

const fetchCourses = async () => {
  if (!studentProfile.value?.classid) return;
  
  coursesLoading.value = true;
  coursesError.value = null;
  
  try {
    const response = await courseAPI.getAllCourses();
    
    if (response.data.success) {
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
  } finally {
    coursesLoading.value = false;
  }
};

const courseLink = (courseId) => ({ name: 'StudentCourseDetail', params: { id: courseId } });
</script>

<template>
  <div class="space-y-6">
    <!-- Welcome Section -->
    <section 
      class="relative bg-blue-600 rounded-2xl p-6 md:p-8 shadow-lg overflow-hidden"
      aria-labelledby="welcome-heading"
    >
      <div class="absolute top-0 right-0 w-1/2 h-full pointer-events-none overflow-hidden" aria-hidden="true">
        <div class="absolute -top-10 -right-10 w-40 h-48 bg-blue-400/30 rounded-lg transform rotate-12"></div>
        <div class="absolute top-20 -right-5 w-32 h-40 bg-blue-300/40 rounded-lg transform rotate-12"></div>
        <div class="absolute top-40 right-10 w-28 h-36 bg-white/20 rounded-lg transform rotate-12"></div>
      </div>

      <div class="relative z-10">
        <p class="text-white/80 text-sm mb-1">{{ greeting }},</p>
        <h1 id="welcome-heading" class="text-2xl md:text-3xl font-bold text-white mb-2">{{ user.name }}</h1>
        <p class="text-white/70 text-sm md:text-base max-w-md">
          Welcome back! Continue your learning journey and explore your course materials.
        </p>
      </div>
    </section>

    <!-- Quick Stats Cards -->
    <section aria-label="Quick stats">
      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100">
          
          <!-- Level -->
          <article class="bg-white p-3 sm:p-5 hover:bg-slate-50 transition-colors" aria-label="Level">
            <div class="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-1.5">
              <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <IconChart class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" aria-hidden="true" />
              </div>
              <h3 class="text-xs sm:text-sm font-medium text-gray-500 line-clamp-1">Level</h3>
            </div>
            <div class="pl-9 sm:pl-11">
              <p class="text-base sm:text-xl font-bold text-gray-900 line-clamp-1">
                <span v-if="classLoading" role="status" aria-busy="true">—</span>
                <span v-else>{{ levelName || '-' }}</span>
              </p>
              <p class="text-[10px] sm:text-xs text-gray-400 mt-0.5 line-clamp-1">Current class</p>
            </div>
          </article>

          <!-- Courses -->
          <article class="bg-white p-3 sm:p-5 hover:bg-slate-50 transition-colors" aria-label="Courses">
            <div class="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-1.5">
              <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <IconBook class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" aria-hidden="true" />
              </div>
              <h3 class="text-xs sm:text-sm font-medium text-gray-500 line-clamp-1">Courses</h3>
            </div>
            <div class="pl-9 sm:pl-11">
              <p class="text-base sm:text-xl font-bold text-gray-900 line-clamp-1">
                <span v-if="coursesLoading" role="status" aria-busy="true">—</span>
                <span v-else>{{ courses.length }}</span>
              </p>
              <p class="text-[10px] sm:text-xs text-gray-400 mt-0.5 line-clamp-1">Available materials</p>
            </div>
          </article>

          <!-- Instructor -->
          <article class="bg-white p-3 sm:p-5 hover:bg-slate-50 transition-colors" aria-label="Instructor">
            <div class="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-1.5">
              <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <IconUser class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" aria-hidden="true" />
              </div>
              <h3 class="text-xs sm:text-sm font-medium text-gray-500 line-clamp-1">Instructor</h3>
            </div>
            <div class="pl-9 sm:pl-11">
              <p class="text-base sm:text-xl font-bold text-gray-900 line-clamp-1">
                <span v-if="classLoading" role="status" aria-busy="true">—</span>
                <span v-else>{{ lecturerName || '-' }}</span>
              </p>
              <p class="text-[10px] sm:text-xs text-gray-400 mt-0.5 line-clamp-1">Class lecturer</p>
            </div>
          </article>

          <!-- Next Class -->
          <article class="bg-white p-3 sm:p-5 hover:bg-slate-50 transition-colors" aria-label="Next Class">
            <div class="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-1.5">
              <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                <IconClock class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" aria-hidden="true" />
              </div>
              <h3 class="text-xs sm:text-sm font-medium text-gray-500 line-clamp-1">Next Class</h3>
            </div>
            <div class="pl-9 sm:pl-11">
              <p class="text-base sm:text-xl font-bold text-gray-900 line-clamp-1">
                <span v-if="classLoading" role="status" aria-busy="true">—</span>
                <span v-else>{{ formattedSchedule }}</span>
              </p>
              <p class="text-[10px] sm:text-xs text-gray-400 mt-0.5 line-clamp-1">Upcoming schedule</p>
            </div>
          </article>

        </div>
      </div>
    </section>

    <!-- My Courses Section -->
    <section aria-labelledby="courses-heading">
      <div class="bg-gray-50 rounded-2xl p-6 md:p-8 border border-gray-200 shadow-sm">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 id="courses-heading" class="text-2xl font-bold text-gray-900">My Courses</h2>
            <p class="text-sm text-gray-500 mt-1">{{ courses.length }} course materials available</p>
          </div>
          <router-link 
            to="/student/courses" 
            class="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            aria-label="View all courses"
          >
            View All
            <IconArrowRight class="w-4 h-4" aria-hidden="true" />
          </router-link>
        </div>

        <div v-if="coursesLoading" class="space-y-6 animate-pulse" role="status" aria-busy="true">
          <div class="bg-blue-100 rounded-2xl h-52 md:h-64"></div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-white rounded-xl border border-gray-200 p-4 h-28"></div>
            <div class="bg-white rounded-xl border border-gray-200 p-4 h-28"></div>
            <div class="bg-white rounded-xl border border-gray-200 p-4 h-28"></div>
            <div class="bg-white rounded-xl border border-gray-200 p-4 h-28"></div>
          </div>
        </div>

        <div v-else-if="coursesError" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center" role="alert">
          <p class="text-red-800 mb-4">{{ coursesError }}</p>
          <button 
            @click="fetchCourses"
            class="px-6 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors"
            aria-label="Retry loading courses"
          >
            Retry
          </button>
        </div>

        <div v-else-if="dashboardCourses.length === 0" class="text-center py-12" role="status">
          <IconBookSolid class="w-16 h-16 mx-auto text-gray-400 mb-4" aria-hidden="true" />
          <p class="text-gray-500">No course materials available yet.</p>
        </div>

        <div v-else class="space-y-6">
          <!-- Hero Banner for Latest Course -->
          <article 
            class="bg-blue-600 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group relative"
            aria-labelledby="hero-course-title"
          >
            <!-- Background Decoration -->
            <div class="absolute top-0 right-0 w-1/2 h-full pointer-events-none overflow-hidden" aria-hidden="true">
              <div class="absolute -top-24 -right-10 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl"></div>
              <div class="absolute bottom-0 right-1/4 w-40 h-40 bg-blue-400/20 rounded-full blur-2xl"></div>
            </div>

            <router-link :to="courseLink(dashboardCourses[0].courseid)" class="flex flex-col md:flex-row relative z-10">
              <div class="md:w-5/12 lg:w-2/5 h-48 md:h-auto relative overflow-hidden bg-blue-800">
                <img 
                  :src="getPlaceholderImage(0)" 
                  :alt="dashboardCourses[0].title" 
                  class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" 
                />
                <span 
                  :class="getStatusBadgeClass(dashboardCourses[0])"
                  class="absolute top-3 left-3 md:top-4 md:left-4 z-10 px-2.5 py-1 md:px-3 rounded-full text-white text-[10px] md:text-xs font-semibold shadow-sm"
                  aria-label="Course status"
                >
                  {{ getCourseStatusText(dashboardCourses[0]) }}
                </span>
              </div>
              
              <div class="p-5 md:p-8 md:w-7/12 lg:w-3/5 flex flex-col justify-center">
                <div class="flex items-center gap-2.5 mb-2.5 md:mb-3">
                  <span class="text-[10px] md:text-xs font-bold px-2 py-0.5 md:px-2.5 md:py-1 rounded-full bg-white/20 text-white backdrop-blur-sm">Latest Activity</span>
                  <span class="text-[10px] md:text-xs text-blue-100 flex items-center gap-1 font-medium">
                    <IconCalendar class="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" />
                    {{ formatDate(dashboardCourses[0].upload_date) }}
                  </span>
                </div>
                <h3 id="hero-course-title" class="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 md:mb-3 line-clamp-2">{{ dashboardCourses[0].title }}</h3>
                <p class="text-blue-100/90 text-xs md:text-sm lg:text-base mb-5 md:mb-8 line-clamp-2 md:line-clamp-3 max-w-xl">
                  Access your latest course materials and continue your learning journey right where you left off.
                </p>
                
                <div class="mt-auto pt-2 md:pt-0">
                  <span class="inline-flex justify-center w-full md:w-auto items-center gap-2 px-5 md:px-6 py-2 md:py-2.5 bg-white text-blue-600 text-sm md:text-base font-bold rounded-xl hover:bg-blue-50 transition-all shadow-sm group-hover:shadow group-hover:-translate-y-0.5">
                    Open Course
                    <IconArrowRight class="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                  </span>
                </div>
              </div>
            </router-link>
          </article>

          <!-- Grid for Remaining Courses -->
          <div v-if="dashboardCourses.length > 1" class="grid grid-cols-3 gap-2 sm:gap-3 md:gap-5">
            <article 
              v-for="(course, index) in dashboardCourses.slice(1)" 
              :key="course.courseid"
              class="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group"
            >
              <router-link :to="courseLink(course.courseid)" class="flex flex-col h-full">
                <!-- Course Image Header -->
                <div class="h-20 sm:h-28 md:h-40 w-full relative overflow-hidden bg-gray-100">
                  <img 
                    :src="getPlaceholderImage(index + 1)" 
                    :alt="course.title" 
                    class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                  
                  <!-- Status Badge -->
                  <div class="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 md:top-3 md:left-3 z-10 hidden sm:block">
                    <span 
                      :class="getStatusBadgeClass(course)"
                      class="px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-white text-[9px] md:text-[10px] font-semibold shadow-sm"
                    >
                      {{ getCourseStatusText(course) }}
                    </span>
                  </div>
                  
                  <!-- Hover Overlay -->
                  <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div class="bg-white/90 backdrop-blur-sm text-blue-600 p-1.5 sm:p-2 md:p-2.5 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-lg">
                      <IconArrowRight class="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    </div>
                  </div>
                </div>
                
                <!-- Course Content -->
                <div class="p-2 sm:p-3 md:p-4 flex flex-col flex-grow justify-between">
                  <div>
                    <h3 class="text-[11px] sm:text-sm md:text-base font-bold text-gray-900 mb-1 md:mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
                      {{ course.title }}
                    </h3>
                  </div>
                  
                  <div class="mt-1 sm:mt-2 md:mt-3 pt-1.5 sm:pt-2 md:pt-3 border-t border-gray-100 flex flex-col xl:flex-row xl:items-center justify-between gap-1 xl:gap-0">
                    <div class="hidden sm:flex items-center gap-1 md:gap-1.5 text-[9px] md:text-[11px] text-gray-500 font-medium">
                      <IconCalendar class="w-3 h-3 md:w-3.5 md:h-3.5 text-gray-400 flex-shrink-0" />
                      <span class="truncate">{{ formatDate(course.upload_date) }}</span>
                    </div>
                    <span class="text-[9px] sm:text-[10px] md:text-xs font-semibold text-blue-600 flex items-center gap-0.5 md:gap-1 group-hover:translate-x-1 transition-transform w-fit">
                      Open <IconArrowRight class="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5" />
                    </span>
                  </div>
                </div>
              </router-link>
            </article>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.grid > article {
  animation: fadeIn 0.3s ease-out backwards;
}

.grid > article:nth-child(1) { animation-delay: 0.05s; }
.grid > article:nth-child(2) { animation-delay: 0.1s; }
.grid > article:nth-child(3) { animation-delay: 0.15s; }
.grid > article:nth-child(4) { animation-delay: 0.2s; }

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
