<script setup>
import { ref, onMounted } from 'vue';
import { studentAPI, reportFileAPI, gradeAPI } from '../../services/api';
import BaseFileUpload from '../../components/form/BaseFileUpload.vue';
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
    <div v-if="isLoading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Main Content -->
    <div v-else class="space-y-6">
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Upload Grade Report</h2>
          <button
            @click="showUploadModal = true"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Upload Report
          </button>
        </div>

        <p class="text-gray-600">
          Upload PDF grade reports for students. Reports will be linked to student records.
        </p>
      </div>
    </div>

    <!-- Upload Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showUploadModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          @click.self="resetUploadForm"
        >
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <!-- Modal Header -->
            <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h3 class="text-xl font-bold text-gray-900">Upload Grade Report</h3>
              <button
                @click="resetUploadForm"
                class="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Modal Body -->
            <div class="px-6 py-6 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Select Student <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="formData.studentid"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Select Student --</option>
                  <option v-for="student in students" :key="student.studentid" :value="student.studentid">
                    {{ student.fullname }} ({{ student.tbuser?.email }})
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Test Type <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.test_type"
                  type="text"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., TOEFL, IELTS, Placement Test"
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Listening Score</label>
                  <input
                    v-model="formData.listening_score"
                    type="number"
                    min="0"
                    max="100"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0-100"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Speaking Score</label>
                  <input
                    v-model="formData.speaking_score"
                    type="number"
                    min="0"
                    max="100"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0-100"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Reading Score</label>
                  <input
                    v-model="formData.reading_score"
                    type="number"
                    min="0"
                    max="100"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0-100"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Writing Score</label>
                  <input
                    v-model="formData.writing_score"
                    type="number"
                    min="0"
                    max="100"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            </div>

            <!-- Modal Footer -->
            <div class="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
              <button
                @click="resetUploadForm"
                class="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                @click="uploadGradeReport"
                :disabled="isUploading"
                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isUploading ? 'Uploading...' : 'Upload Report' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/** Modal transition animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.2s ease;
}

.modal-enter-from .bg-white {
  transform: scale(0.95);
}

.modal-leave-to .bg-white {
  transform: scale(0.95);
}
</style>
