<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useStudentProfile } from '../../composables/useStudentProfile';
import { useClassDetails } from '../../composables/useClassDetails';
import { gradeAPI } from '../../services/api';
import LoadingBar from '../../components/ui/LoadingBar.vue';

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
  <div class="min-h-screen bg-gray-50/50 pb-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- Loading State -->
      <div v-if="isProfileLoading || isLoadingGrades || classLoading" class="max-w-2xl mx-auto py-20">
        <LoadingBar :loading="true" color="blue" :duration="2000" />
        <p class="text-center text-gray-500 mt-4">Loading your grades...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="errorMessage" class="bg-red-50 border border-red-100 rounded-2xl p-6 text-center max-w-2xl mx-auto">
        <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
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

      <div v-else class="space-y-6">
        <!-- Header Card (MyCourses Style) -->
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
              <h2 class="text-3xl font-bold text-white mb-2">Academic Performance</h2>
              <h3 class="text-xl font-semibold text-white/90 mb-3">
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
                <svg class="w-4 h-4 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p class="text-white text-sm font-medium">{{ lecturerName || 'Instructor' }}</p>
              </div>

              <!-- Stats Badge -->
              <div v-if="grades.length > 0" class="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
                <svg class="w-4 h-4 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p class="text-white text-sm font-medium">{{ grades.length }} Tests Recorded</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Grades Table Container -->
        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
          <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 class="text-2xl font-bold text-gray-900">Test Results</h2>
          </div>
          
          <!-- Empty State -->
          <div v-if="grades.length === 0" class="text-center py-12 px-4">
            <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <svg class="w-10 h-10 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900">No Grades Recorded Yet</h3>
            <p class="text-gray-500 mt-1 max-w-sm mx-auto">Your test scores and grades will appear here once they are recorded by your instructor.</p>
          </div>
          
          <!-- Grades Table -->
          <div v-else class="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
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
                    <span class="inline-flex items-center justify-center w-12 h-8 rounded-lg bg-green-50 text-green-700 font-medium">
                      {{ grade.speaking_score ?? '-' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-center text-sm text-gray-600">
                    <span class="inline-flex items-center justify-center w-12 h-8 rounded-lg bg-purple-50 text-purple-700 font-medium">
                      {{ grade.reading_score ?? '-' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-center text-sm text-gray-600">
                    <span class="inline-flex items-center justify-center w-12 h-8 rounded-lg bg-orange-50 text-orange-700 font-medium">
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
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {{ formatDate(grade.date_taken) }}
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <a
                      v-if="grade.tbreport_files && grade.tbreport_files.length > 0"
                      :href="grade.tbreport_files[0].url"
                      target="_blank"
                      class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-all border border-blue-100 shadow-sm hover:shadow"
                    >
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
                      </svg>
                      Download
                    </a>
                    <span v-else class="inline-flex items-center gap-1.5 text-xs text-gray-400 italic">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      No file
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Summary Footer (optional) -->
          <div v-if="grades.length > 0" class="mt-4 flex items-center justify-between text-sm px-2">
            <div class="flex items-center gap-2 text-gray-600">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Scores are updated by your instructor</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
