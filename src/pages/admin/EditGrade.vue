<template>
  <!-- Back Button -->
  <button
    @click="goBack"
    class="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-default transition-colors"
  >
    <UIcon name="i-lucide-arrow-left" class="w-4 h-4" />
    Back to Student
  </button>

  <div v-if="isLoading" class="flex justify-center py-16">
    <UIcon name="i-lucide-loader-circle" class="w-8 h-8 animate-spin text-muted" />
  </div>

  <!-- Error -->
  <div v-else-if="errorMessage" class="border border-red-200 rounded-lg p-6 text-center max-w-2xl mb-8">
    <h3 class="text-sm font-semibold text-red-900 mb-1">Error Loading Data</h3>
    <p class="text-sm text-red-600">{{ errorMessage }}</p>
  </div>

  <!-- Content -->
  <div v-else-if="student && grade" class="space-y-8 mb-8">
    <!-- Page Header -->
    <div>
      <h1 class="text-2xl font-semibold text-default tracking-tight">{{ isNewGrade ? 'Add New Grade' : 'Edit Grade' }}</h1>
      <p class="text-sm text-muted mt-1">
        {{ student.fullname }}<span class="text-muted mx-2">·</span>{{ student.tbuser?.email }}
      </p>
    </div>

    <!-- Grade Form -->
    <form @submit.prevent="handleSave" class="space-y-6">
      <!-- Test Type -->
      <UFormField label="Test Type" required>
        <USelect v-bind="getFieldProps('test_type')" :items="['Final Test', 'Midterm Exam', 'Final Exam', 'Completion']" placeholder="Select test type" />
      </UFormField>

      <!-- Skill Scores -->
      <div>
        <h3 class="text-xs font-semibold text-muted uppercase tracking-widest mb-4">Skill Scores</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField label="Listening">
            <UInput v-bind="getFieldProps('listening_score')" type="number" placeholder="0-100" min="0" max="100" />
          </UFormField>
          <UFormField label="Speaking">
            <UInput v-bind="getFieldProps('speaking_score')" type="number" placeholder="0-100" min="0" max="100" />
          </UFormField>
          <UFormField label="Reading">
            <UInput v-bind="getFieldProps('reading_score')" type="number" placeholder="0-100" min="0" max="100" />
          </UFormField>
          <UFormField label="Writing">
            <UInput v-bind="getFieldProps('writing_score')" type="number" placeholder="0-100" min="0" max="100" />
          </UFormField>
          <UFormField label="Vocabulary">
            <UInput v-bind="getFieldProps('vocabulary_score')" type="number" placeholder="0-100" min="0" max="100" />
          </UFormField>
          <UFormField label="Grammar">
            <UInput v-bind="getFieldProps('grammar_score')" type="number" placeholder="0-100" min="0" max="100" />
          </UFormField>
        </div>
      </div>

      <!-- Final Score & Date -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UFormField label="Final Score">
          <UInput v-bind="getFieldProps('final_score')" type="number" placeholder="0-100" min="0" max="100" />
        </UFormField>
        <UFormField label="Date Taken">
          <UInput v-bind="getFieldProps('date_taken')" type="date" />
        </UFormField>
      </div>

      <!-- Description -->
      <UFormField label="Description">
        <UTextarea v-bind="getFieldProps('description')" :rows="3" placeholder="Optional notes about this grade" />
      </UFormField>

      <!-- File Upload -->
      <UFormField label="Upload Report File" hint="PDF or Word document (max 10MB)">
        <UInput type="file" accept=".pdf,.doc,.docx" @change="e => uploadFiles = e.target.files" />
      </UFormField>

      <!-- Actions -->
      <div class="flex flex-wrap gap-3 pt-6 border-t border-default">
        <UButton type="submit" color="primary" variant="solid" :loading="isSubmitting" icon="i-lucide-check">
          {{ isNewGrade ? 'Save Grade' : 'Update Grade' }}
        </UButton>
        <UButton
          v-if="!isNewGrade"
          type="button"
          color="error"
          variant="outline"
          :loading="isDeleting"
          @click="handleDelete"
        >
          {{ isDeleting ? 'Deleting...' : 'Delete' }}
        </UButton>
        <UButton type="button" color="neutral" variant="outline" @click="goBack">
          Cancel
        </UButton>
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

  <UModal v-model:open="confirmOpen" :title="confirmMessage">
    <template #footer>
      <UButton label="Cancel" color="neutral" variant="outline" @click="onCancel" />
      <UButton label="Delete" color="error" @click="onConfirm" />
    </template>
  </UModal>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { studentAPI, gradeAPI } from '../../services/api';
