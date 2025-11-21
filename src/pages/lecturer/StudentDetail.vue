<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { studentAPI, gradeAPI } from '../../services/api';
import LoadingBar from '../../components/ui/LoadingBar.vue';
import BaseButton from '../../components/ui/BaseButton.vue';

const route = useRoute();
const router = useRouter();
const studentId = route.params.id;

const student = ref(null);
const grades = ref([]);
const transactions = ref([]);
const isLoading = ref(true);
const errorMessage = ref('');

/** Get gender display */
const getGenderDisplay = (code) => {
  if (code === 'L') return 'Male';
  if (code === 'F') return 'Female';
  return '-';
};

/** Format date */
const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/** Calculate average score */
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

/** Get initials for avatar */
const getInitials = (name) => {
  if (!name) return 'ST';
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

/**
 * Fetch student profile and grades.
 * Grades fetched separately since they depend on studentid.
 */
const fetchStudentData = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = '';
    
    // Get student profile
    const studentResponse = await studentAPI.getStudentById(studentId);
    
    if (!studentResponse.data.success) {
      errorMessage.value = 'Student not found';
      return;
    }
    
    student.value = studentResponse.data.data;
    
    // Fetch grades (student can have multiple test attempts)
    if (student.value.studentid) {
      try {
        const gradesResponse = await gradeAPI.getGradeById(student.value.studentid);
        if (gradesResponse.data.success) {
          grades.value = Array.isArray(gradesResponse.data.data) 
            ? gradesResponse.data.data 
            : [];
        }
      } catch (error) {
        console.error('Error fetching grades:', error);
        // Don't block page load if grades fail
        grades.value = [];
      }
    }
    
    // TODO: Fetch transactions when endpoint is available
    transactions.value = [];
  } catch (error) {
    errorMessage.value = 'Failed to load student data';
    console.error('Error fetching student:', error);
  } finally {
    isLoading.value = false;
  }
};

/** Navigate back */
const goBack = () => {
  router.push({ name: 'LecturerStudents' });
};

onMounted(() => {
  fetchStudentData();
});
</script>

