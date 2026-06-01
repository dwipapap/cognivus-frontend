<script setup>
import { ref, computed, onMounted } from 'vue';
import { levelAPI } from '../../services/api';
import Modal from '../../components/ui/Modal.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import LoadingSpinner from '../../components/ui/LoadingSpinner.vue';
import LevelForm from './LevelForm.vue';

const levels = ref([]);
const isLoading = ref(true);
const showFormModal = ref(false);
const showNotificationModal = ref(false);
const notificationMessage = ref('');
const notificationType = ref('info');
const selectedLevel = ref(null);
const isEditMode = ref(false);
const currentPage = ref(1);
const itemsPerPage = 9; // 3x3 grid

/** Pagination */
const totalPages = computed(() => Math.ceil(levels.value.length / itemsPerPage));
const paginatedLevels = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return levels.value.slice(start, end);
});

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};

/** Fetch all levels */
const fetchLevels = async () => {
  try {
    isLoading.value = true;
    const response = await levelAPI.getAllLevels();
    if (response.data.success) {
      levels.value = response.data.data;
    }
  } catch (error) {
    showNotification('error', 'Failed to load level data.');
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
  selectedLevel.value = null;
  showFormModal.value = true;
};

/** Open edit modal */
const openEditModal = (level) => {
  isEditMode.value = true;
  selectedLevel.value = level;
  showFormModal.value = true;
};

/** Handle save */
const handleSave = async (formData) => {
  try {
    if (isEditMode.value) {
      await levelAPI.updateLevel(selectedLevel.value.levelid, formData);
      showNotification('success', 'Level updated successfully!');
    } else {
      await levelAPI.createLevel(formData);
      showNotification('success', 'Level created successfully!');
    }
    showFormModal.value = false;
    fetchLevels();
  } catch (error) {
    showNotification('error', error.response?.data?.message || 'Failed to save level.');
  }
};

/** Handle delete */
const handleDelete = async (level) => {
  if (!confirm(`Delete level "${level.name}"?`)) return;

  try {
    await levelAPI.deleteLevel(level.levelid);
    showNotification('success', 'Level deleted successfully!');
    fetchLevels();
  } catch (error) {
    showNotification('error', 'Failed to delete level.');
  }
};

onMounted(() => {
  fetchLevels();
});
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-semibold text-slate-900 tracking-tight">Levels</h1>
        <p class="text-sm text-slate-500 mt-1">Course levels in progression order</p>
      </div>
      <BaseButton @click="openAddModal" variant="primary">
        Add Level
      </BaseButton>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="py-20 flex justify-center">
      <LoadingSpinner size="lg" color="slate" :center="true" />
    </div>

    <!-- Levels List -->
    <div v-else>
      <div class="border border-slate-200 rounded-lg overflow-hidden">
        <div class="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center gap-4">
          <span class="text-xs font-semibold text-slate-500 uppercase w-12">Step</span>
          <span class="text-xs font-semibold text-slate-500 uppercase flex-1">Name</span>
          <span class="text-xs font-semibold text-slate-500 uppercase flex-[2]">Description</span>
          <span class="text-xs font-semibold text-slate-500 uppercase w-40 text-right">Actions</span>
        </div>
        <div class="divide-y divide-slate-100">
          <div
            v-for="(level, index) in paginatedLevels"
            :key="level.levelid"
            class="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
          >
            <span class="w-12 text-sm font-mono text-slate-400">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</span>
            <span class="flex-1 text-sm font-medium text-slate-900">{{ level.name }}</span>
            <span class="flex-[2] text-sm text-slate-600">{{ level.description || '-' }}</span>
            <div class="w-40 flex justify-end gap-2">
              <BaseButton @click="openEditModal(level)" variant="primary" size="sm">
                Edit
              </BaseButton>
              <button @click="handleDelete(level)" class="text-sm font-medium text-red-600 hover:text-red-800 transition-colors">
                Delete
              </button>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="levels.length === 0" class="px-6 py-12 text-center text-slate-400">
            <p class="text-sm">No levels found</p>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="levels.length > itemsPerPage" class="flex items-center justify-between mt-4">
        <p class="text-sm text-slate-500">
          Page {{ currentPage }} of {{ totalPages }}
        </p>
        <div class="flex gap-2">
          <BaseButton @click="prevPage" :disabled="currentPage === 1" variant="secondary">
            Previous
          </BaseButton>
          <BaseButton @click="nextPage" :disabled="currentPage === totalPages" variant="secondary">
            Next
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Form Modal -->
    <Modal 
      :show="showFormModal" 
      @close="showFormModal = false" 
      :persistent="true" 
      size="6xl"
      :title="isEditMode ? 'Edit Level' : 'Add New Level'"
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
    />
  </div>
</template>
