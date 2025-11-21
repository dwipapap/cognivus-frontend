<script setup>
import { ref, computed, watchEffect } from 'vue';
import { useStudentProfile } from '../../composables/useStudentProfile';
import { useClassDetails } from '../../composables/useClassDetails';
import { courseAPI } from '../../services/api';
import LoadingBar from '../../components/ui/LoadingBar.vue';

const { studentProfile, isLoading: profileLoading } = useStudentProfile();

// Use composable for class details
const classId = computed(() => studentProfile.value?.classid);
const { classInfo, levelName, lecturerName, isLoading: classLoading, error: classError, retry: retryClass } = useClassDetails(classId);

const courses = ref([]);
const coursesLoading = ref(false);
const coursesError = ref(null);

/** Fetch courses for the class */
const fetchCourses = async () => {
  if (!classId.value) return;
  
  coursesLoading.value = true;
  coursesError.value = null;
  
  try {
    const courseRes = await courseAPI.getAllCourses();
    if (courseRes.data.success) {
      courses.value = courseRes.data.data.filter(course => course.classid === classId.value);
    }
  } catch (error) {
    coursesError.value = 'Failed to load courses';
    console.error('Error fetching courses:', error);
  } finally {
    coursesLoading.value = false;
  }
};

// Auto-fetch courses when profile loads
watchEffect(() => {
  if (!profileLoading.value && classId.value) {
    fetchCourses();
  }
});

// Combined loading and error states
const isLoading = computed(() => profileLoading.value || classLoading.value || coursesLoading.value);
const errorMessage = computed(() => {
  if (!classId.value && !profileLoading.value) return 'No class assigned to your account.';
  return classError.value || coursesError.value;
});

/** Format date with day name */
const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const dateOnly = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return `${dayName}, ${dateOnly}`;
  } catch {
    return dateString;
  }
};
</script>

<template>
  <!-- Loading State -->
  <div v-if="isLoading || profileLoading" class="max-w-2xl mx-auto py-20">
    <LoadingBar :loading="true" color="blue" :duration="2000" />
  </div>

  <!-- Error State -->
    <div v-else-if="errorMessage" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <p class="text-red-800 mb-4">{{ errorMessage }}</p>
      <button 
        v-if="classError"
        @click="retryClass"
        class="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 rounded-full transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 mr-2"
      >
        Retry Class Details
      </button>
      <button 
        v-if="coursesError"
        @click="fetchCourses"
        class="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 rounded-full transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
      >
        Retry Courses
      </button>
    </div>

  <!-- Course Content -->
  <div v-else class="space-y-6">
    <!-- Class Info Card -->
    <div class="relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg overflow-hidden">
      <!-- Diagonal Book Graphics -->
      <div class="absolute top-0 right-0 w-1/2 h-full pointer-events-none overflow-hidden">
        <div class="absolute -top-10 -right-10 w-40 h-48 bg-blue-400/30 rounded-lg transform rotate-12"></div>
        <div class="absolute top-20 -right-5 w-32 h-40 bg-blue-300/40 rounded-lg transform rotate-12"></div>
        <div class="absolute top-40 right-10 w-28 h-36 bg-white/20 rounded-lg transform rotate-12"></div>
      </div>

      <!-- Content -->
      <div class="relative p-5 md:p-8 z-10">
        <div class="mb-6">
          <h2 class="text-2xl md:text-3xl font-bold text-white mb-2">{{ levelName || 'Your Course Level' }}</h2>
          <h3 class="text-lg md:text-xl font-semibold text-white/90 mb-3">{{ classInfo?.class_code || 'Class Code' }}</h3>
          <p class="text-sm text-white/80">
            {{ classInfo?.description || 'Access your course materials and learning resources' }}
          </p>
        </div>

        <!-- Lecturer Badge -->
        <div class="inline-block bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
          <p class="text-white text-sm font-medium">{{ lecturerName || 'Instructor' }}</p>
        </div>
      </div>
    </div>

    <!-- Course List -->
    <div class="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 md:p-6 shadow-sm hover:shadow-md transition-all duration-200">
      <h2 class="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Course Materials</h2>
      
      <div v-if="courses.length === 0" class="py-12 text-center text-gray-500">
        No course materials available yet.
      </div>

      <div v-else class="space-y-3 md:space-y-4">
        <router-link 
          v-for="course in courses" 
          :key="course.courseid"
          :to="{ name: 'StudentCourseDetail', params: { id: course.courseid } }"
          class="block bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
        >
          <div class="flex items-center gap-3 md:gap-4 p-4 md:p-5">
            <!-- Book Icon with styled background -->
            <div class="flex-shrink-0">
              <div class="relative w-10 h-10 md:w-14 md:h-14 flex items-center justify-center rounded-lg bg-gradient-to-br from-white/10 to-blue-50/20 backdrop-blur-sm shadow-sm overflow-visible">
                <!-- Layered decorative shapes with a subtle bluish tint -->
                <span class="absolute -left-2 -top-2 w-5 h-5 md:w-7 md:h-7 bg-blue-100/30 rounded-md transform rotate-12"></span>
                <span class="absolute right-0 bottom-0 w-4 h-8 md:w-6 md:h-10 bg-blue-200/25 rounded-md transform rotate-6"></span>

                <!-- Book SVG (kept visual weight but slightly smaller to fit the background) -->
                <svg class="w-6 h-6 md:w-10 md:h-10 text-white z-10" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="4" y="4" width="4" height="16" rx="1" opacity="0.7"/>
                  <rect x="10" y="2" width="4" height="18" rx="1" opacity="0.85"/>
                  <rect x="16" y="6" width="4" height="14" rx="1"/>
                </svg>
              </div>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <h3 class="text-base md:text-lg font-semibold md:font-bold text-white mb-1">{{ course.title }}</h3>
              <p class="text-xs text-white/70">{{ formatDate(course.upload_date) }}</p>
            </div>

            <!-- Arrow Icon -->
            <div class="flex-shrink-0">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>
