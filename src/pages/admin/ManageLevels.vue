<script setup>
import { onMounted } from 'vue';
import { levelAPI } from '../../services/api';
import { useCrudTable } from '../../composables/useCrudTable';
import { usePagination } from '../../composables/usePagination';
import Modal from '../../components/ui/Modal.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import LoadingBar from '../../components/ui/LoadingBar.vue';
import LevelForm from './LevelForm.vue';

// Wrap levelAPI to match useCrudTable interface
const levelCrudAPI = {
  getAll: levelAPI.getAllLevels,
  create: levelAPI.createLevel,
  update: levelAPI.updateLevel,
  delete: levelAPI.deleteLevel
};

// Use CRUD composable for levels
const {
  items: levels,
  isLoading,
  showFormModal,
  showNotificationModal,
  notificationMessage,
  notificationType,
  selectedItem: selectedLevel,
  isEditMode,
  fetchItems: fetchLevels,
  openAddModal,
  openEditModal,
  handleSave,
  handleDelete
} = useCrudTable(levelCrudAPI, {
  resourceName: 'level',
  idField: 'levelid'
});

// Use pagination composable (3x3 grid = 9 items per page)
const {
  paginatedItems: paginatedLevels,
  currentPage,
  totalPages,
  nextPage,
  prevPage
} = usePagination(levels, 9);

onMounted(fetchLevels);
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Manage Levels</h1>
        <p class="text-gray-600 mt-1">Create, edit, and manage course levels</p>
      </div>
      <BaseButton @click="openAddModal" variant="primary">
        <span class="mr-2">+</span> Add Level
      </BaseButton>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="max-w-2xl mx-auto py-20">
      <LoadingBar :loading="true" color="blue" :duration="2000" />
      <p class="text-center text-gray-600 mt-4">Loading levels...</p>
    </div>

    <!-- Levels Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="level in paginatedLevels"
        :key="level.levelid"
        class="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            {{ level.name?.charAt(0) || '?' }}
          </div>
          <div class="flex gap-2">
            <button @click="openEditModal(level)" class="text-blue-600 hover:text-blue-800 font-medium text-sm">
              Edit
            </button>
            <button @click="handleDelete(level)" class="text-red-600 hover:text-red-800 font-medium text-sm">
              Delete
            </button>
          </div>
        </div>
        <h3 class="text-lg font-bold text-gray-800 mb-2">{{ level.name }}</h3>
        <p class="text-sm text-gray-600">{{ level.description || 'No description' }}</p>
      </div>

      <!-- Empty State -->
      <div v-if="levels.length === 0" class="col-span-full text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
        <p class="text-gray-500">No levels found. Click "Add Level" to create one.</p>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="levels.length > itemsPerPage" class="flex justify-center items-center gap-4 mt-6">
      <BaseButton @click="prevPage" :disabled="currentPage === 1" variant="secondary">
        Previous
      </BaseButton>
      <span class="text-gray-700">Page {{ currentPage }} of {{ totalPages }}</span>
      <BaseButton @click="nextPage" :disabled="currentPage === totalPages" variant="secondary">
        Next
      </BaseButton>
    </div>

    <!-- Form Modal -->
    <Modal 
      :show="showFormModal" 
      @close="showFormModal = false" 
      :persistent="true" 
      size="5xl"
      :title="isEditMode ? 'Edit Level' : 'Add New Level'"
      variant="gradient"
      :hide-footer="true"
    >
      <template #icon>
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      </template>
      <template #content>
        <LevelForm
          :level="selectedLevel"
          :is-edit-mode="isEditMode"
          @submit="handleSave"
          @cancel="showFormModal = false"
        />
      </template>
    </Modal>

    <!-- Notification Modal -->
    <Modal 
      :show="showNotificationModal" 
      @close="showNotificationModal = false"
      :type="notificationType"
      :message="notificationMessage"
      variant="gradient"
    />
  </div>
</template>
