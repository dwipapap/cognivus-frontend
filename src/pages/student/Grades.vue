<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useStudentProfile } from '../../composables/useStudentProfile';
import { useClassDetails } from '../../composables/useClassDetails';
import { useToast } from '@nuxt/ui/composables';
import { gradeAPI, readBlobErrorMessage } from '../../services/api';
import Modal from '../../components/ui/Modal.vue';
import IconWarning from '~icons/basil/info-triangle-outline';
import IconUser from '~icons/basil/user-solid';
import IconChart from '~icons/basil/chart-pie-solid';
import IconCalendar from '~icons/basil/calendar-outline';
import IconDocument from '~icons/basil/document-solid';
import IconHeadphone from '~icons/basil/headphone-solid';
import IconChat from '~icons/basil/chat-solid';
import IconBook from '~icons/basil/book-solid';
import IconBookCheck from '~icons/basil/book-check-solid';
import IconBookOpen from '~icons/basil/book-open-solid';
import IconAward from '~icons/basil/award-solid';
import IconClose from '~icons/basil/cross-outline';
import IconInfo from '~icons/basil/info-circle-outline';
import IconLock from '~icons/lucide/lock';
import { formatDate, getAverageScore } from '../../utils/formatters';
import PageHeaderCard from '../../components/student/PageHeaderCard.vue';

const toast = useToast();

const { studentProfile, isLoading: isProfileLoading, fetchStudentProfile } = useStudentProfile();

// Use composable for class details to match MyCourses style
const classId = computed(() => studentProfile.value?.classid);
const { classInfo, isPlaceholderClass, levelName, lecturerName, isLoading: classLoading } = useClassDetails(classId);

const showGuardModal = ref(false);

watch(isPlaceholderClass, (val) => {
  if (val) {
    showGuardModal.value = true;
  }
});

const grades = ref([]);
const isLoadingGrades = ref(false);
const errorMessage = ref('');

const getFinalScoreClass = (grade) => {
  const score = getAverageScore(grade);

  if (score >= 85) return 'bg-emerald-600 ring-emerald-100';
  if (score >= 70) return 'bg-blue-600 ring-blue-100';
  if (score >= 60) return 'bg-amber-500 ring-amber-100';
  return 'bg-red-600 ring-red-100';
};

const getScoreStatus = (score) => {
  if (score === null || score === undefined) return { label: 'N/A', class: 'bg-gray-100 text-gray-500' };
  if (score >= 85) return { label: 'Excellent', class: 'bg-emerald-50 text-emerald-700' };
  if (score >= 75) return { label: 'Very Good', class: 'bg-blue-50 text-blue-700' };
  if (score >= 60) return { label: 'Good', class: 'bg-amber-50 text-amber-700' };
  return { label: 'Poor', class: 'bg-red-50 text-red-700' };
};

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

const isDownloadingCertificate = ref(false);

/**
 * Download certificate for a specific grade
 */
