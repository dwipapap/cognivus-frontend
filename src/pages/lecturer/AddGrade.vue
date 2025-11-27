<template>
  <!-- Back Button -->
  <button
    @click="goBack"
    class="mb-6 inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-white bg-blue-50 hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 rounded-full font-medium transition-all hover:shadow-md hover:scale-105 active:scale-95"
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
    Back to Student
  </button>

  <!-- Loading -->
  <div v-if="isLoading" class="max-w-2xl mx-auto py-20">
    <LoadingBar :loading="true" color="blue" :duration="2000" />
  </div>

  <!-- Error -->
  <div v-else-if="errorMessage" class="bg-red-50 border border-red-200 rounded-2xl p-6 text-center max-w-2xl mx-auto mb-8">
    <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
    <h3 class="text-lg font-semibold text-red-900 mb-2">Error Loading Student</h3>
    <p class="text-red-600">{{ errorMessage }}</p>
  </div>

  <!-- Content -->
  <div v-else-if="student" class="space-y-8 mb-8">
    <!-- Header Card with Student Info -->
    <div class="relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg overflow-hidden">
      <!-- Decorative Graphics -->
      <div class="absolute top-0 right-0 w-1/2 h-full pointer-events-none overflow-hidden">
        <div class="absolute -top-10 -right-10 w-40 h-48 bg-blue-400/30 rounded-lg transform rotate-12 flex items-center justify-center">
          <svg class="w-20 h-20 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div class="absolute top-20 -right-5 w-32 h-40 bg-blue-300/40 rounded-lg transform rotate-12"></div>
        <div class="absolute top-40 right-10 w-28 h-36 bg-white/20 rounded-lg transform rotate-12"></div>
      </div>

      <!-- Content -->
      <div class="relative p-5 md:p-8 z-10">
        <div class="mb-6">
          <h1 class="text-2xl md:text-3xl font-bold text-white mb-2">Add New Grade</h1>
          <p class="text-sm text-white/80 max-w-2xl">
            Record test scores and assessment results for the student.
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <!-- Student Name Badge -->
          <div class="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
            <svg class="w-4 h-4 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <p class="text-white text-sm font-medium">{{ student.fullname }}</p>
          </div>

          <!-- Email Badge -->
          <div class="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
            <svg class="w-4 h-4 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p class="text-white text-sm font-medium">{{ student.tbuser?.email }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Grade Form Card -->
    <form @submit.prevent="handleSave" class="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-200">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <h2 class="text-xl md:text-2xl font-bold text-gray-900">Grade Details</h2>
      </div>

        <div class="space-y-6">
          <!-- Test Type -->
          <div class="bg-white rounded-xl p-5 shadow-sm border border-blue-100/50">
            <BaseSelect
              v-bind="getFieldProps('test_type')"
              label="Test Type"
              required
              :options="['Final Test', 'Midterm Exam', 'Final Exam', 'Completion']"
              placeholder="Select test type"
            />
          </div>

          <!-- Skill Scores Section -->
          <div class="bg-white rounded-xl p-5 shadow-sm border border-blue-100/50">
            <div class="flex items-center gap-2 mb-4">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 class="font-semibold text-gray-900">Skill Scores</h3>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <BaseInput
                v-bind="getFieldProps('listening_score')"
                type="number"
                label="Listening Score"
                placeholder="0-100"
                min="0"
                max="100"
              />

              <BaseInput
                v-bind="getFieldProps('speaking_score')"
                type="number"
                label="Speaking Score"
                placeholder="0-100"
                min="0"
                max="100"
              />

              <BaseInput
                v-bind="getFieldProps('reading_score')"
                type="number"
                label="Reading Score"
                placeholder="0-100"
                min="0"
                max="100"
              />

              <BaseInput
                v-bind="getFieldProps('writing_score')"
                type="number"
                label="Writing Score"
                placeholder="0-100"
                min="0"
                max="100"
              />
            </div>
          </div>

          <!-- Final Score & Date -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-white rounded-xl p-5 shadow-sm border border-blue-100/50">
              <BaseInput
                v-bind="getFieldProps('final_score')"
                type="number"
                label="Final Score"
                placeholder="0-100"
                min="0"
                max="100"
              />
            </div>

            <div class="bg-white rounded-xl p-5 shadow-sm border border-blue-100/50">
              <BaseInput
                v-bind="getFieldProps('date_taken')"
                type="date"
                label="Date Taken"
              />
            </div>
          </div>

          <!-- Description -->
          <div class="bg-white rounded-xl p-5 shadow-sm border border-blue-100/50">
            <BaseTextarea
              v-bind="getFieldProps('description')"
              label="Description"
              :rows="3"
              placeholder="Optional notes about this grade"
            />
          </div>

          <!-- File Upload -->
          <div class="bg-white rounded-xl p-5 shadow-sm border border-blue-100/50">
            <BaseFileUpload
              v-model="uploadFiles"
              label="Upload Report File (Optional)"
              accept=".pdf,.doc,.docx"
              :max-size="10"
              :multiple="false"
              hint="PDF or Word document (max 10MB)"
            />
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-blue-200">
          <button
            type="submit"
            :disabled="isSubmitting"
            class="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-md"
          >
            <svg v-if="!isSubmitting" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isSubmitting ? 'Saving Grade...' : 'Save Grade' }}
          </button>
          <button
            type="button"
            @click="goBack"
            :disabled="isSubmitting"
            class="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-full border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          </button>
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p class="text-green-800 font-medium">{{ successMessage }}</p>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="submitError" class="mt-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p class="text-red-800 font-medium">{{ submitError }}</p>
          </div>
        </div>
      </form>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { studentAPI, gradeAPI } from '../../services/api';