<template>
  <!-- Header -->
  <div class="mb-8">
        <button
          @click="goBack"
          class="mb-6 inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-white bg-blue-50 hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 rounded-full font-medium transition-all hover:shadow-md"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Students
        </button>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="max-w-2xl mx-auto py-20">
        <LoadingBar :loading="true" color="blue" :duration="2000" />
      </div>

      <!-- Error -->
      <div v-else-if="errorMessage" class="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
        <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-red-900 mb-2">Error Loading Data</h3>
        <p class="text-red-600 mb-6">{{ errorMessage }}</p>
        <BaseButton 
          variant="danger"
          @click="fetchStudentData"
        >
          Try Again
        </BaseButton>
      </div>

      <!-- Content -->
      <div v-else-if="student" class="space-y-8">
        
        <!-- Top Grid: Info & Payments -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <!-- Student Information Card -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <!-- Decorative Header -->
            <div class="h-24 bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden">
              <div class="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
              <div class="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div class="absolute top-0 left-0 w-full h-full bg-[url('/patterns/circuit.svg')] opacity-10"></div>
            </div>
            
            <div class="px-8 pb-8">
              <div class="relative flex justify-between items-end -mt-12 mb-6">
                <div class="w-24 h-24 rounded-2xl border-4 border-white bg-white shadow-lg flex items-center justify-center text-3xl font-bold text-indigo-600 bg-gradient-to-br from-indigo-50 to-blue-50">
                  {{ getInitials(student.fullname) }}
                </div>
                <span class="mb-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full border border-blue-100">
                  Student
                </span>
              </div>

              <div class="mb-8">
                <h2 class="text-2xl font-bold text-gray-900">{{ student.fullname }}</h2>
                <div class="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span class="flex items-center gap-1.5">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    {{ student.tbuser?.email || 'No email' }}
                  </span>
                  <span class="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span class="flex items-center gap-1.5">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                    {{ student.phone || 'No phone' }}
                  </span>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Gender</label>
                  <p class="text-gray-900 font-medium">{{ getGenderDisplay(student.gender) }}</p>
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Birth Date</label>
                  <p class="text-gray-900 font-medium">{{ formatDate(student.birthdate) }}</p>
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Birth Place</label>
                  <p class="text-gray-900 font-medium">{{ student.birthplace || '-' }}</p>
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Address</label>
                  <p class="text-gray-900 font-medium truncate" :title="student.address">{{ student.address || '-' }}</p>
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Payment Type</label>
                  <p class="text-gray-900 font-medium">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {{ student.payment_type || 'Standard' }}
                    </span>
                  </p>
                </div>
              </div>

              <div class="mt-8 pt-6 border-t border-gray-100">
                <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                  Parent Information
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div class="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <label class="text-xs text-gray-500 block mb-1">Parent Name</label>
                    <p class="font-semibold text-gray-900">{{ student.parentname || '-' }}</p>
                  </div>
                  <div class="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <label class="text-xs text-gray-500 block mb-1">Parent Phone</label>
                    <p class="font-semibold text-gray-900">{{ student.parentphone || '-' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment History Card -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
            <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
              <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Payment History
              </h2>
              <span class="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-200 shadow-sm">
                {{ transactions.length }} Records
              </span>
            </div>
            
            <div class="flex-1 overflow-hidden flex flex-col">
              <div v-if="transactions.length === 0" class="flex-1 flex flex-col items-center justify-center py-12 text-center px-4">
                <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
                </div>
                <p class="text-gray-500 font-medium">No payment records found</p>
                <p class="text-sm text-gray-400 mt-1">Transactions will appear here once processed.</p>
              </div>
              
              <div v-else class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-100">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                      <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                      <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-100">
                    <tr v-for="transaction in transactions" :key="transaction.transactionid" class="hover:bg-gray-50 transition-colors">
                      <td class="px-6 py-4 text-sm font-medium text-gray-900 font-mono">#{{ transaction.transactionid }}</td>
                      <td class="px-6 py-4 text-sm text-gray-600">{{ formatDate(transaction.transaction_date) }}</td>
                      <td class="px-6 py-4">
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-green-50 text-green-700 border border-green-100">
                          <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          Completed
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Grades Section -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/30">
            <div>
              <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                Academic Performance
              </h2>
              <p class="text-sm text-gray-500 mt-1">Test scores and progress reports</p>
            </div>
            <BaseButton
              variant="primary"
              @click="router.push({ name: 'AddGrade', params: { userid: studentId } })"
            >
              <template #icon>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </template>
              Add New Grade
            </BaseButton>
          </div>
          
          <div v-if="grades.length === 0" class="text-center py-16 px-4">
            <div class="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-10 h-10 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900">No grades recorded</h3>
            <p class="text-gray-500 mt-1 max-w-sm mx-auto">Start by adding a new grade entry for this student to track their progress.</p>
          </div>
          
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-100">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Test Type</th>
                  <th class="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Listening</th>
                  <th class="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Speaking</th>
                  <th class="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Reading</th>
                  <th class="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Writing</th>
                  <th class="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Average</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Report</th>
                  <th class="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-100">
                <tr v-for="grade in grades" :key="grade.gradeid" class="hover:bg-gray-50 transition-colors group">
                  <td class="px-6 py-4">
                    <span class="font-medium text-gray-900 block">{{ grade.test_type }}</span>
                  </td>
                  <td class="px-6 py-4 text-center text-sm text-gray-600">{{ grade.listening_score || '-' }}</td>
                  <td class="px-6 py-4 text-center text-sm text-gray-600">{{ grade.speaking_score || '-' }}</td>
                  <td class="px-6 py-4 text-center text-sm text-gray-600">{{ grade.reading_score || '-' }}</td>
                  <td class="px-6 py-4 text-center text-sm text-gray-600">{{ grade.writing_score || '-' }}</td>
                  <td class="px-6 py-4 text-center">
                    <span class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-700 font-bold text-sm border border-blue-100">
                      {{ getAverageScore(grade) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500">{{ formatDate(grade.date_taken) }}</td>
                  <td class="px-6 py-4">
                    <a
                      v-if="grade.tbreport_files && grade.tbreport_files.length > 0"
                      :href="grade.tbreport_files[0].url"
                      target="_blank"
                      class="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                    >
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/></svg>
                      View PDF
                    </a>
                    <span v-else class="text-xs text-gray-400 italic">No file</span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <BaseButton
                      size="sm"
                      variant="secondary"
                      rounded="lg"
                      @click="router.push({ name: 'EditGrade', params: { userid: studentId, gradeid: grade.gradeid } })"
                    >
                      Edit
                    </BaseButton>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
</template>
