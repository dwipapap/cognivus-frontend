<script setup>
import { ref, computed, watchEffect } from 'vue';
import { useStudentProfile } from '../../composables/useStudentProfile';
import { useClassDetails } from '../../composables/useClassDetails';
import { courseAPI } from '../../services/api';

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
  <!-- Welcome Banner -->
  <div class="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 rounded-3xl shadow-lg mb-8 overflow-hidden">
    <div class="flex flex-col lg:flex-row items-center">
      <!-- Left: Text Content -->
      <div class="flex-1 p-8 lg:p-12">
        <h1 class="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          My Courses
        </h1>
        <p class="text-white/80 text-base lg:text-lg leading-relaxed max-w-lg">
          Access all your course materials and learning resources in one place.
        </p>
      </div>

      <!-- Right: Icon Illustration -->
      <div class="w-full lg:w-1/2 p-8 lg:p-12 flex items-center justify-center">
        <svg class="w-32 h-32 text-white/20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
        </svg>
      </div>
    </div>
  </div>

  <!-- Loading State -->
  <div v-if="isLoading || profileLoading" class="flex items-center justify-center py-20">
      <svg class="w-12 h-12 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMessage" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <p class="text-red-800 mb-4">{{ errorMessage }}</p>
      <button 
        v-if="classError"
        @click="retryClass"
        class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors mr-2"
      >
        Retry Class Details
      </button>
      <button 
        v-if="coursesError"
        @click="fetchCourses"
        class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
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
      <div class="relative p-8 z-10">
        <div class="mb-6">
          <h2 class="text-3xl font-bold text-white mb-2">{{ levelName || 'Your Course Level' }}</h2>
          <h3 class="text-xl font-semibold text-white/90 mb-3">{{ classInfo?.class_code || 'Class Code' }}</h3>
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
    <div class="space-y-4">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Course Materials</h2>
      
      <div v-if="courses.length === 0" class="bg-white rounded-2xl shadow-lg p-12 text-center text-gray-500">
        No course materials available yet.
      </div>

      <div v-else class="space-y-4">
        <router-link 
          v-for="course in courses" 
          :key="course.courseid"
          :to="{ name: 'StudentCourseDetail', params: { id: course.courseid } }"
          class="block bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
        >
          <div class="flex items-center gap-4 p-5">
            <!-- Book Icon with styled background -->
            <div class="flex-shrink-0">
              <div class="relative w-14 h-14 flex items-center justify-center rounded-lg bg-gradient-to-br from-white/10 to-blue-50/20 backdrop-blur-sm shadow-sm overflow-visible">
                <!-- Layered decorative shapes with a subtle bluish tint -->
                <span class="absolute -left-2 -top-2 w-7 h-7 bg-blue-100/30 rounded-md transform rotate-12"></span>
                <span class="absolute right-0 bottom-0 w-6 h-10 bg-blue-200/25 rounded-md transform rotate-6"></span>

                <!-- Book SVG (kept visual weight but slightly smaller to fit the background) -->
                <svg class="w-10 h-10 text-white z-10" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="4" y="4" width="4" height="16" rx="1" opacity="0.7"/>
                  <rect x="10" y="2" width="4" height="18" rx="1" opacity="0.85"/>
                  <rect x="16" y="6" width="4" height="14" rx="1"/>
                </svg>
              </div>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-bold text-white mb-1">{{ course.title }}</h3>
              <p class="text-sm text-white/80 line-clamp-2 mb-2">
                {{ course.description || 'Click to view course materials and resources.' }}
              </p>
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
