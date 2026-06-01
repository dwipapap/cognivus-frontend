<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStudentProfile } from '../../composables/useStudentProfile';
import { useClassDetails } from '../../composables/useClassDetails';
import { courseAPI } from '../../services/api';
import { formatDate } from '../../utils/formatters';
import IconArrowRight from '~icons/basil/arrow-right-solid';
import IconBookOpen from '~icons/lucide/book-open';
import IconGraduationCap from '~icons/lucide/graduation-cap';
import IconFileText from '~icons/lucide/file-text';
import IconPenTool from '~icons/lucide/pen-tool';
import IconGlobe from '~icons/lucide/globe';

const courseIcons = [
  IconBookOpen,
  IconGraduationCap,
  IconFileText,
  IconPenTool,
  IconGlobe,
];

const getIconComponent = (index) => courseIcons[index % courseIcons.length];

const { studentProfile, isLoading: profileLoading, fetchStudentProfile } = useStudentProfile();

// Use composable for class details
const classId = computed(() => studentProfile.value?.classid);
const { classInfo, levelName, lecturerName, isLoading: classLoading, error: classError, retry: retryClass } = useClassDetails(classId);

const courses = ref([]);
const coursesLoading = ref(false);
const coursesError = ref(null);
const searchQuery = ref('');

const filteredCourses = computed(() => {
  if (!searchQuery.value) return courses.value;
  const q = searchQuery.value.toLowerCase();
  return courses.value.filter(course => course.title?.toLowerCase().includes(q));
});

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
  } finally {
    coursesLoading.value = false;
  }
};

// Fetch profile and courses on mount
onMounted(async () => {
  await fetchStudentProfile();
  if (classId.value) {
    fetchCourses();
  }
});

// Combined loading and error states
const isLoading = computed(() => profileLoading.value || classLoading.value || coursesLoading.value);
const errorMessage = computed(() => {
  if (!classId.value && !profileLoading.value) return 'No class assigned to your account.';
  return classError.value || coursesError.value;
});
</script>

<template>
  <div class="space-y-6">
    <!-- Class Info Card -->
    <div class="relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 md:p-8 shadow-lg overflow-hidden">
      <!-- Diagonal Book Graphics -->
      <div class="absolute top-0 right-0 w-1/2 h-full pointer-events-none overflow-hidden">
        <div class="absolute -top-10 -right-10 w-40 h-48 bg-blue-400/30 rounded-lg transform rotate-12"></div>
        <div class="absolute top-20 -right-5 w-32 h-40 bg-blue-300/40 rounded-lg transform rotate-12"></div>
        <div class="absolute top-40 right-10 w-28 h-36 bg-white/20 rounded-lg transform rotate-12"></div>
      </div>

      <!-- Content -->
      <div class="relative z-10">
        <p class="text-white/80 text-sm mb-1">{{ classInfo?.class_code || 'Class Code' }}</p>
        <h2 class="text-2xl md:text-3xl font-bold text-white mb-2">{{ levelName || 'Your Course Level' }}</h2>
        <p class="text-white/70 text-sm md:text-base max-w-md">
          {{ classInfo?.description || 'Access your course materials and learning resources' }}
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading || profileLoading" class="animate-pulse">
      <div class="rounded-2xl p-6 md:p-8 bg-blue-50 border border-blue-100 space-y-4">
        <div class="h-7 w-48 bg-blue-100 rounded"></div>
        <div class="h-16 w-full bg-blue-100 rounded-xl"></div>
        <div class="h-16 w-full bg-blue-100 rounded-xl"></div>
        <div class="h-16 w-full bg-blue-100 rounded-xl"></div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMessage" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <p class="text-red-800 mb-4">{{ errorMessage }}</p>
      <button v-if="classError" @click="retryClass"
        class="inline-flex items-center px-3 py-2 md:px-4 text-xs md:text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors mr-2">
        Retry Class Details
      </button>
      <button v-if="coursesError" @click="fetchCourses"
        class="inline-flex items-center px-3 py-2 md:px-4 text-xs md:text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
        Retry Courses
      </button>
    </div>

    <!-- Course List -->
    <div v-else
      class="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 border border-blue-100/80 rounded-2xl p-6 md:p-8 shadow-sm">
      <h2 class="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Course Materials</h2>

      <div v-if="filteredCourses.length === 0 && !searchQuery" class="py-12 text-center text-gray-500">
        <p class="font-medium text-gray-500">Your course materials will appear here once your lecturer uploads them.</p>
        <p class="text-sm text-gray-400 mt-2">Check back after your next class.</p>
      </div>
      <div v-else-if="filteredCourses.length === 0 && searchQuery" class="py-12 text-center text-gray-500">
        <p class="font-medium text-gray-500">No courses match "{{ searchQuery }}"</p>
        <p class="text-sm text-gray-400 mt-2">Try a different search term.</p>
      </div>

      <!-- Search -->
      <div class="mb-4 md:mb-6">
        <UInput
          v-model="searchQuery"
          icon="i-lucide-search"
          placeholder="Search courses..."
          size="lg"
          class="w-full"
        />
      </div>

      <!-- Course Rows -->
      <div v-if="filteredCourses.length > 0" class="space-y-2 md:space-y-3">
        <router-link
          v-for="(course, index) in filteredCourses"
          :key="course.courseid"
          :to="{ name: 'StudentCourseDetail', params: { id: course.courseid } }"
          class="flex items-center gap-3 md:gap-4 p-4 md:p-5 rounded-xl shadow-md border border-white/20 bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
        >
          <!-- Icon from Nuxt UI lucide set -->
          <div class="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center shadow-inner">
            <component :is="getIconComponent(index)" class="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <h3 class="text-sm md:text-base font-semibold md:font-bold text-white mb-0.5 truncate">{{ course.title }}</h3>
            <p class="text-xs text-white/70">{{ formatDate(course.upload_date) }}</p>
          </div>

          <!-- Arrow -->
          <div class="flex-shrink-0 text-white/50">
            <IconArrowRight class="w-5 h-5 md:w-6 md:h-6" />
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>