import { useForm } from '../../composables/useForm';
import BaseFileUpload from '../../components/form/BaseFileUpload.vue';
import BaseInput from '../../components/form/BaseInput.vue';
import BaseSelect from '../../components/form/BaseSelect.vue';
import BaseTextarea from '../../components/form/BaseTextarea.vue';
import LoadingBar from '../../components/ui/LoadingBar.vue';

const route = useRoute();
const router = useRouter();
const userid = route.params.userid;

const student = ref(null);
const isLoading = ref(true);
const errorMessage = ref('');
const successMessage = ref('');
const submitError = ref('');

const { formData, errors, isSubmitting, submit, getFieldProps } = useForm(
  {
    test_type: '',
    listening_score: null,
    speaking_score: null,
    reading_score: null,
    writing_score: null,
    final_score: null,
    description: '',
    date_taken: new Date().toISOString().split('T')[0]
  },
  {
    test_type: ['required']
  }
);

const uploadFiles = ref([]);

/** Fetch student data */
const fetchStudent = async () => {
  try {
    isLoading.value = true;
    const response = await studentAPI.getStudentById(userid);

    if (response.data.success) {
      // Handle both array and single object responses
      let studentData = response.data.data;
      if (Array.isArray(studentData)) {
        studentData = studentData[0];
      }
      student.value = studentData;
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
const handleSave = async () => {
  await submit(async (data) => {
    console.log('=== ADD GRADE SUBMISSION STARTED ===');
    
    if (!student.value?.studentid) {
      submitError.value = 'Invalid student data';
      console.error('❌ Invalid student data:', student.value);
      return;
    }

    try {
      submitError.value = '';
      successMessage.value = '';

      // Log file upload information
      console.log('📁 Upload Files:', uploadFiles.value);
      
      const payload = {
        studentid: student.value.studentid,
        test_type: data.test_type,
        listening_score: data.listening_score || null,
        speaking_score: data.speaking_score || null,
        reading_score: data.reading_score || null,
        writing_score: data.writing_score || null,
        final_score: data.final_score ? Math.round(data.final_score) : null,
        description: data.description || null,
        date_taken: data.date_taken || null
      };

      console.log('📤 Payload to send:', payload);

      const fileToUpload = uploadFiles.value instanceof File ? uploadFiles.value : null;
      
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
    } finally {
      console.log('=== ADD GRADE SUBMISSION ENDED ===');
    }
  });
};

/** Navigate back */
const goBack = () => {
  router.push({ name: 'StudentDetail', params: { id: userid } });
};

onMounted(() => {
  fetchStudent();
});
</script>
