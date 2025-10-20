<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <!-- Back Button -->
    <button
      @click="goBack"
      class="mb-6 inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
    >
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Back to Student
    </button>

    <h1 class="text-4xl font-bold text-gray-900 mb-8">Edit Grade</h1>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error -->
    <div v-else-if="errorMessage" class="bg-red-50 border border-red-200 rounded-xl p-4">
      <p class="text-red-800">{{ errorMessage }}</p>
    </div>

    <!-- Content -->
    <div v-else-if="student && grade" class="space-y-6">
      <!-- Student Info Card -->
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Student Information</h2>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-gray-500">Name:</span>
            <span class="ml-2 font-medium text-gray-900">{{ student.fullname }}</span>
          </div>
          <div>
            <span class="text-gray-500">Email:</span>
            <span class="ml-2 font-medium text-gray-900">{{ student.tbuser?.email }}</span>
          </div>
        </div>
      </div>

      <!-- Grade Form Card -->
      <form @submit.prevent="handleSubmit" class="bg-white rounded-2xl shadow-lg p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-6">Grade Details</h2>

        <div class="space-y-4">
          <!-- Test Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Test Type *</label>
            <select
              v-model="formData.test_type"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select test type</option>
              <option value="Final Test">Final Test</option>
              <option value="Midterm Exam">Midterm Exam</option>
              <option value="Final Exam">Final Exam</option>
              <option value="Completion">Completion</option>
            </select>
          </div>

          <!-- Skill Scores -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Listening Score</label>
              <input
                v-model.number="formData.listening_score"
                type="number"
                min="0"
                max="100"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0-100"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Speaking Score</label>
              <input
                v-model.number="formData.speaking_score"
                type="number"
                min="0"
                max="100"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0-100"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Reading Score</label>
              <input
                v-model.number="formData.reading_score"
                type="number"
                min="0"
                max="100"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0-100"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Writing Score</label>
              <input
                v-model.number="formData.writing_score"
                type="number"
                min="0"
                max="100"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0-100"
              />
            </div>
          </div>

          <!-- Final Score -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Final Score</label>
            <input
              v-model.number="formData.final_score"
              type="number"
              min="0"
              max="100"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0-100"
            />
          </div>

          <!-- Date Taken -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date Taken</label>
            <input
              v-model="formData.date_taken"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              v-model="formData.description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Optional notes about this grade"
            ></textarea>
          </div>

          <!-- File Upload -->
          <BaseFileUpload
            v-model="uploadFiles"
            label="Upload New Report File (Optional)"
            accept=".pdf,.doc,.docx"
            :max-size="10"
            :multiple="false"
            hint="PDF or Word document (max 10MB)"
          />
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3 mt-6">
          <button
            type="submit"
            :disabled="isSubmitting"
            class="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {{ isSubmitting ? 'Updating...' : 'Update Grade' }}
          </button>
          <button
            type="button"
            @click="handleDelete"
            :disabled="isDeleting"
            class="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {{ isDeleting ? 'Deleting...' : 'Delete' }}
          </button>
          <button
            type="button"
            @click="goBack"
            class="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
          <p class="text-green-800 text-sm">{{ successMessage }}</p>
        </div>

        <!-- Error Message -->
        <div v-if="submitError" class="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <p class="text-red-800 text-sm">{{ submitError }}</p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { studentAPI, gradeAPI } from '../../services/api';
import BaseFileUpload from '../../components/form/BaseFileUpload.vue';

const route = useRoute();
const router = useRouter();
const userid = route.params.userid;
const gradeid = route.params.gradeid;

const student = ref(null);
const grade = ref(null);
const isLoading = ref(true);
const isSubmitting = ref(false);
const isDeleting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const submitError = ref('');

const formData = ref({
  test_type: '',
  listening_score: null,
  speaking_score: null,
  reading_score: null,
  writing_score: null,
  final_score: null,
  description: '',
  date_taken: ''
});

const uploadFiles = ref([]);

/** Fetch student and grade data */
const fetchData = async () => {
  try {
    isLoading.value = true;
    
    const studentRes = await studentAPI.getStudentById(userid);

    if (studentRes.data.success) {
      student.value = studentRes.data.data;
      
      // Fetch grades by studentid
      if (student.value.studentid) {
        const gradesRes = await gradeAPI.getGradeById(student.value.studentid);
        
        if (gradesRes.data.success) {
          const grades = gradesRes.data.data;
          grade.value = grades.find(g => g.gradeid === parseInt(gradeid));
          
          if (grade.value) {
            formData.value = {
              test_type: grade.value.test_type || '',
              listening_score: grade.value.listening_score,
              speaking_score: grade.value.speaking_score,
              reading_score: grade.value.reading_score,
              writing_score: grade.value.writing_score,
              final_score: grade.value.final_score,
              description: grade.value.description || '',
              date_taken: grade.value.date_taken ? new Date(grade.value.date_taken).toISOString().split('T')[0] : ''
            };
          } else {
            errorMessage.value = 'Grade not found';
          }
        }
      }
    } else {
      errorMessage.value = 'Student not found';
    }
  } catch (error) {
    errorMessage.value = 'Failed to load data';
    console.error('Error:', error);
  } finally {
    isLoading.value = false;
  }
};

/** Submit grade update */
const handleSubmit = async () => {
  if (!student.value?.studentid) {
    submitError.value = 'Invalid student data';
    return;
  }

  try {
    isSubmitting.value = true;
    submitError.value = '';
    successMessage.value = '';

    const payload = {
      studentid: student.value.studentid,
      test_type: formData.value.test_type,
      listening_score: formData.value.listening_score || null,
      speaking_score: formData.value.speaking_score || null,
      reading_score: formData.value.reading_score || null,
      writing_score: formData.value.writing_score || null,
      final_score: formData.value.final_score ? Math.round(formData.value.final_score) : null,
      description: formData.value.description || null,
      date_taken: formData.value.date_taken || null
    };

    const response = await gradeAPI.updateGrade(gradeid, payload, uploadFiles.value.length > 0 ? uploadFiles.value[0] : null);

    if (response.data.success) {
      successMessage.value = 'Grade updated successfully!';
      setTimeout(() => {
        router.push({ name: 'StudentDetail', params: { id: userid } });
      }, 1000);
    } else {
      submitError.value = response.data.message || 'Failed to update grade';
    }
  } catch (error) {
    submitError.value = error.response?.data?.message || 'Error updating grade';
    console.error('Error:', error);
  } finally {
    isSubmitting.value = false;
  }
};

/** Delete grade */
const handleDelete = async () => {
  if (!confirm('Are you sure you want to delete this grade? This action cannot be undone.')) {
    return;
  }

  try {
    isDeleting.value = true;
    submitError.value = '';

    const response = await gradeAPI.deleteGrade(gradeid);

    if (response.data.success) {
      successMessage.value = 'Grade deleted successfully!';
      setTimeout(() => {
        router.push({ name: 'StudentDetail', params: { id: userid } });
      }, 1000);
    } else {
      submitError.value = response.data.message || 'Failed to delete grade';
    }
  } catch (error) {
    submitError.value = error.response?.data?.message || 'Error deleting grade';
    console.error('Error:', error);
  } finally {
    isDeleting.value = false;
  }
};

/** Navigate back */
const goBack = () => {
  router.push({ name: 'StudentDetail', params: { id: userid } });
};

onMounted(() => {
  fetchData();
});
</script>