const handleDownloadCertificate = async (gradeId, testType) => {
  try {
    isDownloadingCertificate.value = true;
    const response = await gradeAPI.downloadCertificate(gradeId);

    // Parse filename from Content-Disposition header if available
    let filename = `Certificate_${testType || 'Test'}.pdf`;
    const contentDisposition = response.headers?.['content-disposition'];
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      if (filenameMatch && filenameMatch.length === 2) {
        filename = filenameMatch[1];
      }
    }

    // Create blob URL from response
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);

    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading certificate:', error);
    toast.add({
      title: 'Certificate unavailable',
      description: await readBlobErrorMessage(error, 'Failed to download certificate. Please try again.'),
      color: 'error'
    });
  } finally {
    isDownloadingCertificate.value = false;
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

    <!-- Teaser State -->
    <div v-else-if="isPlaceholderClass" class="bg-transparent p-0 md:bg-white md:border md:border-gray-200 md:rounded-lg md:p-8 md:shadow-sm relative overflow-hidden">
      <div class="mb-4 md:mb-6">
        <h2 class="text-xl md:text-2xl font-bold text-gray-900">Test Results</h2>
      </div>

      <div class="blur-[4px] opacity-60 pointer-events-none space-y-4">
        <!-- Mock rows -->
        <div v-for="i in 3" :key="i" class="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between shadow-sm">
           <div class="flex items-center gap-3">
             <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
               <IconDocument class="w-5 h-5" />
             </div>
             <div>
               <div class="h-4 w-32 bg-gray-200 rounded mb-2"></div>
               <div class="h-3 w-20 bg-gray-100 rounded"></div>
             </div>
           </div>
           <div class="w-12 h-12 bg-gray-200 rounded-full"></div>
        </div>
      </div>
      
      <div class="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/30 backdrop-blur-[2px]">
        <router-link
            to="/student/payment"
            class="inline-flex items-center gap-2 rounded-full border border-blue-600 bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-colors duration-200 hover:bg-blue-700 hover:border-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
            <IconLock class="w-4 h-4" />
            Unlock Grades
        </router-link>
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
    <div v-else class="bg-transparent p-0 md:bg-white md:border md:border-gray-200 md:rounded-lg md:p-8 md:shadow-sm md:hover:shadow-md md:transition-all md:duration-200">
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
            <div class="block md:hidden space-y-3">
              <article
                v-for="grade in grades"
                :key="grade.gradeid"
                class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
              >
                <div class="p-4">
                  <div class="flex items-center justify-between gap-3 pb-3 border-b border-gray-100">
                    <div class="flex items-center gap-3 min-w-0">
                      <span class="w-11 h-11 shrink-0 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                        <IconDocument class="w-5 h-5" />
                      </span>
                      <div class="min-w-0">
                        <h3 class="text-base font-semibold text-gray-900 truncate">{{ grade.test_type || 'Standard Test' }}</h3>
                        <p class="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                          <IconCalendar class="w-3.5 h-3.5" />
                          {{ formatDate(grade.date_taken) }}
                        </p>
                      </div>
                    </div>
                    <div class="shrink-0 text-center">
                      <span class="block text-[10px] font-medium text-gray-500 mb-1">Final Score</span>
                      <span
                        class="inline-flex items-center justify-center w-12 h-12 rounded-full text-white font-bold text-lg ring-4"
                        :class="getFinalScoreClass(grade)"
                      >
                        {{ getAverageScore(grade) }}
                      </span>
                      <button
                        @click="handleDownloadCertificate(grade.gradeid, grade.test_type)"
                        :disabled="isDownloadingCertificate"
                        class="text-[10px] font-medium text-blue-600 hover:text-blue-800 underline block text-center mt-1"
                      >
                        Download Certificate
                      </button>
                    </div>
                  </div>

                  <div class="grid grid-cols-3 mt-3">
                    <div class="pr-3 pb-3 border-r border-b border-gray-100">
                      <div class="flex items-center gap-2">
                        <span class="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><IconHeadphone class="w-3.5 h-3.5" /></span>
                        <div><p class="text-[10px] font-medium text-gray-500">Listening</p><p class="text-base leading-none font-semibold text-gray-900">{{ grade.listening_score ?? '-' }}</p></div>
                      </div>
                    </div>
                    <div class="px-3 pb-3 border-r border-b border-gray-100">
                      <div class="flex items-center gap-2">
                        <span class="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><IconChat class="w-3.5 h-3.5" /></span>
                        <div><p class="text-[10px] font-medium text-gray-500">Speaking</p><p class="text-base leading-none font-semibold text-gray-900">{{ grade.speaking_score ?? '-' }}</p></div>
                      </div>
                    </div>
                    <div class="pl-3 pb-3 border-b border-gray-100">
                      <div class="flex items-center gap-2">
                        <span class="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><IconBook class="w-3.5 h-3.5" /></span>
                        <div><p class="text-[10px] font-medium text-gray-500">Reading</p><p class="text-base leading-none font-semibold text-gray-900">{{ grade.reading_score ?? '-' }}</p></div>
                      </div>
                    </div>
                    <div class="pt-3 pr-3 border-r border-gray-100">
                      <div class="flex items-center gap-2">
                        <span class="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><IconDocument class="w-3.5 h-3.5" /></span>
                        <div><p class="text-[10px] font-medium text-gray-500">Writing</p><p class="text-base leading-none font-semibold text-gray-900">{{ grade.writing_score ?? '-' }}</p></div>
                      </div>
                    </div>
                    <div class="pt-3 px-3 border-r border-gray-100">
                      <div class="flex items-center gap-2">
                        <span class="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><IconBookCheck class="w-3.5 h-3.5" /></span>
                        <div><p class="text-[10px] font-medium text-gray-500">Grammar</p><p class="text-base leading-none font-semibold text-gray-900">{{ grade.grammar_score ?? '-' }}</p></div>
                      </div>
                    </div>
                    <div class="pt-3 pl-3">
                      <div class="flex items-center gap-2">
                        <span class="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><IconBookOpen class="w-3.5 h-3.5" /></span>
                        <div><p class="text-[10px] font-medium text-gray-500">Vocabulary</p><p class="text-base leading-none font-semibold text-gray-900">{{ grade.vocabulary_score ?? '-' }}</p></div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </div>

          <!-- Desktop Table View -->
          <div class="hidden md:block overflow-x-auto bg-white rounded-lg border border-gray-100">
            <table class="min-w-[1080px] w-full divide-y divide-gray-100">
              <thead class="bg-gray-50/80">
                <tr>
                  <th class="px-4 py-5 text-left text-sm font-semibold text-gray-700"><span class="inline-flex items-center gap-2 whitespace-nowrap"><IconDocument class="w-5 h-5 text-blue-600" />Test</span></th>
                  <th class="px-3 py-5 text-center text-sm font-semibold text-gray-700"><span class="inline-flex items-center gap-2 whitespace-nowrap"><IconHeadphone class="w-5 h-5 text-blue-600" />Listening</span></th>
                  <th class="px-3 py-5 text-center text-sm font-semibold text-gray-700"><span class="inline-flex items-center gap-2 whitespace-nowrap"><IconChat class="w-5 h-5 text-blue-600" />Speaking</span></th>
                  <th class="px-3 py-5 text-center text-sm font-semibold text-gray-700"><span class="inline-flex items-center gap-2 whitespace-nowrap"><IconBook class="w-5 h-5 text-blue-600" />Reading</span></th>
                  <th class="px-3 py-5 text-center text-sm font-semibold text-gray-700"><span class="inline-flex items-center gap-2 whitespace-nowrap"><IconDocument class="w-5 h-5 text-blue-600" />Writing</span></th>
                  <th class="px-3 py-5 text-center text-sm font-semibold text-gray-700"><span class="inline-flex items-center gap-2 whitespace-nowrap"><IconBookCheck class="w-5 h-5 text-blue-600" />Grammar</span></th>
                  <th class="px-3 py-5 text-center text-sm font-semibold text-gray-700"><span class="inline-flex items-center gap-2 whitespace-nowrap"><IconBookOpen class="w-5 h-5 text-blue-600" />Vocabulary</span></th>
                  <th class="px-3 py-5 text-center text-sm font-semibold text-gray-700"><span class="inline-flex items-center gap-2 whitespace-nowrap"><IconAward class="w-5 h-5 text-amber-500" />Final Score</span></th>
                  <th class="px-4 py-5 text-left text-sm font-semibold text-gray-700"><span class="inline-flex items-center gap-2 whitespace-nowrap"><IconCalendar class="w-5 h-5 text-gray-500" />Date Taken</span></th>
                  <th class="px-4 py-5 text-left text-sm font-semibold text-gray-700"><span class="inline-flex items-center gap-2 whitespace-nowrap"><IconAward class="w-5 h-5 text-blue-600" />Certificate</span></th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-100">
                <tr v-for="grade in grades" :key="grade.gradeid" class="hover:bg-gray-50/70 transition-colors">
                  <td class="px-4 py-5">
                    <div class="flex items-center gap-3">
                      <span class="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><IconDocument class="w-5 h-5" /></span>
                      <div><span class="font-semibold text-gray-900 block">{{ grade.test_type || 'Standard Test' }}</span><span class="text-xs text-gray-500 mt-1 block">{{ formatDate(grade.date_taken) }}</span></div>
                    </div>
                  </td>
                  <td class="px-3 py-5 text-center"><p class="text-base font-semibold text-gray-900">{{ grade.listening_score ?? '-' }}</p></td>
                  <td class="px-3 py-5 text-center"><p class="text-base font-semibold text-gray-900">{{ grade.speaking_score ?? '-' }}</p></td>
                  <td class="px-3 py-5 text-center"><p class="text-base font-semibold text-gray-900">{{ grade.reading_score ?? '-' }}</p></td>
                  <td class="px-3 py-5 text-center"><p class="text-base font-semibold text-gray-900">{{ grade.writing_score ?? '-' }}</p></td>
                  <td class="px-3 py-5 text-center"><p class="text-base font-semibold text-gray-900">{{ grade.grammar_score ?? '-' }}</p></td>
                  <td class="px-3 py-5 text-center"><p class="text-base font-semibold text-gray-900">{{ grade.vocabulary_score ?? '-' }}</p></td>
                  <td class="px-3 py-5 text-center align-middle">
                    <div class="flex flex-col items-center">
                    <span class="inline-flex items-center justify-center w-12 h-12 rounded-full text-lg font-bold text-white ring-2" :class="getFinalScoreClass(grade)">{{ getAverageScore(grade) }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-5 text-sm text-gray-500">
                    <div class="flex items-center gap-2">
                      <IconCalendar class="w-4 h-4 text-gray-400" />
                      {{ formatDate(grade.date_taken) }}
                    </div>
                  </td>
                  <td class="px-4 py-5">
                    <button
                      @click="handleDownloadCertificate(grade.gradeid, grade.test_type)"
                      :disabled="isDownloadingCertificate"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 hover:text-blue-800 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      <IconAward class="w-3.5 h-3.5" />
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
    <Modal
      alert
      responsiveDrawer
      :show="showGuardModal"
      type="warning"
      title="Feature Unavailable"
      message="Grades are not available because you are not enrolled in any class yet. Join a program to get started."
      @close="showGuardModal = false"
      @confirm="showGuardModal = false"
    />
  </div>
</template>
