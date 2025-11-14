<script setup>
import { ref, computed, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useClassDetails } from '../../composables/useClassDetails';
import { courseAPI } from '../../services/api';
import { VPdfViewer } from '@vue-pdf-viewer/viewer';
import Modal from '../../components/ui/Modal.vue';

const route = useRoute();
const router = useRouter();

const course = ref(null);
const courseLoading = ref(false);
const courseError = ref(null);

// PDF Modal state
const showPdfModal = ref(false);
const currentPdfUrl = ref(null);

// Use composable for class details
const classId = computed(() => course.value?.classid);
const { classInfo, levelName, lecturerName, isLoading: classLoading, error: classError, retry: retryClass } = useClassDetails(classId);

/** Extract YouTube video ID */
const getYouTubeId = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return match ? match[1] : null;
};

/** Get all course files (PDFs and other materials) */
const courseFiles = computed(() => {
  if (!course.value?.tbcourse_files) {
    return [];
  }
  return course.value.tbcourse_files;
});

/** Get file display URL (prioritize url over path) */
const getFileUrl = (file) => {
  return file.url || file.path;
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

/** Open PDF in modal viewer */
const openPdfModal = (url) => {
  currentPdfUrl.value = url;
  showPdfModal.value = true;
};

/** Close PDF modal */
const closePdfModal = () => {
  showPdfModal.value = false;
  currentPdfUrl.value = null;
};

/** Fetch course details */
const fetchCourseData = async () => {
  courseLoading.value = true;
  courseError.value = null;
  
  try {
    const courseId = route.params.id;
    const courseRes = await courseAPI.getCourseById(courseId);
    
    if (!courseRes.data.success) {
      courseError.value = 'Course not found';
      return;
    }
    
    course.value = courseRes.data.data;
  } catch (error) {
    courseError.value = 'Failed to load course';
    console.error('Error fetching course:', error);
  } finally {
    courseLoading.value = false;
  }
};

// Combined states
const isLoading = computed(() => courseLoading.value || classLoading.value);
const errorMessage = computed(() => courseError.value || classError.value);

// Auto-fetch course on mount
watchEffect(() => {
  if (route.params.id) {
    fetchCourseData();
  }
});
</script>

<template>
  <!-- Loading State -->
  <div v-if="loading" class="max-w-2xl mx-auto py-20">
    <LoadingBar :loading="true" color="blue" :duration="2000" />
    <p class="text-center text-gray-600 mt-4">Loading course details...</p>
  </div>

  <!-- Error State -->
  <div v-else-if="errorMessage" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
    <p class="text-red-800 mb-4">{{ errorMessage }}</p>
    <button 
      v-if="courseError"
      @click="fetchCourseData"
      class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors mr-2"
    >
      Retry Course
    </button>
    <button 
      v-if="classError"
      @click="retryClass"
      class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
    >
      Retry Class Details
    </button>
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

    <!-- Course Materials Section -->
    <section class="bg-white rounded-xl shadow-lg p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">Course Materials</h2>
      
      <!-- No Materials -->
      <div v-if="courseFiles.length === 0 && !course.video_link" class="text-center py-12 text-gray-500">
        <svg class="w-16 h-16 mx-auto mb-3 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-7v-2h-2V7h-2v3H8v2h2v3h2v-3h2z"/>
        </svg>
        <p class="font-medium">No materials available yet.</p>
      </div>

      <!-- Materials Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Course Files (PDF/Documents) -->
        <div 
          v-for="file in courseFiles" 
          :key="file.cfid"
          class="flex items-center gap-4 p-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
        >
          <!-- PDF Thumbnail -->
          <div class="flex-shrink-0 w-20 h-24 bg-white rounded-lg flex items-center justify-center">
            <div class="text-center">
              <svg class="w-10 h-10 mx-auto text-red-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
                <path d="M8 16h8v-2H8v2zm0-4h8v-2H8v2z"/>
              </svg>
              <p class="text-xs font-bold text-gray-700 mt-1">PDF</p>
            </div>
          </div>
          
          <!-- File Info -->
          <div class="flex-1 text-white">
            <p class="font-bold text-lg mb-1">Learning Materials</p>
            <p class="text-xs text-blue-200 mt-1">{{ formatDate(file.upload_date) }}</p>
            
            <!-- Action Buttons -->
            <div class="flex gap-2 mt-3">
              <button
                @click="openPdfModal(getFileUrl(file))"
                class="px-3 py-1.5 text-xs font-medium bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors flex items-center gap-1"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                Preview
              </button>
              <a
                :href="getFileUrl(file)"
                target="_blank"
                rel="noopener noreferrer"
                class="px-3 py-1.5 text-xs font-medium bg-white text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                </svg>
                Open
              </a>
            </div>
          </div>
        </div>

        <!-- YouTube Video -->
        <a 
          v-if="course.video_link && getYouTubeId(course.video_link)"
          :href="`https://www.youtube.com/watch?v=${getYouTubeId(course.video_link)}`" 
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-4 p-4 bg-gradient-to-br from-red-600 to-red-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
        >
          <!-- Video Thumbnail -->
          <div class="flex-shrink-0 w-20 h-24 bg-white rounded-lg flex items-center justify-center">
            <svg class="w-12 h-12 text-red-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 8.64L15.27 12 10 15.36V8.64M8 5v14l11-7L8 5z"/>
            </svg>
          </div>
          
          <!-- Video Info -->
          <div class="flex-1 text-white">
            <p class="font-bold text-lg mb-1">Video Lesson</p>
            <p class="text-sm text-red-100">Watch on YouTube</p>
          </div>
          
          <!-- Open Icon -->
          <svg class="w-6 h-6 text-white/80 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
          </svg>
        </a>
      </div>
    </section>

    <!-- Description Section -->
    <section v-if="course.description" class="bg-white rounded-xl shadow-lg p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Class Notes</h2>
      <div class="prose max-w-none">
        <p class="text-gray-700 whitespace-pre-wrap leading-relaxed">{{ course.description }}</p>
      </div>
    </section>

    <!-- Back Button -->
    <div class="flex justify-end pt-4 pb-8">
      <button
        @click="router.push({ name: 'StudentMyCourses' })"
        class="flex items-center gap-2 h-12 px-6 rounded-full bg-white border-2 border-blue-600 text-blue-600 font-semibold shadow-sm hover:bg-blue-50 transition-all duration-200 cursor-pointer active:scale-95"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        <span>Back</span>
      </button>
    </div>
  </div>

  <!-- PDF Viewer Modal -->
  <Modal
    :show="showPdfModal"
    @close="closePdfModal"
    size="7xl"
    variant="gradient"
    gradient-from="blue-600"
    gradient-via="blue-700"
    gradient-to="indigo-700"
    title="PDF Viewer"
    hide-footer
  >
    <template #icon>
      <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
      </svg>
    </template>
    <template #content>
      <div v-if="currentPdfUrl" class="w-full" style="height: 70vh;">
        <VPdfViewer :src="currentPdfUrl" />
      </div>
      <div v-else class="flex items-center justify-center h-96">
        <p class="text-gray-500">No PDF selected</p>
      </div>
    </template>
  </Modal>
</template>
