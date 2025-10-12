<script setup>
import { ref, onMounted, computed } from 'vue';
import { programAPI } from '../../services/api';
import Modal from '../../components/ui/Modal.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import ProgramForm from './ProgramForm.vue';

const programs = ref([]);
const isLoading = ref(true);
const showFormModal = ref(false);
const showNotificationModal = ref(false);
const notificationMessage = ref('');
const notificationType = ref('info');
const selectedProgram = ref(null);
const isEditMode = ref(false);
const currentPage = ref(1);
const itemsPerPage = 9; // 3x3 grid

/** Paginated programs */
const paginatedPrograms = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return programs.value.slice(start, end);
});

/** Total pages */
const totalPages = computed(() => {
  return Math.ceil(programs.value.length / itemsPerPage);
});

/** Go to specific page */
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

/** Fetch all programs */
const fetchPrograms = async () => {
  try {
    isLoading.value = true;
    const response = await programAPI.getAllPrograms();
    if (response.data.success) {
      programs.value = response.data.data;
    }
  } catch (error) {
    showNotification('error', 'Failed to load program data.');
  } finally {
    isLoading.value = false;
  }
};

/** Show notification */
const showNotification = (type, message) => {
  notificationType.value = type;
  notificationMessage.value = message;
  showNotificationModal.value = true;
};

/** Open add modal */
const openAddModal = () => {
  isEditMode.value = false;
  selectedProgram.value = null;
  showFormModal.value = true;
};

/** Open edit modal */
const openEditModal = (program) => {
  isEditMode.value = true;
  selectedProgram.value = program;
  showFormModal.value = true;
};

/** Handle save */
const handleSave = async (formData) => {
  try {
    if (isEditMode.value) {
      await programAPI.updateProgram(selectedProgram.value.programid, formData);
      showNotification('success', 'Program updated successfully!');
    } else {
      await programAPI.createProgram(formData);
      showNotification('success', 'Program created successfully!');
    }
    showFormModal.value = false;
    fetchPrograms();
  } catch (error) {
    showNotification('error', error.response?.data?.message || 'Failed to save program.');
  }
};

/** Handle delete */
const handleDelete = async (program) => {
  if (!confirm(`Delete program "${program.name}"?`)) return;

  try {
    await programAPI.deleteProgram(program.programid);
    showNotification('success', 'Program deleted successfully!');
    fetchPrograms();
  } catch (error) {
    showNotification('error', 'Failed to delete program.');
  }
};

onMounted(() => {
  fetchPrograms();
});
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
    <div v-if="isLoading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-gray-600">Loading programs...</p>
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
    <Modal :show="showFormModal" @close="showFormModal = false" :persistent="true" size="lg">
      <template #content>
        <h2 class="text-xl font-bold text-gray-800 mb-4">
          {{ isEditMode ? 'Edit Program' : 'Add New Program' }}
        </h2>
        <ProgramForm
          :program="selectedProgram"
          :is-edit-mode="isEditMode"
          @submit="handleSave"
          @cancel="showFormModal = false"
        />
      </template>
      <template #footer>
        <span></span>
      </template>
    </Modal>

    <!-- Notification Modal -->
    <Modal :show="showNotificationModal" :type="notificationType" :message="notificationMessage" @close="showNotificationModal = false" />
  </div>
</template>
