<script setup>
import { ref, onMounted } from 'vue';
import { studentAPI, reportFileAPI, gradeAPI } from '../../services/api';
import BaseFileUpload from '../../components/form/BaseFileUpload.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import LoadingBar from '../../components/ui/LoadingBar.vue';
import Modal from '../../components/ui/Modal.vue';
import { useForm } from '../../composables/useForm';

const students = ref([]);
const isLoading = ref(true);
const successMessage = ref('');
const errorMessage = ref('');
const showUploadModal = ref(false);

/** Form for uploading grade report */
const { formData, errors, getFieldProps, reset } = useForm(
  {
    studentid: '',
    gradeid: '',
    test_type: '',
    listening_score: '',
    speaking_score: '',
    reading_score: '',
    writing_score: ''
  },
  {
    studentid: ['required'],
    test_type: ['required']
  }
);

const uploadFile = ref(null);
const isUploading = ref(false);

/** Fetch all students */
const fetchStudents = async () => {
  try {
    isLoading.value = true;
    const res = await studentAPI.getAllStudents();
    if (res.data.success) {
      students.value = res.data.data;
    }
  } catch (error) {
    errorMessage.value = 'Failed to load students';
    console.error('Error fetching students:', error);
  } finally {
    isLoading.value = false;
  }
};

/** Calculate final score */
const calculateFinalScore = () => {
  const scores = [
    parseInt(formData.listening_score) || 0,
    parseInt(formData.speaking_score) || 0,
    parseInt(formData.reading_score) || 0,
    parseInt(formData.writing_score) || 0
  ];
  return Math.round(scores.reduce((a, b) => a + b, 0) / 4);
};

/** Upload grade report */
const uploadGradeReport = async () => {
  if (!formData.studentid) {
    errorMessage.value = 'Please select a student';
    return;
  }

  if (!formData.test_type.trim()) {
    errorMessage.value = 'Test type is required';
    return;
  }

  if (!uploadFile.value) {
    errorMessage.value = 'Please select a PDF file';
    return;
  }

  try {
    isUploading.value = true;

    // Create grade record first
    const gradePayload = {
      studentid: formData.studentid,
      test_type: formData.test_type,
      listening_score: parseInt(formData.listening_score) || null,
      speaking_score: parseInt(formData.speaking_score) || null,
      reading_score: parseInt(formData.reading_score) || null,
      writing_score: parseInt(formData.writing_score) || null,
      final_score: calculateFinalScore(),
      date_taken: new Date().toISOString().split('T')[0]
    };

    const gradeRes = await gradeAPI.createGrade(gradePayload);
    const gradeid = gradeRes.data.data.gradeid;

    // Upload the PDF
    await reportFileAPI.uploadReportFile(
      formData.studentid,
      gradeid,
      uploadFile.value
    );

    successMessage.value = 'Grade report uploaded successfully';
    resetUploadForm();
    
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
  } catch (error) {
    errorMessage.value = 'Failed to upload grade report';
    console.error('Error uploading:', error);
  } finally {
    isUploading.value = false;
  }
};

/** Reset upload form */
const resetUploadForm = () => {
  reset();
  uploadFile.value = null;
  showUploadModal.value = false;
};

/** Get student name */
const getStudentName = (studentid) => {
  const student = students.value.find(s => s.studentid === studentid);
  return student?.fullname || 'Unknown';
};

onMounted(() => {
  fetchStudents();
});
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold text-gray-900 mb-8">Manage Grade Reports</h1>

    <!-- Messages -->
    <div v-if="successMessage" class="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
      <p class="text-green-800">{{ successMessage }}</p>
    </div>
    <div v-if="errorMessage" class="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
      <p class="text-red-800">{{ errorMessage }}</p>
    </div>

    <!-- Loading -->
        <!-- Loading State -->
    <div v-if="loading" class="max-w-2xl mx-auto py-20">
      <LoadingBar :loading="true" color="blue" :duration="2000" />
      <p class="text-center text-gray-600 mt-4">Loading grades...</p>
    </div>

    <!-- Main Content -->
    <div v-else class="space-y-6">
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Upload Grade Report</h2>
          <button
            @click="showUploadModal = true"
            class="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full hover:from-blue-700 hover:to-blue-800 hover:scale-105 active:scale-95 transition-all shadow-md hover:shadow-lg font-semibold"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Upload Report
          </button>
        </div>

        <p class="text-gray-600">
          Upload PDF grade reports for students. Reports will be linked to student records.
        </p>
      </div>
    </div>

    <!-- Upload Modal -->
    <Modal 
      :show="showUploadModal" 
      @close="resetUploadForm"
      title="Upload Grade Report"
      variant="gradient"
      size="5xl"
      :persistent="isUploading"
      :hide-footer="true"
    >
      <template #icon>
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </template>

      <template #content>
        <div class="space-y-6">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Select Student <span class="text-red-500">*</span>
            </label>
            <select
              v-model="formData.studentid"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="">-- Select Student --</option>
              <option v-for="student in students" :key="student.studentid" :value="student.studentid">
                {{ student.fullname }} ({{ student.tbuser?.email }})
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Test Type <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formData.test_type"
              type="text"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="e.g., TOEFL, IELTS, Placement Test"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Listening Score</label>
              <input
                v-model="formData.listening_score"
                type="number"
                min="0"
                max="100"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="0-100"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Speaking Score</label>
              <input
                v-model="formData.speaking_score"
                type="number"
                min="0"
                max="100"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="0-100"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Reading Score</label>
              <input
                v-model="formData.reading_score"
                type="number"
                min="0"
                max="100"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="0-100"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Writing Score</label>
              <input
                v-model="formData.writing_score"
                type="number"
                min="0"
                max="100"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="0-100"
              />
            </div>
          </div>

          <BaseFileUpload
            v-model="uploadFile"
            label="Upload Grade Report PDF"
            accept=".pdf"
            :max-size="5"
            :required="true"
            hint="PDF files only (max 5MB)"
          />

          <!-- Action Buttons -->
          <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <BaseButton 
              type="button" 
              variant="glass-secondary" 
              @click="resetUploadForm"
              :disabled="isUploading"
              size="lg"
            >
              Cancel
            </BaseButton>
            <BaseButton 
              type="button" 
              variant="glass-primary" 
              @click="uploadGradeReport"
              :loading="isUploading"
              size="lg"
            >
              <span v-if="!isUploading">
                <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Report
              </span>
            </BaseButton>
          </div>
        </div>
      </template>
    </Modal>
  </div>
</template>
