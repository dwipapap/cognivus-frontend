<script setup>
import { onMounted } from 'vue';
import { programAPI } from '../../services/api';
import { useCrudTable } from '../../composables/useCrudTable';
import { usePagination } from '../../composables/usePagination';
import Modal from '../../components/ui/Modal.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import LoadingBar from '../../components/ui/LoadingBar.vue';
import ProgramForm from './ProgramForm.vue';

// Wrap programAPI to match useCrudTable interface
const programCrudAPI = {
  getAll: programAPI.getAllPrograms,
  create: programAPI.createProgram,
  update: programAPI.updateProgram,
  delete: programAPI.deleteProgram
};

// Use CRUD composable for programs
const {
  items: programs,
  isLoading,
  showFormModal,
  showNotificationModal,
  notificationMessage,
  notificationType,
  selectedItem: selectedProgram,
  isEditMode,
  fetchItems: fetchPrograms,
  openAddModal,
  openEditModal,
  handleSave,
  handleDelete
} = useCrudTable(programCrudAPI, {
  resourceName: 'program',
  idField: 'programid'
});

// Use pagination composable (3x3 grid = 9 items per page)
const {
  paginatedItems: paginatedPrograms,
  currentPage,
  totalPages,
  goToPage
} = usePagination(programs, 9);

onMounted(fetchPrograms);
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Manage Programs</h1>
        <p class="text-gray-600 mt-1">Create, edit, and manage program types</p>
      </div>
      <BaseButton @click="openAddModal" variant="primary">
        <span class="mr-2">+</span> Add Program
      </BaseButton>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="max-w-2xl mx-auto py-20">
      <LoadingBar :loading="true" color="blue" :duration="2000" />
      <p class="text-center text-gray-600 mt-4">Loading programs...</p>
    </div>

    <!-- Programs Grid -->
    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div
          v-for="program in paginatedPrograms"
          :key="program.programid"
          class="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              {{ program.name?.charAt(0) || '?' }}
            </div>
            <div class="flex gap-2">
              <button @click="openEditModal(program)" class="text-blue-600 hover:text-blue-800 font-medium text-sm">
                Edit
              </button>
              <button @click="handleDelete(program)" class="text-red-600 hover:text-red-800 font-medium text-sm">
                Delete
              </button>
            </div>
          </div>
          <h3 class="text-lg font-bold text-gray-800 mb-2">{{ program.name }}</h3>
          <p class="text-sm text-gray-600">{{ program.description || 'No description' }}</p>
        </div>

        <!-- Empty State -->
        <div v-if="programs.length === 0" class="col-span-full text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
          <p class="text-gray-500">No programs found. Click "Add Program" to create one.</p>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-6">
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 bg-white"
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
              : 'bg-white border-gray-300 hover:bg-gray-50'
          ]"
        >
          {{ page }}
        </button>
        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 bg-white"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Form Modal -->
    <Modal 
      :show="showFormModal" 
      @close="showFormModal = false" 
      :persistent="true" 
      :title="isEditMode ? 'Edit Program' : 'Add New Program'"
      variant="gradient"
      size="5xl"
      :hide-footer="true"
    >
      <template #icon>
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </template>
      <template #content>
        <ProgramForm
          :program="selectedProgram"
          :is-edit-mode="isEditMode"
          @submit="handleSave"
          @cancel="showFormModal = false"
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
      :hide-footer="true"
    />
  </div>
</template>
