<script setup>
import { ref, onMounted } from 'vue';
import { useStudentProfile } from '../../composables/useStudentProfile';
import { classAPI, levelAPI, lecturerAPI, courseAPI } from '../../services/api';

const { studentProfile, isLoading: profileLoading } = useStudentProfile();
const classInfo = ref(null);
const levelName = ref('');
const lecturerName = ref('');
const courses = ref([]);
const isLoading = ref(true);
const errorMessage = ref('');

/** Fetch class and related data */
const fetchCourseData = async () => {
  if (!studentProfile.value?.classid) {
    errorMessage.value = 'No class assigned to your account.';
    isLoading.value = false;
    return;
  }

  try {
    isLoading.value = true;
    const classid = studentProfile.value.classid;

    // Fetch class details
    const classRes = await classAPI.getClassById(classid);
    if (classRes.data.success) {
      classInfo.value = classRes.data.data;

      // Fetch level name
      if (classInfo.value.levelid) {
        const levelRes = await levelAPI.getLevelById(classInfo.value.levelid);
        if (levelRes.data.success) {
          levelName.value = levelRes.data.data.name;
        }
      }

      // Fetch lecturer name
      if (classInfo.value.lecturerid) {
        try {
          const lecturersRes = await lecturerAPI.getAllLecturers();
          if (lecturersRes.data.success) {
            const lecturer = lecturersRes.data.data.find(
              l => l.lecturerid === classInfo.value.lecturerid
            );
            if (lecturer) {
              lecturerName.value = lecturer.fullname;
            }
          }
        } catch (error) {
          console.error('Error fetching lecturer:', error);
          lecturerName.value = '-';
        }
      }
    }

    // Fetch courses
    const courseRes = await courseAPI.getAllCourses();
    if (courseRes.data.success) {
      // Filter courses by classid
      courses.value = courseRes.data.data.filter(course => course.classid === classid);
    }
  } catch (error) {
    errorMessage.value = 'Failed to load course data.';
    console.error('Error fetching course data:', error);
  } finally {
    isLoading.value = false;
  }
};

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

onMounted(async () => {
  // Wait for student profile to load
  if (!profileLoading.value && studentProfile.value) {
    await fetchCourseData();
  } else {
    const interval = setInterval(() => {
      if (!profileLoading.value && studentProfile.value) {
        clearInterval(interval);
        fetchCourseData();
      }
    }, 100);
  }
});
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold text-gray-900 mb-8">My Courses</h1>

    <!-- Loading State -->
    <div v-if="isLoading || profileLoading" class="flex items-center justify-center py-20">
      <svg class="w-12 h-12 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMessage" class="bg-red-50 border border-red-200 rounded-xl p-6">
      <p class="text-red-800">{{ errorMessage }}</p>
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
              <!-- Book Icon -->
              <div class="flex-shrink-0">
                <svg class="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="4" y="4" width="4" height="16" rx="1" opacity="0.7"/>
                  <rect x="10" y="2" width="4" height="18" rx="1" opacity="0.85"/>
                  <rect x="16" y="6" width="4" height="14" rx="1"/>
                </svg>
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
  </div>
</template>
