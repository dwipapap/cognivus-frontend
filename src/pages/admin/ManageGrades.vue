<script setup>
import { ref, computed, onMounted } from 'vue';
import { studentAPI, reportFileAPI, gradeAPI } from '../../services/api';


import Modal from '../../components/ui/Modal.vue';
import { useForm } from '../../composables/useForm';
import { useConfirm } from '@/composables/useConfirm'

const students = ref([]);
const existingGrades = ref([]);
const isLoading = ref(true);
const successMessage = ref('');
const errorMessage = ref('');
const showUploadModal = ref(false);

const gradePage = ref(1);
const gradePageSize = 20;
const paginatedGrades = computed(() => {
  const start = (gradePage.value - 1) * gradePageSize;
  const end = start + gradePageSize;
  return existingGrades.value.slice(start, end);
});

const gradeColumns = [
  { key: 'test_type', label: 'Test Type' },
  { key: 'listening_score', label: 'Listening' },
  { key: 'speaking_score', label: 'Speaking' },
  { key: 'reading_score', label: 'Reading' },
  { key: 'writing_score', label: 'Writing' },
  { key: 'grammar_score', label: 'Grammar' },
  { key: 'vocabulary_score', label: 'Vocabulary' },
  { key: 'final_score', label: 'Final' },
  { key: 'date_taken', label: 'Date' },
  { key: 'actions', label: 'Actions' },
];

/** Form for uploading grade report */
const { formData, errors, getFieldProps, reset } = useForm(
  {
    studentid: '',
    gradeid: '',
    test_type: '',
    listening_score: '',
    speaking_score: '',
    reading_score: '',
    writing_score: '',
    grammar_score: '',
    vocabulary_score: ''
  },
  {
    studentid: ['required'],
    test_type: ['required']
  }
);

const uploadFile = ref(null);
const isUploading = ref(false);

const { confirm } = useConfirm()

const parseScore = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const score = Number(value);
  return Number.isFinite(score) ? score : null;
};

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
  } finally {
    isLoading.value = false;
  }
};

