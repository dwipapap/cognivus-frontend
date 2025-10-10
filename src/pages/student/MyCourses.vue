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
const expandedVideos = ref(new Set());
const expandedCourses = ref(new Set());

/** Toggle course details */
const toggleCourse = (courseid) => {
  if (expandedCourses.value.has(courseid)) {
    expandedCourses.value.delete(courseid);
  } else {
    expandedCourses.value.add(courseid);
  }
};

/** Extract YouTube video ID from URL */
const getYouTubeId = (url) => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

/** Check if URL is a YouTube video */
const isYouTubeVideo = (url) => {
  return getYouTubeId(url) !== null;
};

/** Toggle video embed */
const toggleVideo = (courseid) => {
  if (expandedVideos.value.has(courseid)) {
    expandedVideos.value.delete(courseid);
  } else {
    expandedVideos.value.add(courseid);
  }
};

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
          <div 
            v-for="course in courses" 
            :key="course.courseid"
            class="relative bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
            @click="toggleCourse(course.courseid)"
          >
            <!-- Main Card Content -->
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
                <!-- TODO: Replace placeholder with actual course description from backend -->
                <p class="text-sm text-white/80 line-clamp-1 mb-2">
                  Study materials and resources for this course topic. Click to view available downloads and videos.
                </p>
                <p class="text-xs text-white/70">{{ formatDate(course.upload_date) }}</p>
              </div>

              <!-- Expand Icon -->
              <div class="flex-shrink-0">
                <svg 
                  class="w-6 h-6 text-white transition-transform duration-300 ease-in-out"
                  :class="{ 'rotate-180': expandedCourses.has(course.courseid) }"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
            </div>

            <!-- Expanded Actions -->
            <transition
              enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="max-h-0 opacity-0"
              enter-to-class="max-h-[500px] opacity-100"
              leave-active-class="transition-all duration-300 ease-in"
              leave-from-class="max-h-[500px] opacity-100"
              leave-to-class="max-h-0 opacity-0"
            >
              <div 
                v-if="expandedCourses.has(course.courseid)"
                class="bg-blue-700/30 backdrop-blur-sm border-t border-white/10 overflow-hidden"
                @click.stop
              >
                <div class="p-5">
                  <div class="flex flex-wrap gap-3 mb-4">
                    <a 
                      v-if="course.file" 
                      :href="course.file" 
                      target="_blank"
                      class="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-semibold shadow-md"
                    >
                      📄 Download File
                    </a>
                    
                    <template v-if="course.video_link">
                      <button 
                        v-if="isYouTubeVideo(course.video_link)"
                        @click="toggleVideo(course.courseid)"
                        class="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-semibold shadow-md"
                      >
                        🎥 {{ expandedVideos.has(course.courseid) ? 'Hide Video' : 'Watch Video' }}
                      </button>
                      <a 
                        v-else
                        :href="course.video_link" 
                        target="_blank"
                        class="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-semibold shadow-md"
                      >
                        🎥 Watch Video
                      </a>
                    </template>

                    <span v-if="course.course_code" class="px-3 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg text-sm font-medium">
                      Code: {{ course.course_code }}
                    </span>
                  </div>

                  <!-- YouTube Embed -->
                  <div 
                    v-if="course.video_link && isYouTubeVideo(course.video_link) && expandedVideos.has(course.courseid)"
                    class="mt-4 aspect-video rounded-xl overflow-hidden shadow-lg"
                  >
                    <iframe
                      :src="`https://www.youtube.com/embed/${getYouTubeId(course.video_link)}`"
                      class="w-full h-full"
                      frameborder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowfullscreen
                    ></iframe>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