import { useForm } from '../../composables/useForm';
import { useConfirm } from '@/composables/useConfirm'

const route = useRoute();
const router = useRouter();
const userid = route.params.userid;
const gradeid = route.params.gradeid;
const isNewGrade = ref(false);

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
    vocabulary_score: null,
    grammar_score: null,
    final_score: null,
    description: '',
    date_taken: ''
  },
  {
    test_type: ['required']
  }
);

const uploadFiles = ref([]);

const { open: confirmOpen, message: confirmMessage, confirm, onConfirm, onCancel } = useConfirm()

/** Fetch student and grade data */
const fetchData = async () => {
  try {
    isLoading.value = true;
    isNewGrade.value = gradeid === 'new' || !gradeid;
    
    const studentRes = await studentAPI.getStudentById(userid);

    if (studentRes.data.success) {
      let studentData = studentRes.data.data;
      if (Array.isArray(studentData)) {
        studentData = studentData[0];
      }
      student.value = studentData;
      
      if (!isNewGrade.value) {
        if (student.value && student.value.studentid) {
          const gradesRes = await gradeAPI.getGradeById(student.value.studentid);
          
          if (gradesRes.data.success) {
            const grades = gradesRes.data.data;
            grade.value = grades.find(g => String(g.gradeid) === String(gradeid));
            
            if (grade.value) {
              formData.test_type = grade.value.test_type || '';
              formData.listening_score = grade.value.listening_score;
              formData.speaking_score = grade.value.speaking_score;
              formData.reading_score = grade.value.reading_score;
              formData.writing_score = grade.value.writing_score;
              formData.vocabulary_score = grade.value.vocabulary_score;
              formData.grammar_score = grade.value.grammar_score;
              formData.final_score = grade.value.final_score;
              formData.description = grade.value.description || '';
              formData.date_taken = grade.value.date_taken ? new Date(grade.value.date_taken).toISOString().split('T')[0] : '';
            } else {
              errorMessage.value = `Grade with ID ${gradeid} not found for this student`;
            }
          } else {
            errorMessage.value = 'Failed to fetch grades list';
          }
        } else {
          errorMessage.value = 'Student ID is missing from student data';
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
    if (!student.value?.studentid) {
      submitError.value = 'Invalid student data';
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

      const fileToUpload = uploadFiles.value && uploadFiles.value.length > 0 ? uploadFiles.value[0] : null;
      const response = isNewGrade.value
        ? await gradeAPI.createGrade(payload, fileToUpload)
        : await gradeAPI.updateGrade(gradeid, payload, fileToUpload);

      if (response.data.success) {
        successMessage.value = isNewGrade.value ? 'Grade added successfully' : 'Grade updated successfully';
        setTimeout(() => {
          router.push({ name: 'AdminStudentDetail', params: { id: userid } });
        }, 1000);
      } else {
        submitError.value = response.data.message || 'Failed to update grade';
      }
    } catch (error) {
      submitError.value = error.response?.data?.message || 'Error updating grade';
    }
  });
};

/** Delete grade */
const handleDelete = async () => {
  if (!await confirm('Are you sure you want to delete this grade? This action cannot be undone.')) {
    return;
  }

  try {
    isDeleting.value = true;
    submitError.value = '';

    const response = await gradeAPI.deleteGrade(gradeid);

    if (response.data.success) {
      successMessage.value = 'Grade deleted successfully';
      setTimeout(() => {
        router.push({ name: 'AdminStudentDetail', params: { id: userid } });
      }, 1000);
    } else {
      submitError.value = response.data.message || 'Failed to delete grade';
    }
  } catch (error) {
    submitError.value = error.response?.data?.message || 'Error deleting grade';
  } finally {
    isDeleting.value = false;
  }
};

/** Navigate back */
const goBack = () => {
  router.push({ name: 'AdminStudentDetail', params: { id: userid } });
};

onMounted(() => {
  fetchData();
});
</script>
