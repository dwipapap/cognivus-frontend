<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { courseAPI, classAPI, levelAPI, lecturerAPI } from '../../services/api';
import BaseButton from '../../components/ui/BaseButton.vue';

const route = useRoute();
const router = useRouter();

const course = ref(null);
const classInfo = ref(null);
const levelName = ref('');
const lecturerName = ref('');
const isLoading = ref(true);
const errorMessage = ref('');
const showVideo = ref(false);

/** Extract YouTube video ID */
const getYouTubeId = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return match ? match[1] : null;
};

/** Check if video is YouTube */
const isYouTubeVideo = computed(() => {
  return course.value?.video_link && getYouTubeId(course.value.video_link) !== null;
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

/** Fetch course and related data */
const fetchCourseData = async () => {
  try {
    isLoading.value = true;
    const courseId = route.params.id;

    // Fetch course details
    const courseRes = await courseAPI.getCourseById(courseId);
    if (!courseRes.data.success) {
      errorMessage.value = 'Course not found.';
      return;
    }

    course.value = courseRes.data.data;

    // Fetch class info
    if (course.value.classid) {
      const classRes = await classAPI.getClassById(course.value.classid);
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
          const lecturersRes = await lecturerAPI.getAllLecturers();
          if (lecturersRes.data.success) {
            const lecturer = lecturersRes.data.data.find(
              l => l.lecturerid === classInfo.value.lecturerid
            );
            if (lecturer) {
              lecturerName.value = lecturer.fullname;
            }
          }
        }
      }
    }
  } catch (error) {
    errorMessage.value = 'Failed to load course data.';
    console.error('Error fetching course:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchCourseData);
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-8">
    <!-- Breadcrumb -->
    <div class="mb-6">
      <button 
        @click="router.push({ name: 'StudentMyCourses' })"
        class="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        Back to My Courses
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
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
    <div v-else-if="course" class="space-y-6">
      <!-- Course Header -->
      <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-8 text-white">
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h1 class="text-3xl font-bold mb-2">{{ course.title }}</h1>
            <p class="text-white/80 text-sm">{{ formatDate(course.upload_date) }}</p>
          </div>
          <div v-if="course.course_code" class="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-semibold">
            {{ course.course_code }}
          </div>
        </div>
        
        <!-- Class Info -->
        <div class="flex flex-wrap gap-4 text-sm">
          <div v-if="levelName" class="flex items-center gap-2">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
            </svg>
            <span>{{ levelName }}</span>
          </div>
          <div v-if="classInfo?.class_code" class="flex items-center gap-2">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
            </svg>
            <span>{{ classInfo.class_code }}</span>
          </div>
          <div v-if="lecturerName" class="flex items-center gap-2">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            <span>{{ lecturerName }}</span>
          </div>
        </div>
      </div>

      <!-- Description -->
      <div v-if="course.description" class="bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-3">Description</h2>
        <p class="text-gray-700 whitespace-pre-wrap">{{ course.description }}</p>
      </div>

      <!-- Course Materials -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Course Materials</h2>
        
        <div class="space-y-3">
          <!-- File Download -->
          <a 
            v-if="course.file" 
            :href="course.file" 
            target="_blank"
            class="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 15.01l1.41 1.41L11 14.84V19h2v-4.16l1.59 1.59L16 15.01 12.01 11z"/>
            </svg>
            <div class="flex-1">
              <p class="font-semibold text-gray-800">Download Course File</p>
              <p class="text-sm text-gray-600">Click to download course materials</p>
            </div>
          </a>

          <!-- Video -->
          <div v-if="course.video_link">
            <div v-if="isYouTubeVideo" class="space-y-3">
              <BaseButton @click="showVideo = !showVideo" variant="primary" class="w-full">
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 8.64L15.27 12 10 15.36V8.64M8 5v14l11-7L8 5z"/>
                </svg>
                {{ showVideo ? 'Hide Video' : 'Watch Video' }}
              </BaseButton>
              
              <div v-if="showVideo" class="aspect-video rounded-lg overflow-hidden shadow-lg">
                <iframe
                  :src="`https://www.youtube.com/embed/${getYouTubeId(course.video_link)}`"
                  class="w-full h-full"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                ></iframe>
              </div>
            </div>
            
            <a 
              v-else
              :href="course.video_link" 
              target="_blank"
              class="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <svg class="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 8.64L15.27 12 10 15.36V8.64M8 5v14l11-7L8 5z"/>
              </svg>
              <div class="flex-1">
                <p class="font-semibold text-gray-800">Watch Video</p>
                <p class="text-sm text-gray-600">Open video in new tab</p>
              </div>
            </a>
          </div>

          <!-- No Materials -->
          <div v-if="!course.file && !course.video_link" class="text-center py-8 text-gray-500">
            No materials available yet.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
