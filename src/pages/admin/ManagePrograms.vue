<script setup>
import { ref, onMounted, computed } from 'vue';
import { programAPI } from '../../services/api';
import Modal from '../../components/ui/Modal.vue';

import { useConfirm } from '@/composables/useConfirm'

import ProgramForm from './ProgramForm.vue';

const programs = ref([]);
const isLoading = ref(true);
const showFormModal = ref(false);
const selectedProgram = ref(null);

const { open: confirmOpen, message: confirmMessage, confirm, onConfirm, onCancel } = useConfirm()
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

/** Fetch all programs */
const fetchPrograms = async () => {
  try {
    isLoading.value = true;
    const response = await programAPI.getAllPrograms();
    if (response.data.success) {
      programs.value = response.data.data;
    }
  } catch (error) {
    toast.add({ title: 'Error', description: 'Failed to load program data.', color: 'error' });
  } finally {
    isLoading.value = false;
  }
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
      toast.add({ title: 'Success', description: 'Program updated successfully!', color: 'success' });
    } else {
      await programAPI.createProgram(formData);
      toast.add({ title: 'Success', description: 'Program created successfully!', color: 'success' });
    }
    showFormModal.value = false;
    fetchPrograms();
  } catch (error) {
    toast.add({ title: 'Error', description: error.response?.data?.message || 'Failed to save program.', color: 'error' });
  }
};

/** Handle delete */
const handleDelete = async (program) => {
  if (!await confirm(`Delete program "${program.name}"?`)) return;

  try {
    await programAPI.deleteProgram(program.programid);
    toast.add({ title: 'Success', description: 'Program deleted successfully!', color: 'success' });
    fetchPrograms();
  } catch (error) {
    toast.add({ title: 'Error', description: 'Failed to delete program.', color: 'error' });
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
        <h1 class="text-2xl font-semibold text-default tracking-tight">Programs</h1>
        <p class="text-sm text-muted mt-1">Program types and descriptions</p>
      </div>
      <UButton @click="openAddModal" color="primary" variant="solid" icon="i-lucide-plus">
        Add Program
      </UButton>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center py-16">
      <UIcon name="i-lucide-loader-circle" class="w-8 h-8 animate-spin text-muted" />
    </div>

    <!-- Programs Table -->
    <div v-else>
      <div class="border border-default rounded-lg overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="bg-muted border-b border-default">
              <th class="px-6 py-3 text-left text-xs font-semibold text-muted uppercase w-16">#</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-muted uppercase">Name</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-muted uppercase">Description</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-muted uppercase w-40">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(program, index) in paginatedPrograms" 
              :key="program.programid"
              class="border-b border-muted hover:bg-elevated transition-colors"
            >
              <td class="px-6 py-4 text-sm text-muted">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
              <td class="px-6 py-4 text-sm font-medium text-default">{{ program.name }}</td>
              <td class="px-6 py-4 text-sm text-toned">{{ program.description || '-' }}</td>
              <td class="px-6 py-4">
                <div class="flex justify-end gap-2">
                  <UButton @click="openEditModal(program)" color="primary" variant="solid" size="sm">Edit</UButton>
                  <UButton @click="handleDelete(program)" color="error" variant="solid" size="sm">Delete</UButton>
                </div>
              </td>
            </tr>
            <tr v-if="programs.length === 0">
              <td colspan="4" class="px-6 py-12 text-center text-muted">
                <p class="text-sm">No programs found</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="totalPages > 1" class="flex items-center justify-between mt-4">
        <p class="text-sm text-muted">
          Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, programs.length) }} of {{ programs.length }}
        </p>
        <UPagination v-model:page="currentPage" :total="programs.length" :max="itemsPerPage" :sibling-count="1" size="sm" />
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
        <UIcon name="i-lucide-folder-tree" class="w-6 h-6 text-white" />
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

  </div>

  <UModal v-model:open="confirmOpen" :title="confirmMessage">
    <template #footer>
      <UButton label="Cancel" color="neutral" variant="outline" @click="onCancel" />
      <UButton label="Delete" color="error" @click="onConfirm" />
    </template>
  </UModal>
</template>
