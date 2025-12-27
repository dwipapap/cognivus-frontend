<script setup>
import { ref, computed, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useClassDetails } from '../../composables/useClassDetails';
import { courseAPI } from '../../services/api';
import IconShield from '~icons/basil/shield-solid';
import IconHome from '~icons/basil/home-solid';
import IconUser from '~icons/basil/user-solid';
import IconFolder from '~icons/basil/folder-solid';
import IconDocument from '~icons/basil/document-solid';
import IconPlay from '~icons/basil/play-solid';
import IconArrowLeft from '~icons/basil/arrow-left-outline';
import IconUpload from '~icons/basil/upload-outline';
import LoadingBar from '../../components/ui/LoadingBar.vue';
import Modal from '../../components/ui/Modal.vue';
import PDFViewer from '../../components/ui/PDFViewer.vue';
import { formatDate } from '../../utils/formatters';

const route = useRoute();
const router = useRouter();

const course = ref(null);
const courseLoading = ref(false);
const courseError = ref(null);

// PDF Modal States
const showPdfModal = ref(false);
const selectedPdfUrl = ref('');
const selectedPdfTitle = ref('');

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

const openMaterial = (url, title) => {
  selectedPdfUrl.value = url;
  selectedPdfTitle.value = title;
  showPdfModal.value = true;
};