/** Calculate final score */
const calculateFinalScore = () => {
  const scores = [
    formData.listening_score,
    formData.speaking_score,
    formData.reading_score,
    formData.writing_score,
    formData.grammar_score,
    formData.vocabulary_score
  ].map(parseScore).filter(score => score !== null);
  return scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : null;
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

  let gradeid;
  try {
    isUploading.value = true;

    // Create grade record first
    const gradePayload = {
      studentid: formData.studentid,
      test_type: formData.test_type,
      listening_score: parseScore(formData.listening_score),
      speaking_score: parseScore(formData.speaking_score),
      reading_score: parseScore(formData.reading_score),
      writing_score: parseScore(formData.writing_score),
      grammar_score: parseScore(formData.grammar_score),
      vocabulary_score: parseScore(formData.vocabulary_score),
      final_score: calculateFinalScore(),
      date_taken: new Date().toISOString().split('T')[0]
    };

    const gradeRes = await gradeAPI.createGrade(gradePayload);
    gradeid = gradeRes.data?.data?.gradeid;
    if (!gradeid) throw new Error('Grade record was not created');

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
    if (gradeid) {
      try {
        await gradeAPI.deleteGrade(gradeid);
        errorMessage.value = 'Failed to upload grade report. The incomplete grade record was removed.';
      } catch {
        errorMessage.value = 'Failed to upload grade report. Please remove the incomplete grade record before retrying.';
      }
    } else {
      errorMessage.value = 'Failed to upload grade report';
    }
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

/** Fetch all grades */
const fetchGrades = async () => {
  try {
    const response = await gradeAPI.getAllGrades();
    if (response.data.success) {
      existingGrades.value = response.data.data;
    }
  } catch (error) {
    console.error('Failed to fetch grades:', error);
  }
};

/** Handle delete grade */
const handleDeleteGrade = async (grade) => {
  if (!await confirm(`Delete this grade record?`)) return;
  try {
    await gradeAPI.deleteGrade(grade.gradeid);
    successMessage.value = 'Grade deleted successfully';
    fetchGrades();
    setTimeout(() => { successMessage.value = ''; }, 3000);
  } catch (error) {
    errorMessage.value = 'Failed to delete grade';
  }
};

/** Get student name */
const getStudentName = (studentid) => {
  const student = students.value.find(s => s.studentid === studentid);
  return student?.fullname || 'Unknown';
};

onMounted(() => {
  fetchStudents();
  fetchGrades();
});
</script>

<template>
  <div class="px-4 py-8">
    <h1 class="text-2xl font-semibold text-default tracking-tight mb-6">Grade Reports</h1>

    <!-- Messages -->
    <div v-if="successMessage" class="mb-6 border border-green-200 rounded-lg p-4">
      <p class="text-sm text-green-800">{{ successMessage }}</p>
    </div>
    <div v-if="errorMessage" class="mb-6 border border-red-200 rounded-lg p-4">
      <p class="text-sm text-red-800">{{ errorMessage }}</p>
    </div>

    <!-- Loading skeleton -->
    <div v-if="isLoading" class="space-y-4">
      <USkeleton class="h-6 w-48" />
      <div class="border border-default rounded-lg overflow-hidden">
        <div class="divide-y divide-muted">
          <div v-for="i in 5" :key="i" class="flex items-center gap-4 px-4 py-4">
            <USkeleton class="h-4 w-24" />
            <USkeleton class="h-4 w-12" />
            <USkeleton class="h-4 w-12" />
            <USkeleton class="h-4 w-12" />
            <USkeleton class="h-4 w-12" />
            <USkeleton class="h-4 w-12" />
            <USkeleton class="h-4 w-12" />
            <USkeleton class="h-4 w-12" />
            <USkeleton class="h-4 w-24" />
            <USkeleton class="h-8 w-20" />
          </div>
        </div>
      </div>
    </div>

    <!-- Grades Table -->
    <div v-if="existingGrades.length > 0" class="mb-8">
      <h2 class="text-lg font-medium text-default mb-4">Existing Grades</h2>
      <UTable :data="paginatedGrades" :columns="gradeColumns" class="border border-default rounded-lg">
        <template #actions-data="{ row }">
          <div class="flex gap-2">
            <UButton color="primary" variant="solid" size="sm" @click="$router.push({ name: 'AdminEditGrade', params: { userid: row.studentid, gradeid: row.gradeid } })">
              Edit
            </UButton>
            <UButton color="error" variant="solid" size="sm" @click="handleDeleteGrade(row)">
              Delete
            </UButton>
          </div>
        </template>
      </UTable>
      <div v-if="existingGrades.length > gradePageSize" class="flex items-center justify-between px-4 py-3 bg-muted border border-t-0 border-default rounded-b-lg">
        <p class="text-sm text-muted">
          Showing {{ (gradePage - 1) * gradePageSize + 1 }} to {{ Math.min(gradePage * gradePageSize, existingGrades.length) }} of {{ existingGrades.length }} grades
        </p>
        <UPagination v-model:page="gradePage" :total="existingGrades.length" :max="gradePageSize" :sibling-count="1" size="sm" />
      </div>
    </div>

    <!-- Main Content -->
    <div class="border border-default rounded-lg p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-medium text-default">Upload Grade Report</h2>
        <UButton color="primary" variant="solid" @click="showUploadModal = true" icon="i-lucide-upload">
          Upload Report
        </UButton>
      </div>
      <p class="text-sm text-muted">
        Upload PDF grade reports for students. Reports will be linked to student records.
      </p>
    </div>

    <!-- Upload Modal -->
    <Modal 
      :show="showUploadModal" 
      @close="resetUploadForm"
      title="Upload Grade Report"
      size="5xl"
      :persistent="isUploading"
      :hide-footer="true"
    >
      <template #icon>
        <UIcon name="i-lucide-file-text" class="w-6 h-6 text-white" />
      </template>

      <template #content>
        <div class="space-y-6">
          <UFormField label="Select Student" required>
            <USelect v-model="formData.studentid" :items="students.map(s => ({ label: s.fullname + ' (' + (s.tbuser?.email || '') + ')', value: s.studentid }))" placeholder="-- Select Student --" searchable />
          </UFormField>

          <UFormField label="Test Type" required>
            <UInput v-model="formData.test_type" placeholder="e.g., TOEFL, IELTS, Placement Test" />
          </UFormField>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormField label="Listening Score">
              <UInput v-model="formData.listening_score" type="number" min="0" max="100" placeholder="0-100" />
            </UFormField>
            <UFormField label="Speaking Score">
              <UInput v-model="formData.speaking_score" type="number" min="0" max="100" placeholder="0-100" />
            </UFormField>
            <UFormField label="Reading Score">
              <UInput v-model="formData.reading_score" type="number" min="0" max="100" placeholder="0-100" />
            </UFormField>
            <UFormField label="Writing Score">
              <UInput v-model="formData.writing_score" type="number" min="0" max="100" placeholder="0-100" />
            </UFormField>
            <UFormField label="Grammar Score">
              <UInput v-model="formData.grammar_score" type="number" min="0" max="100" placeholder="0-100" />
            </UFormField>
            <UFormField label="Vocabulary Score">
              <UInput v-model="formData.vocabulary_score" type="number" min="0" max="100" placeholder="0-100" />
            </UFormField>
          </div>

          <UFormField label="Upload Report File" hint="PDF or Word document (max 10MB)">
            <UInput type="file" accept=".pdf,.doc,.docx" @change="e => uploadFile = e.target.files[0]" />
          </UFormField>

          <div class="flex justify-end gap-3 pt-4 border-t border-default">
            <UButton type="button" color="neutral" variant="outline" @click="resetUploadForm" :disabled="isUploading">
              Cancel
            </UButton>
            <UButton type="button" color="primary" variant="solid" @click="uploadGradeReport" :loading="isUploading" icon="i-lucide-upload">
              Upload Report
            </UButton>
          </div>
        </div>
      </template>
    </Modal>
  </div>
</template>
