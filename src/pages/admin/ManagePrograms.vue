<script setup>
import { ref, onMounted, computed } from 'vue';
import { programAPI } from '../../services/api';
import Modal from '../../components/ui/Modal.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import LoadingSpinner from '../../components/ui/LoadingSpinner.vue';
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
  <div>
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-semibold text-slate-900 tracking-tight">Programs</h1>
        <p class="text-sm text-slate-500 mt-1">Program types and descriptions</p>
      </div>
      <BaseButton @click="openAddModal" variant="primary">
        Add Program
      </BaseButton>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="py-20 flex justify-center">
      <LoadingSpinner size="lg" color="slate" :center="true" />
    </div>

    <!-- Programs Table -->
    <div v-else>
      <div class="border border-slate-200 rounded-lg overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200">
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase w-16">#</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Name</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Description</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase w-40">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(program, index) in paginatedPrograms" 
              :key="program.programid"
              class="border-b border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <td class="px-6 py-4 text-sm text-slate-500">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
              <td class="px-6 py-4 text-sm font-medium text-slate-900">{{ program.name }}</td>
              <td class="px-6 py-4 text-sm text-slate-600">{{ program.description || '-' }}</td>
              <td class="px-6 py-4">
                <div class="flex justify-end gap-2">
                  <BaseButton @click="openEditModal(program)" variant="primary" size="sm">Edit</BaseButton>
                  <BaseButton @click="handleDelete(program)" variant="danger" size="sm">Delete</BaseButton>
                </div>
              </td>
            </tr>
            <tr v-if="programs.length === 0">
              <td colspan="4" class="px-6 py-12 text-center text-slate-400">
                <p class="text-sm">No programs found</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between mt-4">
        <p class="text-sm text-slate-500">
          Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, programs.length) }} of {{ programs.length }}
        </p>
        <div class="flex gap-2">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <button
            v-for="page in totalPages"
            :key="page"
            @click="goToPage(page)"
            :class="[
              'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
              currentPage === page
                ? 'bg-slate-900 text-white border border-slate-900'
                : 'text-slate-700 bg-white border border-slate-300 hover:bg-slate-50'
            ]"
          >
            {{ page }}
          </button>
          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
      :title="isEditMode ? 'Edit Program' : 'Add New Program'"
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
      @close="showNotificationModal = false"
      :hide-footer="true"
    />
  </div>
</template>
