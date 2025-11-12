<script setup>
import { ref, onMounted, computed } from 'vue';
import { classAPI, levelAPI, lecturerAPI } from '../../services/api';
import Modal from '../../components/ui/Modal.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import ClassForm from './ClassForm.vue';

const classes = ref([]);
const levels = ref([]);
const lecturers = ref([]);
const isLoading = ref(true);
const showFormModal = ref(false);
const showNotificationModal = ref(false);
const notificationMessage = ref('');
const notificationType = ref('info');
const selectedClass = ref(null);
const isEditMode = ref(false);
const currentPage = ref(1);
const itemsPerPage = 15;

/** Paginated classes */
const paginatedClasses = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return classes.value.slice(start, end);
});

/** Total pages */
const totalPages = computed(() => {
  return Math.ceil(classes.value.length / itemsPerPage);
});

/** Go to specific page */
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

/** Get level name by ID */
const getLevelName = (levelId) => {
  const level = levels.value.find(l => l.levelid === levelId);
  return level?.name || 'N/A';
};

/** Get lecturer name by ID */
const getLecturerName = (lecturerId) => {
  const lecturer = lecturers.value.find(l => l.lecturerid === lecturerId);
  return lecturer?.fullname || 'Unassigned';
};

/** Fetch all classes from API */
const fetchClasses = async () => {
  try {
    isLoading.value = true;
    const response = await classAPI.getAllClasses();
    if (response.data.success) {
      classes.value = response.data.data;
    }
  } catch (error) {
    showNotification('error', 'Failed to load class data.');
  } finally {
    isLoading.value = false;
  }
};

/** Fetch dropdown options */
const fetchOptions = async () => {
  try {
    const [levelRes, lecturerRes] = await Promise.all([
      levelAPI.getAllLevels(),
      lecturerAPI.getAllLecturers()
    ]);
    
    if (levelRes.data.success) {
      levels.value = levelRes.data.data;
    }
    
    if (lecturerRes.data.success) {
      lecturers.value = lecturerRes.data.data;
    }
  } catch (error) {
    console.error('Failed to fetch options:', error);
  }
};

/** Show notification modal */
const showNotification = (type, message) => {
  notificationType.value = type;
  notificationMessage.value = message;
  showNotificationModal.value = true;
};

/** Open modal to add new class */
const openAddModal = () => {
  isEditMode.value = false;
  selectedClass.value = null;
  showFormModal.value = true;
};

/** Open modal to edit class */
const openEditModal = (classItem) => {
  isEditMode.value = true;
  selectedClass.value = classItem;
  showFormModal.value = true;
};

/** Handle save (create or update) */
const handleSave = async (formData) => {
  try {
    if (isEditMode.value) {
      await classAPI.updateClass(selectedClass.value.classid, formData);
      showNotification('success', 'Class updated successfully.');
    } else {
      await classAPI.createClass(formData);
      showNotification('success', 'Class created successfully.');
    }
    showFormModal.value = false;
    fetchClasses();
  } catch (error) {
    const message = error.response?.data?.message || 'An error occurred.';
    showNotification('error', `Failed to save class: ${message}`);
  }
};

/** Delete class */
const handleDelete = async (classItem) => {
  if (confirm(`Delete class "${classItem.class_code}"? This action cannot be undone.`)) {
    try {
      await classAPI.deleteClass(classItem.classid);
      showNotification('success', 'Class deleted successfully.');
      fetchClasses();
    } catch (error) {
      showNotification('error', 'Failed to delete class.');
    }
  }
};

onMounted(() => {
  fetchClasses();
  fetchOptions();
});
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Manage Classes</h1>
        <p class="text-gray-600 mt-1">Create, edit, and manage class records</p>
      </div>
      <BaseButton @click="openAddModal" variant="primary">
        <span class="mr-2">+</span> Add Class
      </BaseButton>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Classes Table -->
    <div v-else class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-16">#</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Class Code</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Level</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Lecturer</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Description</th>
              <th class="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(classItem, index) in paginatedClasses" 
              :key="classItem.classid"
              :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-50'"
              class="border-b border-gray-100 hover:bg-blue-50 transition-colors"
            >
              <!-- Row Number -->
              <td class="px-6 py-4 text-sm text-gray-500 text-right">
                {{ (currentPage - 1) * itemsPerPage + index + 1 }}
              </td>

              <!-- Class Code -->
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900">{{ classItem.class_code }}</div>
              </td>

              <!-- Level -->
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ getLevelName(classItem.levelid) }}
                </span>
              </td>

              <!-- Lecturer -->
              <td class="px-6 py-4 text-sm text-gray-700">
                {{ getLecturerName(classItem.lecturerid) }}
              </td>

              <!-- Description -->
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ classItem.description || '-' }}
              </td>

              <!-- Actions -->
              <td class="px-6 py-4">
                <div class="flex justify-center gap-2">
                  <BaseButton 
                    @click="openEditModal(classItem)" 
                    variant="secondary"
                    size="sm"
                  >
                    Edit
                  </BaseButton>
                  <BaseButton 
                    @click="handleDelete(classItem)" 
                    variant="danger"
                    size="sm"
                  >
                    Delete
                  </BaseButton>
                </div>
              </td>
            </tr>
            <tr v-if="classes.length === 0">
              <td colspan="6" class="px-6 py-12 text-center">
                <div class="flex flex-col items-center justify-center text-gray-500">
                  <svg class="w-12 h-12 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                  <p class="text-sm font-medium">No classes found</p>
                  <p class="text-xs mt-1">Click "Add Class" to create one.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <p class="text-sm text-gray-600">
          Showing <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> to 
          <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, classes.length) }}</span> of 
          <span class="font-medium">{{ classes.length }}</span> classes
        </p>
        <div class="flex gap-2">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <button
            v-for="page in totalPages"
            :key="page"
            @click="goToPage(page)"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              currentPage === page
                ? 'bg-blue-600 text-white border border-blue-600'
                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
            ]"
          >
            {{ page }}
          </button>
          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Form Modal -->
    <Modal 
      :show="showFormModal" 
      @close="showFormModal = false" 
      :persistent="true" 
      :title="isEditMode ? 'Edit Class' : 'Add New Class'"
      variant="gradient"
      size="5xl"
      :hide-footer="true"
    >
      <template #icon>
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </template>
      <template #content>
        <ClassForm
          :class-item="selectedClass"
          :is-edit-mode="isEditMode"
          :levels="levels"
          :lecturers="lecturers"
          @close="showFormModal = false"
          @save="handleSave"
        />
      </template>
    </Modal>

    <!-- Notification Modal -->
    <Modal 
      :show="showNotificationModal" 
      :type="notificationType" 
      :message="notificationMessage" 
      variant="gradient"
      @close="showNotificationModal = false" 
    />
  </div>
</template>