/** Close PDF Modal */
const closePdfModal = () => {
  showPdfModal.value = false;
  selectedPdfUrl.value = '';
  selectedPdfTitle.value = '';
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
  <div v-if="isLoading" class="max-w-2xl mx-auto py-12 md:py-20">
    <LoadingBar :loading="true" color="blue" :duration="2000" />
    <p class="text-center text-gray-600 mt-4 text-sm md:text-base">Loading course details...</p>
  </div>

  <!-- Error State -->
  <div v-else-if="errorMessage" class="bg-red-50 border border-red-200 rounded-xl p-4 md:p-6 text-center">
    <p class="text-red-800 mb-4 text-sm md:text-base">{{ errorMessage }}</p>
    <button 
      v-if="courseError"
      @click="fetchCourseData"
      class="inline-flex items-center px-3 py-2 md:px-4 text-xs md:text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors mr-2"
    >
      Retry Course
    </button>
    <button 
      v-if="classError"
      @click="retryClass"
      class="inline-flex items-center px-3 py-2 md:px-4 text-xs md:text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
    >
      Retry Class Details
    </button>
  </div>

  <!-- Course Content -->
  <div v-else-if="course" class="space-y-4 md:space-y-6 mb-8">
    <!-- Course Header -->
    <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl md:rounded-2xl shadow-lg p-5 md:p-8 text-white">
      <div class="flex items-start justify-between gap-3 mb-4">
        <div class="flex-1 min-w-0">
          <h1 class="text-xl md:text-3xl font-bold mb-1 md:mb-2 break-words">{{ course.title }}</h1>
          <p class="text-white/80 text-xs md:text-sm">{{ formatDate(course.upload_date) }}</p>
        </div>
        <div v-if="course.course_code" class="flex-shrink-0 px-3 py-1.5 md:px-4 md:py-2 bg-white/20 backdrop-blur-sm rounded-lg text-xs md:text-sm font-semibold">
          {{ course.course_code }}
        </div>
      </div>
      
      <!-- Class Info -->
      <div class="flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm">
        <div v-if="levelName" class="flex items-center gap-1.5 md:gap-2">
          <IconShield class="w-4 h-4 md:w-5 md:h-5" />
          <span class="truncate">{{ levelName }}</span>
        </div>
        <div v-if="classInfo?.class_code" class="flex items-center gap-1.5 md:gap-2">
          <IconHome class="w-4 h-4 md:w-5 md:h-5" />
          <span class="truncate">{{ classInfo.class_code }}</span>
        </div>
        <div v-if="lecturerName" class="flex items-center gap-1.5 md:gap-2">
          <IconUser class="w-4 h-4 md:w-5 md:h-5" />
          <span class="truncate">{{ lecturerName }}</span>
        </div>
      </div>
    </div>

    <!-- Course Materials and Class Notes Combined Section -->
    <section class="bg-white rounded-xl shadow-lg p-4 md:p-6">
      <!-- Class Notes -->
      <div v-if="course.description" class="mb-6 md:mb-8">
        <div class="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
          <div class="p-1.5 md:p-2 bg-blue-100 rounded-lg text-blue-600">
            <IconDocument class="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <h2 class="text-lg md:text-2xl font-bold text-gray-900">Class Notes</h2>
        </div>
        <div class="prose max-w-none">
          <p class="text-sm md:text-base text-gray-700 whitespace-pre-wrap leading-relaxed">{{ course.description }}</p>
        </div>
      </div>

      <!-- Divider -->
      <div v-if="course.description && (courseFiles.length > 0 || course.video_link)" class="border-t border-gray-200 my-6 md:my-8"></div>

      <!-- Course Materials -->
      <div>
        <div class="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
          <div class="p-1.5 md:p-2 bg-blue-100 rounded-lg text-blue-600">
            <IconFolder class="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <h2 class="text-lg md:text-2xl font-bold text-gray-900">Course Materials</h2>
        </div>
        
        <!-- No Materials -->
        <div v-if="courseFiles.length === 0 && !course.video_link" class="text-center py-8 md:py-12 text-gray-500">
          <IconFolder class="w-12 h-12 md:w-16 md:h-16 mx-auto mb-2 md:mb-3 text-gray-300" />
          <p class="font-medium text-sm md:text-base">No materials available yet.</p>
        </div>

        <!-- Materials Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <!-- Course Files (PDF/Documents) -->
          <button
            v-for="file in courseFiles" 
            :key="file.cfid"
            @click="openMaterial(getFileUrl(file), 'Learning Materials')"
            class="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 cursor-pointer text-left"
          >
            <!-- PDF Thumbnail -->
            <div class="flex-shrink-0 w-14 h-16 md:w-16 md:h-16 bg-white rounded-lg flex items-center justify-center">
              <div class="text-center">
                <IconDocument class="w-7 h-7 md:w-8 md:h-8 mx-auto text-blue-600" />
                <p class="text-[10px] md:text-xs font-bold text-gray-700 mt-0.5">PDF</p>
              </div>
            </div>
            
            <!-- File Info -->
            <div class="flex-1 min-w-0 text-white">
              <p class="font-bold text-sm md:text-lg mb-0.5 md:mb-1 truncate">Learning Materials</p>
              <p class="text-xs md:text-sm text-blue-100">Click to view PDF</p>
              <p class="text-[10px] md:text-xs text-blue-200 mt-0.5 md:mt-1 truncate">{{ formatDate(file.upload_date) }}</p>
            </div>
            
            <!-- Open Icon -->
            <IconDocument class="w-5 h-5 md:w-6 md:h-6 text-white/80 flex-shrink-0" />
          </button>

          <!-- YouTube Video -->
          <a 
            v-if="course.video_link && getYouTubeId(course.video_link)"
            :href="`https://www.youtube.com/watch?v=${getYouTubeId(course.video_link)}`" 
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-gradient-to-br from-red-600 to-red-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
          >
            <!-- Video Thumbnail -->
            <div class="flex-shrink-0 w-14 h-16 md:w-16 md:h-16 bg-white rounded-lg flex items-center justify-center">
              <IconPlay class="w-9 h-9 md:w-10 md:h-10 text-red-600" />
            </div>
            
            <!-- Video Info -->
            <div class="flex-1 min-w-0 text-white">
              <p class="font-bold text-sm md:text-lg mb-0.5 md:mb-1 truncate">Video Lesson</p>
              <p class="text-xs md:text-sm text-red-100">Watch on YouTube</p>
            </div>
            
            <!-- Open Icon -->
            <IconUpload class="w-5 h-5 md:w-6 md:h-6 text-white/80 flex-shrink-0" />
          </a>
        </div>
      </div>
    </section>

    <!-- Back Button -->
    <div class="flex justify-end pt-2 md:pt-4">
      <button
        @click="router.push({ name: 'StudentMyCourses' })"
        class="flex items-center gap-1.5 md:gap-2 h-10 md:h-12 px-4 md:px-6 rounded-full bg-white border-2 border-blue-600 text-blue-600 text-sm md:text-base font-semibold shadow-sm hover:bg-blue-50 transition-all duration-200 cursor-pointer active:scale-95"
      >
        <IconArrowLeft class="w-4 h-4 md:w-5 md:h-5" />
        <span>Back</span>
      </button>
    </div>

    <!-- PDF Viewer Modal -->
    <Modal
      :show="showPdfModal"
      @close="closePdfModal"
      size="fullscreen"
      :hide-footer="true"
      title="Course Material"
      type="info"
      variant="gradient"
      gradient-from="blue-500"
      gradient-via="blue-600"
      gradient-to="indigo-600"
    >
      <template #content>
        <PDFViewer 
          v-if="selectedPdfUrl"
          :src="selectedPdfUrl"
        />
      </template>
    </Modal>
  </div>
</template>
