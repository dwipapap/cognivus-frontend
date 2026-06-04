<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useStudentProfile } from '../../composables/useStudentProfile';
import { useClassDetails } from '../../composables/useClassDetails';
import { gradeAPI } from '../../services/api';
import IconWarning from '~icons/basil/info-triangle-outline';
import IconUser from '~icons/basil/user-solid';
import IconChart from '~icons/basil/chart-pie-solid';
import IconCalendar from '~icons/basil/calendar-outline';
import IconDocument from '~icons/basil/document-solid';
import IconClose from '~icons/basil/cross-outline';
import IconInfo from '~icons/basil/info-circle-outline';
import { formatDate, getAverageScore } from '../../utils/formatters';
import PageHeaderCard from '../../components/student/PageHeaderCard.vue';

const { studentProfile, isLoading: isProfileLoading, fetchStudentProfile } = useStudentProfile();

// Use composable for class details to match MyCourses style
const classId = computed(() => studentProfile.value?.classid);
const { classInfo, levelName, lecturerName, isLoading: classLoading } = useClassDetails(classId);

const grades = ref([]);
const isLoadingGrades = ref(false);
const errorMessage = ref('');

const fetchGrades = async () => {
  if (!studentProfile.value?.studentid) {
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
  fetchStudentProfile();
  // If studentProfile is already loaded, fetch immediately
  if (studentProfile.value?.studentid) {
    fetchGrades();
  }
});
</script>

<template>
  <div class="space-y-8 mb-8">
    <!-- Header Card -->
    <PageHeaderCard
      :eyebrow="classInfo?.class_code ? classInfo.class_code : 'Academic Performance'"
      :title="levelName || 'Loading...'"
      description="Track your learning progress and report files."
      :show-decoration="true"
    />

    <!-- Loading State -->
    <div v-if="isProfileLoading || isLoadingGrades || classLoading" class="animate-pulse">
      <div class="bg-blue-50 border border-blue-100 rounded-lg p-6 md:p-8 space-y-4">
        <div class="h-8 w-44 bg-blue-100 rounded"></div>
        <div class="h-16 w-full bg-white rounded-lg"></div>
        <div class="h-16 w-full bg-white rounded-lg"></div>
        <div class="h-16 w-full bg-white rounded-lg"></div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMessage" class="bg-red-50 border border-red-100 rounded-lg p-6 text-center max-w-2xl mx-auto">
      <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <IconWarning class="w-6 h-6 text-red-600" />
      </div>
      <h3 class="text-lg font-semibold text-red-900 mb-2">Error Loading Grades</h3>
      <p class="text-red-600 mb-6">{{ errorMessage }}</p>
      <button
        @click="fetchGrades"
        class="px-6 py-2.5 bg-red-600 text-white font-medium rounded-full hover:bg-red-700 transition-colors shadow-sm"
      >
        Try Again
      </button>
    </div>

    <!-- Grades Table Container -->
    <div v-else class="bg-white border border-gray-200 rounded-lg p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-200">
      <div class="mb-4 md:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 class="text-xl md:text-2xl font-bold text-gray-900">Test Results</h2>
      </div>

          <!-- Empty State -->
          <div v-if="grades.length === 0" class="text-center py-12 px-4">
            <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconDocument class="w-10 h-10 text-gray-400" />
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
              class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div class="p-4 space-y-4">
                <!-- Header & Final Score -->
                <div class="flex items-start justify-between">
                  <div>
                    <h3 class="text-base font-semibold text-gray-900">{{ grade.test_type || 'Standard Test' }}</h3>
                    <p class="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                      <IconCalendar class="w-4 h-4" />
                      {{ formatDate(grade.date_taken) }}
                    </p>
                  </div>
                  <div class="flex flex-col items-end">
                    <span class="text-xs font-medium text-gray-500 mb-1">Final Score</span>
                    <span class="inline-flex items-center justify-center min-w-[3rem] h-8 px-3 rounded-full bg-blue-600 text-white font-bold text-sm shadow-sm">
                      {{ getAverageScore(grade) }}
                    </span>
                  </div>
                </div>

                <!-- Individual Scores Grid -->
                <div class="grid grid-cols-2 gap-y-4 border-t border-b border-gray-100 py-4">
                  <div>
                    <p class="text-xs font-medium text-gray-500 mb-0.5">Listening</p>
                    <p class="text-base font-semibold text-gray-900">{{ grade.listening_score ?? '-' }}</p>
                  </div>
                  <div>
                    <p class="text-xs font-medium text-gray-500 mb-0.5">Speaking</p>
                    <p class="text-base font-semibold text-gray-900">{{ grade.speaking_score ?? '-' }}</p>
                  </div>
                  <div>
                    <p class="text-xs font-medium text-gray-500 mb-0.5">Reading</p>
                    <p class="text-base font-semibold text-gray-900">{{ grade.reading_score ?? '-' }}</p>
                  </div>
                  <div>
                    <p class="text-xs font-medium text-gray-500 mb-0.5">Writing</p>
                    <p class="text-base font-semibold text-gray-900">{{ grade.writing_score ?? '-' }}</p>
                  </div>
                </div>

                <!-- Certificate Download -->
                <button
                  @click="handleDownloadCertificate(grade.gradeid, grade.test_type)"
                  class="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
                >
                  <IconDocument class="w-4 h-4" />
                  Download Certificate
                </button>
              </div>
            </div>
          </div>

          <!-- Desktop Table View -->
          <div class="hidden md:block overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-100">
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
                    <span class="inline-flex items-center justify-center w-12 h-8 rounded-lg bg-gray-50 border border-gray-100 text-gray-700 font-medium">
                      {{ grade.listening_score ?? '-' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-center text-sm text-gray-600">
                    <span class="inline-flex items-center justify-center w-12 h-8 rounded-lg bg-gray-50 border border-gray-100 text-gray-700 font-medium">
                      {{ grade.speaking_score ?? '-' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-center text-sm text-gray-600">
                    <span class="inline-flex items-center justify-center w-12 h-8 rounded-lg bg-gray-50 border border-gray-100 text-gray-700 font-medium">
                      {{ grade.reading_score ?? '-' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-center text-sm text-gray-600">
                    <span class="inline-flex items-center justify-center w-12 h-8 rounded-lg bg-gray-50 border border-gray-100 text-gray-700 font-medium">
                      {{ grade.writing_score ?? '-' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <span class="inline-flex items-center justify-center min-w-[3rem] h-10 px-3 rounded-full bg-blue-600 text-white font-bold text-base shadow-sm">
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
                      class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 hover:text-blue-700 transition-all border border-blue-100 shadow-sm hover:shadow"
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
          <div v-if="grades.length > 0" class="mt-6 flex items-center justify-between text-xs md:text-sm px-2">
            <div class="flex items-center gap-2 text-gray-500">
              <IconInfo class="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
              <span>Scores are updated by your instructor</span>
            </div>
          </div>
        </div>
      </div>
</template>
