<script setup>
import { ref, onMounted } from 'vue';
import { classAPI, levelAPI, lecturerAPI } from '../../services/api';
import { useCrudTable } from '../../composables/useCrudTable';
import { usePagination } from '../../composables/usePagination';
import { logger } from '../../utils/logger';
import Modal from '../../components/ui/Modal.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import LoadingBar from '../../components/ui/LoadingBar.vue';
import ClassForm from './ClassForm.vue';

// Wrap classAPI to match useCrudTable interface
const classCrudAPI = {
  getAll: classAPI.getAllClasses,
  create: classAPI.createClass,
  update: classAPI.updateClass,
  delete: classAPI.deleteClass
};

// Use CRUD composable for classes
const {
  items: classes,
  isLoading,
  showFormModal,
  showNotificationModal,
  notificationMessage,
  notificationType,
  selectedItem: selectedClass,
  isEditMode,
  fetchItems: fetchClasses,
  openAddModal,
  openEditModal,
  handleSave,
  handleDelete
} = useCrudTable(classCrudAPI, {
  resourceName: 'class',
  idField: 'classid'
});

// Use pagination composable
const {
  paginatedItems: paginatedClasses,
  currentPage,
  totalPages,
  goToPage
} = usePagination(classes, 15);

// Reference data for dropdowns
const levels = ref([]);
const lecturers = ref([]);

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
    logger.error('Failed to fetch options:', error);
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
    <div v-if="isLoading" class="max-w-2xl mx-auto py-20">
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
          Showing {{ (currentPage - 1) * 15 + 1 }} to {{ Math.min(currentPage * 15, classes.length) }} of {{ classes.length }}
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