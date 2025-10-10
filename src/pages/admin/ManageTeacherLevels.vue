<script setup>
import { ref, onMounted, computed } from 'vue';
import { teacherLevelAPI, lecturerAPI, levelAPI } from '../../services/api';
import Modal from '../../components/ui/Modal.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import TeacherLevelForm from './TeacherLevelForm.vue';

const teacherLevels = ref([]);
const lecturers = ref([]);
const levels = ref([]);
const isLoading = ref(true);
const showFormModal = ref(false);
const showNotificationModal = ref(false);
const notificationMessage = ref('');
const notificationType = ref('info');
const selectedTeacherLevel = ref(null);
const isEditMode = ref(false);

/** Fetch all teacher-level assignments */
const fetchTeacherLevels = async () => {
  try {
    isLoading.value = true;
    const response = await teacherLevelAPI.getAllTeacherLevels();
    if (response.data.success) {
      teacherLevels.value = response.data.data;
    }
  } catch (error) {
    showNotification('error', 'Failed to load teacher level data.');
  } finally {
    isLoading.value = false;
  }
};

/** Fetch dropdown options */
const fetchOptions = async () => {
  try {
    const [lecturerRes, levelRes] = await Promise.all([
      lecturerAPI.getAllLecturers(),
      levelAPI.getAllLevels()
    ]);
    
    if (lecturerRes.data.success) {
      lecturers.value = lecturerRes.data.data;
    }
    
    if (levelRes.data.success) {
      levels.value = levelRes.data.data;
    }
  } catch (error) {
    console.error('Failed to fetch options:', error);
  }
};

/** Group assignments by lecturer */
const groupedByLecturer = computed(() => {
  const groups = {};
  
  teacherLevels.value.forEach(tl => {
    const lecturerId = tl.lecturerid;
    if (!groups[lecturerId]) {
      groups[lecturerId] = {
        lecturer: tl.tblecturer || { fullname: 'Unknown' },
        levels: []
      };
    }
    groups[lecturerId].levels.push(tl);
  });
  
  return Object.values(groups);
});

/** Show notification */
const showNotification = (type, message) => {
  notificationType.value = type;
  notificationMessage.value = message;
  showNotificationModal.value = true;
};

/** Open add modal */
const openAddModal = () => {
  isEditMode.value = false;
  selectedTeacherLevel.value = null;
  showFormModal.value = true;
};

/** Open edit modal */
const openEditModal = (teacherLevel) => {
  isEditMode.value = true;
  selectedTeacherLevel.value = teacherLevel;
  showFormModal.value = true;
};

/** Handle save */
const handleSave = async (formData) => {
  try {
    if (isEditMode.value) {
      await teacherLevelAPI.updateTeacherLevel(selectedTeacherLevel.value.tlid, formData);
      showNotification('success', 'Assignment updated successfully!');
    } else {
      await teacherLevelAPI.createTeacherLevel(formData);
      showNotification('success', 'Assignment created successfully!');
    }
    showFormModal.value = false;
    fetchTeacherLevels();
  } catch (error) {
    showNotification('error', error.response?.data?.message || 'Failed to save assignment.');
  }
};

/** Handle delete */
const handleDelete = async (teacherLevel) => {
  const lecturerName = teacherLevel.tblecturer?.fullname || 'this lecturer';
  const levelName = teacherLevel.tblevel?.name || 'this level';
  
  if (!confirm(`Remove ${levelName} from ${lecturerName}?`)) return;

  try {
    await teacherLevelAPI.deleteTeacherLevel(teacherLevel.tlid);
    showNotification('success', 'Assignment deleted successfully!');
    fetchTeacherLevels();
  } catch (error) {
    showNotification('error', 'Failed to delete assignment.');
  }
};

onMounted(() => {
  fetchTeacherLevels();
  fetchOptions();
});
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Manage Teacher Levels</h1>
        <p class="text-gray-600 mt-1">Assign teaching levels to lecturers</p>
      </div>
      <BaseButton @click="openAddModal" variant="primary">
        <span class="mr-2">+</span> Assign Level
      </BaseButton>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-gray-600">Loading assignments...</p>
    </div>

    <!-- Grouped View -->
    <div v-else class="space-y-4">
      <div
        v-for="group in groupedByLecturer"
        :key="group.lecturer.lecturerid"
        class="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6"
      >
        <!-- Lecturer Header -->
        <div class="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
          <div class="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {{ group.lecturer.fullname?.charAt(0) || '?' }}
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-800">{{ group.lecturer.fullname }}</h3>
            <p class="text-sm text-gray-500">{{ group.levels.length }} level(s) assigned</p>
          </div>
        </div>

        <!-- Assigned Levels -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div
            v-for="tl in group.levels"
            :key="tl.tlid"
            class="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200"
          >
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
              <span class="font-medium text-gray-700">{{ tl.tblevel?.name || 'Unknown Level' }}</span>
            </div>
            <div class="flex gap-2">
              <button @click="openEditModal(tl)" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Edit
              </button>
              <button @click="handleDelete(tl)" class="text-red-600 hover:text-red-800 text-sm font-medium">
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="groupedByLecturer.length === 0" class="text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
        </svg>
        <p class="text-gray-500">No level assignments found. Click "Assign Level" to create one.</p>
      </div>
    </div>

    <!-- Form Modal -->
    <Modal :show="showFormModal" @close="showFormModal = false">
      <template #header>
        <h2 class="text-xl font-bold text-gray-800">
          {{ isEditMode ? 'Edit Assignment' : 'Assign Level to Lecturer' }}
        </h2>
      </template>
      <template #body>
        <TeacherLevelForm
          :teacher-level="selectedTeacherLevel"
          :lecturers="lecturers"
          :levels="levels"
          :is-edit-mode="isEditMode"
          @submit="handleSave"
          @cancel="showFormModal = false"
        />
      </template>
    </Modal>

    <!-- Notification Modal -->
    <Modal :show="showNotificationModal" @close="showNotificationModal = false">
      <template #header>
        <h2 class="text-xl font-bold" :class="{
          'text-green-600': notificationType === 'success',
          'text-red-600': notificationType === 'error',
          'text-blue-600': notificationType === 'info'
        }">
          {{ notificationType === 'success' ? 'Success' : notificationType === 'error' ? 'Error' : 'Info' }}
        </h2>
      </template>
      <template #body>
        <p class="text-gray-700">{{ notificationMessage }}</p>
      </template>
      <template #footer>
        <BaseButton @click="showNotificationModal = false" variant="primary">
          OK
        </BaseButton>
      </template>
    </Modal>
  </div>
</template>
