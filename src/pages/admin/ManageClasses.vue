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
        <!-- Loading State -->
    <div v-if="loading" class="max-w-2xl mx-auto py-20">
      <LoadingBar :loading="true" color="blue" :duration="2000" />
      <p class="text-center text-gray-600 mt-4">Loading classes...</p>
    </div>

    <!-- Classes Table -->
    <div v-else class="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Class Code</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Level</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Lecturer</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Description</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="classItem in paginatedClasses" :key="classItem.classid" class="hover:bg-blue-50 transition-colors">
              <!-- Class Code -->
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900">{{ classItem.class_code }}</div>
              </td>

              <!-- Level -->
              <td class="px-6 py-4">
                <span class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {{ getLevelName(classItem.levelid) }}
                </span>
              </td>

              <!-- Lecturer -->
              <td class="px-6 py-4 text-sm text-gray-700">
                {{ getLecturerName(classItem.lecturerid) }}
              </td>

              <!-- Description -->
              <td class="px-6 py-4 text-sm text-gray-700">
                {{ classItem.description || '-' }}
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 text-sm">
                <div class="flex gap-2">
                  <button @click="openEditModal(classItem)" class="text-blue-600 hover:text-blue-800 font-medium">
                    Edit
                  </button>
                  <button @click="handleDelete(classItem)" class="text-red-600 hover:text-red-800 font-medium">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="classes.length === 0">
              <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                No classes found. Click "Add Class" to create one.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <p class="text-sm text-gray-600">
          Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, classes.length) }} of {{ classes.length }}
        </p>
        <div class="flex gap-2">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            v-for="page in totalPages"
            :key="page"
            @click="goToPage(page)"
            :class="[
              'px-3 py-1 border rounded-lg text-sm',
              currentPage === page
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-300 hover:bg-gray-50'
            ]"
          >
            {{ page }}
          </button>
          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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