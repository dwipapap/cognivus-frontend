<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useStudentProfile } from '../../composables/useStudentProfile';
import { useClassDetails } from '../../composables/useClassDetails';
import { gradeAPI } from '../../services/api';
import LoadingBar from '../../components/ui/LoadingBar.vue';
import IconWarning from '~icons/basil/info-triangle-outline';
import IconUser from '~icons/basil/user-solid';
import IconChart from '~icons/basil/chart-pie-solid';
import IconCalendar from '~icons/basil/calendar-outline';
import IconDocument from '~icons/basil/document-solid';
import IconClose from '~icons/basil/cross-outline';
import IconInfo from '~icons/basil/info-circle-outline';

const { studentProfile, isLoading: isProfileLoading } = useStudentProfile();

// Use composable for class details to match MyCourses style
const classId = computed(() => studentProfile.value?.classid);
const { classInfo, levelName, lecturerName, isLoading: classLoading } = useClassDetails(classId);

const grades = ref([]);
const isLoadingGrades = ref(false);
const errorMessage = ref('');

/**
 * Calculate average score from all components
 */
const getAverageScore = (grade) => {
  const scores = [
    grade.listening_score,
    grade.speaking_score,
    grade.reading_score,
    grade.writing_score
  ].filter(s => s !== null && s !== undefined);
  
  if (scores.length === 0) return '-';
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return avg.toFixed(1);
};

/**
 * Format date to readable format
 */
const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Fetch grades for the current student
 */
const fetchGrades = async () => {
  if (!studentProfile.value?.studentid) {
    console.log('Student profile not loaded yet or missing studentid');
    return;
  }

  try {
    isLoadingGrades.value = true;
    errorMessage.value = '';
    
    const response = await gradeAPI.getGradeById(studentProfile.value.studentid);
    
    if (response.data.success) {
      grades.value = Array.isArray(response.data.data) 
        ? response.data.data 
        : [];
    } else {
      errorMessage.value = response.data.message || 'Failed to load grades';
    }
  } catch (error) {
    console.error('Error fetching grades:', error);
    errorMessage.value = 'Failed to load grades. Please try again later.';
    grades.value = [];
  } finally {
    isLoadingGrades.value = false;
  }
};

/**
 * Download certificate for a specific grade
 */
const handleDownloadCertificate = async (gradeId, testType) => {
  try {
    const response = await gradeAPI.downloadCertificate(gradeId);
    
    // Create blob URL from response
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    
    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `Certificate_${testType || 'Test'}.pdf`;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading certificate:', error);
    alert('Failed to download certificate. Please try again.');
  }
};

// Watch for studentProfile to be loaded, then fetch grades
watch(
  () => studentProfile.value?.studentid,
  (newStudentId) => {
    if (newStudentId) {
      fetchGrades();
    }
  },
  { immediate: true }
);

onMounted(() => {
  // If studentProfile is already loaded, fetch immediately
  if (studentProfile.value?.studentid) {
    fetchGrades();
  }
});
</script>

