<script setup>
import { ref, computed, onMounted } from 'vue';
import { levelAPI } from '../../services/api';
import Modal from '../../components/ui/Modal.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
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
        <!-- Loading State -->
    <div v-if="loading" class="max-w-2xl mx-auto py-20">
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
      size="6xl"
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
