<template>
  <!-- Back Button -->
  <button
    @click="goBack"
    class="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
  >
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
    Back to Student
  </button>

  <!-- Loading -->
  <div v-if="isLoading" class="py-20 flex justify-center">
    <LoadingSpinner size="lg" color="slate" :center="true" />
  </div>

  <!-- Error -->
  <div v-else-if="errorMessage" class="border border-red-200 rounded-lg p-6 text-center max-w-2xl mb-8">
    <h3 class="text-sm font-semibold text-red-900 mb-1">Error Loading Student</h3>
    <p class="text-sm text-red-600">{{ errorMessage }}</p>
  </div>

  <!-- Content -->
  <div v-else-if="student" class="space-y-8 mb-8">
    <!-- Page Header -->
    <div>
      <h1 class="text-2xl font-semibold text-slate-900 tracking-tight">Add New Grade</h1>
      <p class="text-sm text-slate-500 mt-1">
        {{ student.fullname }}<span class="text-slate-300 mx-2">·</span>{{ student.tbuser?.email }}
      </p>
    </div>

    <!-- Grade Form -->
    <form @submit.prevent="handleSave" class="space-y-6">
      <!-- Test Type -->
      <BaseSelect
        v-bind="getFieldProps('test_type')"
        label="Test Type"
        required
        :options="['Final Test', 'Midterm Exam', 'Final Exam', 'Completion']"
        placeholder="Select test type"
      />

      <!-- Skill Scores -->
      <div>
        <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Skill Scores</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BaseInput
            v-bind="getFieldProps('listening_score')"
            type="number"
            label="Listening"
            placeholder="0-100"
            min="0"
            max="100"
          />
          <BaseInput
            v-bind="getFieldProps('speaking_score')"
            type="number"
            label="Speaking"
            placeholder="0-100"
            min="0"
            max="100"
          />
          <BaseInput
            v-bind="getFieldProps('reading_score')"
            type="number"
            label="Reading"
            placeholder="0-100"
            min="0"
            max="100"
          />
          <BaseInput
            v-bind="getFieldProps('writing_score')"
            type="number"
            label="Writing"
            placeholder="0-100"
            min="0"
            max="100"
          />
          <BaseInput
            v-bind="getFieldProps('vocabulary_score')"
            type="number"
            label="Vocabulary"
            placeholder="0-100"
            min="0"
            max="100"
          />
          <BaseInput
            v-bind="getFieldProps('grammar_score')"
            type="number"
            label="Grammar"
            placeholder="0-100"
            min="0"
            max="100"
          />
        </div>
      </div>

      <!-- Final Score & Date -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BaseInput
          v-bind="getFieldProps('final_score')"
          type="number"
          label="Final Score"
          placeholder="0-100"
          min="0"
          max="100"
        />
        <BaseInput
          v-bind="getFieldProps('date_taken')"
          type="date"
          label="Date Taken"
        />
      </div>

      <!-- Description -->
      <BaseTextarea
        v-bind="getFieldProps('description')"
        label="Description"
        :rows="3"
        placeholder="Optional notes about this grade"
      />

      <!-- File Upload -->
      <BaseFileUpload
        v-model="uploadFiles"
        label="Upload Report File (Optional)"
        accept=".pdf,.doc,.docx"
        :max-size="10"
        :multiple="false"
        hint="PDF or Word document (max 10MB)"
      />

      <!-- Actions -->
      <div class="flex gap-3 pt-6 border-t border-slate-200">
        <button
          type="submit"
          :disabled="isSubmitting"
          class="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
        >
          <svg v-if="!isSubmitting" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isSubmitting ? 'Saving...' : 'Save Grade' }}
        </button>
        <button
          type="button"
          @click="goBack"
          :disabled="isSubmitting"
          class="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Cancel
        </button>
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="border border-green-200 rounded-lg p-4">
        <p class="text-sm text-green-800">{{ successMessage }}</p>
      </div>

      <!-- Error Message -->
      <div v-if="submitError" class="border border-red-200 rounded-lg p-4">
        <p class="text-sm text-red-800">{{ submitError }}</p>
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
import LoadingSpinner from '../../components/ui/LoadingSpinner.vue';

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
    vocabulary_score: null,
    grammar_score: null,
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
  } finally {
    isLoading.value = false;
  }
};

/** Submit grade form */
const handleSave = async () => {
  await submit(async (data) => {
    if (!student.value?.studentid) {
      submitError.value = 'Invalid student data';
      console.error('Invalid student data:', student.value);
      return;
    }

    try {
      submitError.value = '';
      successMessage.value = '';

      const payload = {
        studentid: student.value.studentid,
        test_type: data.test_type,
        listening_score: data.listening_score || null,
        speaking_score: data.speaking_score || null,
        reading_score: data.reading_score || null,
        writing_score: data.writing_score || null,
        vocabulary_score: data.vocabulary_score || null,
        grammar_score: data.grammar_score || null,
        final_score: data.final_score ? Math.round(data.final_score) : null,
        description: data.description || null,
        date_taken: data.date_taken || null
      };

      const fileToUpload = uploadFiles.value instanceof File ? uploadFiles.value : null;
      const response = await gradeAPI.createGrade(payload, fileToUpload);

      if (response.data.success) {
        successMessage.value = 'Grade saved successfully';
        setTimeout(() => {
          router.push({ name: 'AdminStudentDetail', params: { id: userid } });
        }, 1000);
      } else {
        submitError.value = response.data.message || 'Failed to save grade';
      }
    } catch (error) {
      submitError.value = error.response?.data?.message || 'Error saving grade';
    }
  });
};

/** Navigate back */
const goBack = () => {
  router.push({ name: 'AdminStudentDetail', params: { id: userid } });
};

onMounted(() => {
  fetchStudent();
});
</script>