<template>
  <!-- Loading State -->
      <div v-if="isProfileLoading || isLoadingGrades || classLoading" class="max-w-2xl mx-auto py-20">
        <LoadingBar :loading="true" color="blue" :duration="2000" />
        <p class="text-center text-gray-500 mt-4">Loading your grades...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="errorMessage" class="bg-red-50 border border-red-100 rounded-2xl p-6 text-center max-w-2xl mx-auto">
        <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <IconWarning class="w-6 h-6 text-red-600" />
        </div>
        <h3 class="text-lg font-semibold text-red-900 mb-2">Error Loading Grades</h3>
        <p class="text-red-600 mb-6">{{ errorMessage }}</p>
        <button 
          @click="fetchGrades"
          class="px-6 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors shadow-sm"
        >
          Try Again
        </button>
      </div>

      <div v-else class="space-y-8 mb-8">
        <!-- Header Card (MyCourses Style) -->
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
              <h2 class="text-2xl md:text-3xl font-bold text-white mb-2">Academic Performance</h2>
              <h3 class="text-lg md:text-xl font-semibold text-white/90 mb-3">
                {{ levelName || 'Loading...' }} 
                <span v-if="classInfo?.class_code" class="opacity-75 mx-2">•</span> 
                {{ classInfo?.class_code }}
              </h3>
              <p class="text-sm text-white/80 max-w-2xl">
                Track your learning progress, view detailed test scores, and access your academic report files.
              </p>
            </div>

            <div class="flex flex-wrap gap-3">
              <!-- Lecturer Badge -->
              <div class="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
                <IconUser class="w-4 h-4 text-white/90" />
                <p class="text-white text-sm font-medium">{{ lecturerName || 'Instructor' }}</p>
              </div>

              <!-- Stats Badge -->
              <div v-if="grades.length > 0" class="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
                <IconChart class="w-4 h-4 text-white/90" />
                <p class="text-white text-sm font-medium">{{ grades.length }} Tests Recorded</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Grades Table Container -->
        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 md:p-6 shadow-sm hover:shadow-md transition-all duration-200">
          <div class="mb-4 md:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 class="text-xl md:text-2xl font-bold text-gray-900">Test Results</h2>
          </div>
          
          <!-- Empty State -->
          <div v-if="grades.length === 0" class="text-center py-12 px-4">
            <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <IconDocument class="w-10 h-10 text-blue-200" />
            </div>
            <h3 class="text-lg font-medium text-gray-900">No Grades Recorded Yet</h3>
            <p class="text-gray-500 mt-1 max-w-sm mx-auto">Your test scores and grades will appear here once they are recorded by your instructor.</p>
          </div>
          
          <template v-else>
            <!-- Mobile Card View -->
            <div class="block md:hidden space-y-4">
            <div 
              v-for="grade in grades" 
              :key="grade.gradeid"
              class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all"
            >
              <!-- Card Header -->
              <div class="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3">
                <h3 class="text-base font-semibold text-white">{{ grade.test_type || 'Standard Test' }}</h3>
                <p class="text-xs text-white/80 mt-1 flex items-center gap-1.5">
                  <IconCalendar class="w-3.5 h-3.5" />
                  {{ formatDate(grade.date_taken) }}
                </p>
              </div>

              <!-- Card Body -->
              <div class="p-4 space-y-3">
                <!-- Final Score Highlight -->
                <div class="flex items-center justify-between bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3">
                  <span class="text-sm font-medium text-gray-700">Final Score</span>
                  <span class="inline-flex items-center justify-center min-w-[3rem] h-10 px-3 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-lg shadow-md">
                    {{ getAverageScore(grade) }}
                  </span>
                </div>

                <!-- Individual Scores Grid -->
                <div class="grid grid-cols-2 gap-3">
                  <div class="bg-blue-50 rounded-lg p-3">
                    <p class="text-xs font-medium text-gray-600 mb-1">Listening</p>
                    <p class="text-lg font-bold text-blue-700">{{ grade.listening_score ?? '-' }}</p>
                  </div>
                  <div class="bg-sky-50 rounded-lg p-3">
                    <p class="text-xs font-medium text-gray-600 mb-1">Speaking</p>
                    <p class="text-lg font-bold text-sky-700">{{ grade.speaking_score ?? '-' }}</p>
                  </div>
                  <div class="bg-indigo-50 rounded-lg p-3">
                    <p class="text-xs font-medium text-gray-600 mb-1">Reading</p>
                    <p class="text-lg font-bold text-indigo-700">{{ grade.reading_score ?? '-' }}</p>
                  </div>
                  <div class="bg-cyan-50 rounded-lg p-3">
                    <p class="text-xs font-medium text-gray-600 mb-1">Writing</p>
                    <p class="text-lg font-bold text-cyan-700">{{ grade.writing_score ?? '-' }}</p>
                  </div>
                </div>

                <!-- Certificate Download -->
                <div class="pt-2 border-t border-gray-100">
                  <button
                    @click="handleDownloadCertificate(grade.gradeid, grade.test_type)"
                    class="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-all border border-blue-100 shadow-sm"
                  >
                    <IconDocument class="w-4 h-4" />
                    Download Certificate
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Desktop Table View -->
          <div class="hidden md:block overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
            <table class="min-w-full divide-y divide-gray-100">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Test Type</th>
                  <th class="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Listening</th>
                  <th class="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Speaking</th>
                  <th class="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Reading</th>
                  <th class="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Writing</th>
                  <th class="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Final Score</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Taken</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Certificate</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-100">
                <tr v-for="grade in grades" :key="grade.gradeid" class="hover:bg-gray-50 transition-colors group">
                  <td class="px-6 py-4">
                    <span class="font-medium text-gray-900 block">{{ grade.test_type || 'Standard Test' }}</span>
                  </td>
                  <td class="px-6 py-4 text-center text-sm text-gray-600">
                    <span class="inline-flex items-center justify-center w-12 h-8 rounded-lg bg-blue-50 text-blue-700 font-medium">
                      {{ grade.listening_score ?? '-' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-center text-sm text-gray-600">
                    <span class="inline-flex items-center justify-center w-12 h-8 rounded-lg bg-sky-50 text-sky-700 font-medium">
                      {{ grade.speaking_score ?? '-' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-center text-sm text-gray-600">
                    <span class="inline-flex items-center justify-center w-12 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-medium">
                      {{ grade.reading_score ?? '-' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-center text-sm text-gray-600">
                    <span class="inline-flex items-center justify-center w-12 h-8 rounded-lg bg-cyan-50 text-cyan-700 font-medium">
                      {{ grade.writing_score ?? '-' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <span class="inline-flex items-center justify-center min-w-[3rem] h-12 px-3 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-base shadow-md">
                      {{ getAverageScore(grade) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500">
                    <div class="flex items-center gap-2">
                      <IconCalendar class="w-4 h-4 text-gray-400" />
                      {{ formatDate(grade.date_taken) }}
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <button
                      @click="handleDownloadCertificate(grade.gradeid, grade.test_type)"
                      class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-all border border-blue-100 shadow-sm hover:shadow"
                    >
                      <IconDocument class="w-4 h-4" />
                      Download
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          </template>

          <!-- Summary Footer (optional) -->
          <div v-if="grades.length > 0" class="mt-4 flex items-center justify-between text-xs md:text-sm px-2">
            <div class="flex items-center gap-2 text-gray-600">
              <IconInfo class="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
              <span>Scores are updated by your instructor</span>
            </div>
          </div>
        </div>
      </div>
</template>
