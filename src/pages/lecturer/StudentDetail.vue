<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { studentAPI, gradeAPI } from '../../services/api';

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

/** Fetch grades by studentid */
const fetchGrades = async (studentid) => {
  try {
    const response = await gradeAPI.getGradeById(studentid);
    if (response.data.success) {
      grades.value = response.data.data || [];
    }
  } catch (error) {
    console.error('Error fetching grades:', error);
    grades.value = [];
  }
};

/** Fetch student data */
const fetchStudentData = async () => {
  try {
    isLoading.value = true;
    const response = await studentAPI.getStudentById(studentId);
    
    if (response.data.success) {
      student.value = response.data.data;
      
      // Fetch grades using studentid
      if (student.value.studentid) {
        await fetchGrades(student.value.studentid);
      }
      
      // TODO: Fetch transactions when endpoint is available
      transactions.value = [];
    } else {
      errorMessage.value = 'Student not found';
    }
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
  <div class="max-w-7xl mx-auto px-4 py-8">
    <!-- Back Button -->
    <button
      @click="goBack"
      class="mb-6 inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
    >
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Back to Students
    </button>

    <h1 class="text-4xl font-bold text-gray-900 mb-8">Student Details</h1>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error -->
    <div v-else-if="errorMessage" class="bg-red-50 border border-red-200 rounded-xl p-4">
      <p class="text-red-800">{{ errorMessage }}</p>
    </div>

    <!-- Content -->
    <div v-else-if="student" class="space-y-6">
      <!-- Student Information Card -->
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Student Information</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Left Column -->
          <div class="space-y-4">
            <div>
              <label class="text-sm font-semibold text-gray-500 uppercase">Full Name</label>
              <p class="text-lg text-gray-900 mt-1">{{ student.fullname || '-' }}</p>
            </div>
            
            <div>
              <label class="text-sm font-semibold text-gray-500 uppercase">Email</label>
              <p class="text-lg text-gray-900 mt-1">{{ student.tbuser?.email || '-' }}</p>
            </div>
            
            <div>
              <label class="text-sm font-semibold text-gray-500 uppercase">Phone</label>
              <p class="text-lg text-gray-900 mt-1">{{ student.phone || '-' }}</p>
            </div>
            
            <div>
              <label class="text-sm font-semibold text-gray-500 uppercase">Gender</label>
              <p class="text-lg text-gray-900 mt-1">{{ getGenderDisplay(student.gender) }}</p>
            </div>
          </div>

          <!-- Right Column -->
          <div class="space-y-4">
            <div>
              <label class="text-sm font-semibold text-gray-500 uppercase">Birth Date</label>
              <p class="text-lg text-gray-900 mt-1">{{ formatDate(student.birthdate) }}</p>
            </div>
            
            <div>
              <label class="text-sm font-semibold text-gray-500 uppercase">Birth Place</label>
              <p class="text-lg text-gray-900 mt-1">{{ student.birthplace || '-' }}</p>
            </div>
            
            <div>
              <label class="text-sm font-semibold text-gray-500 uppercase">Address</label>
              <p class="text-lg text-gray-900 mt-1">{{ student.address || '-' }}</p>
            </div>
            
            <div>
              <label class="text-sm font-semibold text-gray-500 uppercase">Payment Type</label>
              <p class="text-lg text-gray-900 mt-1">{{ student.payment_type || '-' }}</p>
            </div>
          </div>
        </div>

        <!-- Parent Information -->
        <div class="mt-6 pt-6 border-t border-gray-200">
          <h3 class="text-lg font-bold text-gray-900 mb-4">Parent Information</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="text-sm font-semibold text-gray-500 uppercase">Parent Name</label>
              <p class="text-lg text-gray-900 mt-1">{{ student.parentname || '-' }}</p>
            </div>
            <div>
              <label class="text-sm font-semibold text-gray-500 uppercase">Parent Phone</label>
              <p class="text-lg text-gray-900 mt-1">{{ student.parentphone || '-' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Grades Card -->
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Grades</h2>
          <router-link
            :to="{ name: 'AddGrade', params: { userid: studentId } }"
            class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Grade
          </router-link>
        </div>
        
        <div v-if="grades.length === 0" class="text-center py-12 text-gray-500">
          No grades recorded yet.
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test Type</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Listening</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Speaking</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reading</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Writing</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Average</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Report</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="grade in grades" :key="grade.gradeid" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ grade.test_type }}</td>
                <td class="px-4 py-3 text-sm text-gray-700">{{ grade.listening_score || '-' }}</td>
                <td class="px-4 py-3 text-sm text-gray-700">{{ grade.speaking_score || '-' }}</td>
                <td class="px-4 py-3 text-sm text-gray-700">{{ grade.reading_score || '-' }}</td>
                <td class="px-4 py-3 text-sm text-gray-700">{{ grade.writing_score || '-' }}</td>
                <td class="px-4 py-3 text-sm font-semibold text-blue-600">{{ getAverageScore(grade) }}</td>
                <td class="px-4 py-3 text-sm text-gray-500">{{ formatDate(grade.date_taken) }}</td>
                <td class="px-4 py-3">
                  <a
                    v-if="grade.tbreport_files && grade.tbreport_files.length > 0"
                    :href="grade.tbreport_files[0].url"
                    target="_blank"
                    class="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
                    </svg>
                    File
                  </a>
                  <span v-else class="text-xs text-gray-400">No file</span>
                </td>
                <td class="px-4 py-3">
                  <router-link
                    :to="{ name: 'EditGrade', params: { userid: studentId, gradeid: grade.gradeid } }"
                    class="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 text-sm font-medium"
                  >
                    Edit
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Payment History Card -->
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Payment History</h2>
        
        <div v-if="transactions.length === 0" class="text-center py-12 text-gray-500">
          No payment records found.
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="transaction in transactions" :key="transaction.transactionid" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm font-medium text-gray-900">#{{ transaction.transactionid }}</td>
                <td class="px-4 py-3 text-sm text-gray-700">{{ formatDate(transaction.transaction_date) }}</td>
                <td class="px-4 py-3">
                  <span class="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
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
</template>
