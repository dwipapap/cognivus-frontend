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

/** Format date */
const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
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
      <div class="bg-white rounded-2xl shadow-lg p-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p class="text-sm font-semibold text-gray-500 mb-1">Class Code</p>
            <p class="text-xl font-bold text-gray-900">{{ classInfo?.class_code || '-' }}</p>
          </div>
          <div>
            <p class="text-sm font-semibold text-gray-500 mb-1">Level</p>
            <p class="text-xl font-bold text-blue-600">{{ levelName || '-' }}</p>
          </div>
          <div>
            <p class="text-sm font-semibold text-gray-500 mb-1">Lecturer</p>
            <p class="text-xl font-bold text-gray-900">{{ lecturerName || '-' }}</p>
          </div>
        </div>
      </div>

      <!-- Course List -->
      <div class="bg-white rounded-2xl shadow-lg p-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Course Materials</h2>
        
        <div v-if="courses.length === 0" class="text-center py-12 text-gray-500">
          No course materials available yet.
        </div>

        <div v-else class="space-y-4">
          <div 
            v-for="course in courses" 
            :key="course.courseid"
            class="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
          >
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="text-lg font-bold text-gray-900">{{ course.title }}</h3>
                <p class="text-sm text-gray-500">Uploaded: {{ formatDate(course.upload_date) }}</p>
              </div>
              <span v-if="course.course_code" class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                {{ course.course_code }}
              </span>
            </div>

            <div class="flex gap-3">
              <a 
                v-if="course.file" 
                :href="course.file" 
                target="_blank"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                📄 Download File
              </a>
              <a 
                v-if="course.video_link" 
                :href="course.video_link" 
                target="_blank"
                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                🎥 Watch Video
              </a>
              <p v-if="!course.file && !course.video_link" class="text-gray-500 text-sm">
                No materials available
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
