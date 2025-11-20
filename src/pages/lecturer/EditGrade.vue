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
    <div v-if="isLoading" class="max-w-2xl mx-auto py-20">
      <LoadingBar :loading="true" color="blue" :duration="2000" />
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
      <form @submit.prevent="handleSave" class="bg-white rounded-2xl shadow-lg p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-6">Grade Details</h2>

        <div class="space-y-4">
          <!-- Test Type -->
          <BaseSelect
            v-bind="getFieldProps('test_type')"
            label="Test Type"
            required
            :options="['Final Test', 'Midterm Exam', 'Final Exam', 'Completion']"
            placeholder="Select test type"
          />

          <!-- Skill Scores -->
          <div class="grid grid-cols-2 gap-4">
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

          <!-- Final Score -->
          <BaseInput
            v-bind="getFieldProps('final_score')"
            type="number"
            label="Final Score"
            placeholder="0-100"
            min="0"
            max="100"
          />

          <!-- Date Taken -->
          <BaseInput
            v-bind="getFieldProps('date_taken')"
            type="date"
            label="Date Taken"
          />

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
            class="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-indigo-700 hover:scale-105 active:scale-95 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all shadow-md hover:shadow-lg"
          >
            {{ isSubmitting ? 'Updating...' : 'Update Grade' }}
          </button>
          <button
            type="button"
            @click="handleDelete"
            :disabled="isDeleting"
            class="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white font-semibold rounded-full hover:from-red-700 hover:to-rose-700 hover:scale-105 active:scale-95 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all shadow-md hover:shadow-lg"
          >
            {{ isDeleting ? 'Deleting...' : 'Delete' }}
          </button>
          <button
            type="button"
            @click="goBack"
            class="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 font-semibold rounded-full hover:from-gray-200 hover:to-gray-300 hover:scale-105 active:scale-95 transition-all shadow-sm hover:shadow-md"
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
import { useForm } from '../../composables/useForm';
import BaseFileUpload from '../../components/form/BaseFileUpload.vue';
import BaseInput from '../../components/form/BaseInput.vue';
import BaseSelect from '../../components/form/BaseSelect.vue';
import BaseTextarea from '../../components/form/BaseTextarea.vue';
import LoadingBar from '../../components/ui/LoadingBar.vue';

const route = useRoute();
const router = useRouter();
const userid = route.params.userid;
const gradeid = route.params.gradeid;

const student = ref(null);
const grade = ref(null);
const isLoading = ref(true);
const isDeleting = ref(false);
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
    date_taken: ''
  },
  {
    test_type: ['required']
  }
);

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
const handleSave = async () => {
  await submit(async (data) => {
    console.log('=== EDIT GRADE SUBMISSION STARTED ===');
    console.log('📝 Grade ID:', gradeid);
    
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
      
      console.log('🚀 Calling gradeAPI.updateGrade...');
      const response = await gradeAPI.updateGrade(gradeid, payload, fileToUpload);
      console.log('✅ API Response:', response.data);

      if (response.data.success) {
        successMessage.value = 'Grade updated successfully!';
        console.log('✅ Grade updated successfully');
        setTimeout(() => {
          router.push({ name: 'StudentDetail', params: { id: userid } });
        }, 1000);
      } else {
        submitError.value = response.data.message || 'Failed to update grade';
        console.error('❌ Failed to update grade:', response.data);
      }
    } catch (error) {
      submitError.value = error.response?.data?.message || 'Error updating grade';
      console.error('❌ Error during submission:', error);
    } finally {
      console.log('=== EDIT GRADE SUBMISSION ENDED ===');
    }
  });
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
