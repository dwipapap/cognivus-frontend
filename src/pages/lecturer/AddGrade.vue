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

    <h1 class="text-4xl font-bold text-gray-900 mb-8">Add Grade</h1>

    <!-- Loading -->
    <div v-if="isLoading" class="max-w-2xl mx-auto py-20">
      <LoadingBar :loading="true" color="blue" :duration="2000" />
    </div>

    <!-- Error -->
    <div v-else-if="errorMessage" class="bg-red-50 border border-red-200 rounded-xl p-4">
      <p class="text-red-800">{{ errorMessage }}</p>
    </div>

    <!-- Content -->
    <div v-else-if="student" class="space-y-6">
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
            label="Upload Report File (Optional)"
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
            class="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-indigo-700 hover:scale-105 active:scale-95 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all shadow-md hover:shadow-lg"
          >
            {{ isSubmitting ? 'Saving...' : 'Save Grade' }}
          </button>
          <button
            type="button"
            @click="goBack"
            class="flex-1 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 font-semibold rounded-full hover:from-gray-200 hover:to-gray-300 hover:scale-105 active:scale-95 transition-all shadow-sm hover:shadow-md"
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
import LoadingBar from '../../components/ui/LoadingBar.vue';

const route = useRoute();
const router = useRouter();
const userid = route.params.userid;

const student = ref(null);
const isLoading = ref(true);
const isSubmitting = ref(false);
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
  date_taken: new Date().toISOString().split('T')[0]
});

const uploadFiles = ref([]);

/** Fetch student data */
const fetchStudent = async () => {
  try {
    isLoading.value = true;
    const response = await studentAPI.getStudentById(userid);

    if (response.data.success) {
      student.value = response.data.data;
    } else {
      errorMessage.value = 'Student not found';
    }
  } catch (error) {
    errorMessage.value = 'Failed to load student data';
    console.error('Error:', error);
  } finally {
    isLoading.value = false;
  }
};

/** Submit grade form */
const handleSubmit = async () => {
  console.log('=== ADD GRADE SUBMISSION STARTED ===');
  
  if (!student.value?.studentid) {
    submitError.value = 'Invalid student data';
    console.error('❌ Invalid student data:', student.value);
    return;
  }

  try {
    isSubmitting.value = true;
    submitError.value = '';
    successMessage.value = '';

    // Log file upload information
    console.log('📁 Upload Files:', uploadFiles.value);
    console.log('📁 Is File object?', uploadFiles.value instanceof File);
    console.log('📁 Upload Files Type:', typeof uploadFiles.value);
    
    if (uploadFiles.value && uploadFiles.value instanceof File) {
      console.log('📄 File Details:', {
        name: uploadFiles.value.name,
        size: uploadFiles.value.size,
        type: uploadFiles.value.type,
        lastModified: uploadFiles.value.lastModified,
        isFile: uploadFiles.value instanceof File,
        isBlob: uploadFiles.value instanceof Blob
      });
    } else {
      console.log('⚠️ No file to upload (uploadFiles is not a File object)');
    }

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

    console.log('📤 Payload to send:', payload);

    // Fix: uploadFiles.value is a File object, not an array
    const fileToUpload = uploadFiles.value instanceof File ? uploadFiles.value : null;
    console.log('📤 File being sent to API:', fileToUpload ? {
      name: fileToUpload.name,
      size: fileToUpload.size,
      type: fileToUpload.type
    } : 'No file');

    console.log('🚀 Calling gradeAPI.createGrade...');
    const response = await gradeAPI.createGrade(payload, fileToUpload);
    console.log('✅ API Response:', response.data);

    if (response.data.success) {
      successMessage.value = 'Grade saved successfully!';
      console.log('✅ Grade saved successfully');
      setTimeout(() => {
        router.push({ name: 'StudentDetail', params: { id: userid } });
      }, 1000);
    } else {
      submitError.value = response.data.message || 'Failed to save grade';
      console.error('❌ Failed to save grade:', response.data);
    }
  } catch (error) {
    submitError.value = error.response?.data?.message || 'Error saving grade';
    console.error('❌ Error during submission:', error);
    console.error('❌ Error response:', error.response?.data);
    console.error('❌ Error status:', error.response?.status);
  } finally {
    isSubmitting.value = false;
    console.log('=== ADD GRADE SUBMISSION ENDED ===');
  }
};

/** Navigate back */
const goBack = () => {
  router.push({ name: 'StudentDetail', params: { id: userid } });
};

onMounted(() => {
  fetchStudent();
});
</script>
