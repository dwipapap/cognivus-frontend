<script setup>
import { ref, computed, onMounted } from 'vue';
import { useToast } from '@nuxt/ui/composables';
import { levelAPI } from '../../services/api';

import { useConfirm } from '@/composables/useConfirm'

import NameDescriptionForm from './NameDescriptionForm.vue';

const levels = ref([]);
const isLoading = ref(true);
const showFormModal = ref(false);
const selectedLevel = ref(null);
const toast = useToast();

const { open: confirmOpen, message: confirmMessage, confirm, onConfirm, onCancel } = useConfirm()
const isEditMode = ref(false);
const levelFormRef = ref(null);
const currentPage = ref(1);
const itemsPerPage = 9; // 3x3 grid

/** Pagination */
const totalPages = computed(() => Math.ceil(levels.value.length / itemsPerPage));
const paginatedLevels = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return levels.value.slice(start, end);
});

/** Fetch all levels */
const fetchLevels = async () => {
  try {
    isLoading.value = true;
    const response = await levelAPI.getAllLevels();
    if (response.data.success) {
      levels.value = response.data.data;
      currentPage.value = Math.min(currentPage.value, totalPages.value || 1);
    }
  } catch (error) {
    toast.add({ title: 'Error', description: 'Failed to load level data.', color: 'error' });
  } finally {
    isLoading.value = false;
  }
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
      toast.add({ title: 'Success', description: 'Level updated successfully!', color: 'success' });
    } else {
      await levelAPI.createLevel(formData);
      toast.add({ title: 'Success', description: 'Level created successfully!', color: 'success' });
    }
    showFormModal.value = false;
    fetchLevels();
  } catch (error) {
    toast.add({ title: 'Error', description: error.response?.data?.message || 'Failed to save level.', color: 'error' });
  }
};

/** Handle delete */
const handleDelete = async (level) => {
  if (!await confirm(`Delete level "${level.name}"?`)) return;

  try {
    await levelAPI.deleteLevel(level.levelid);
    toast.add({ title: 'Success', description: 'Level deleted successfully!', color: 'success' });
    fetchLevels();
  } catch (error) {
    toast.add({ title: 'Error', description: 'Failed to delete level.', color: 'error' });
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
        <h1 class="text-2xl font-semibold text-default tracking-tight">Levels</h1>
        <p class="text-sm text-muted mt-1">Course levels in progression order</p>
      </div>
      <UButton @click="openAddModal" color="primary" variant="solid" icon="i-lucide-plus">
        Add Level
      </UButton>
    </div>

    <!-- Loading skeleton -->
    <div v-if="isLoading" class="border border-default rounded-lg overflow-hidden">
      <div class="divide-y divide-muted">
        <div v-for="i in 5" :key="i" class="flex items-center gap-4 px-6 py-4">
          <USkeleton class="h-4 w-8" />
          <USkeleton class="h-4 flex-1" />
          <USkeleton class="h-4 flex-[2]" />
          <USkeleton class="h-8 w-24" />
        </div>
      </div>
    </div>

    <!-- Levels List -->
    <div v-else>
      <div class="border border-default rounded-lg overflow-hidden">
        <div class="bg-muted border-b border-default px-6 py-3 flex items-center gap-4">
          <span class="text-xs font-semibold text-muted uppercase w-12">Step</span>
          <span class="text-xs font-semibold text-muted uppercase flex-1">Name</span>
          <span class="text-xs font-semibold text-muted uppercase flex-[2]">Description</span>
          <span class="text-xs font-semibold text-muted uppercase w-40 text-right">Actions</span>
        </div>
        <div class="divide-y divide-muted">
          <div
            v-for="(level, index) in paginatedLevels"
            :key="level.levelid"
            class="px-6 py-4 flex items-center gap-4 hover:bg-elevated transition-colors"
          >
            <span class="w-12 text-sm font-mono text-muted">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</span>
            <span class="flex-1 text-sm font-medium text-default">{{ level.name }}</span>
            <span class="flex-[2] text-sm text-toned">{{ level.description || '-' }}</span>
            <div class="w-40 flex justify-end gap-2">
              <UButton @click="openEditModal(level)" color="primary" variant="solid" size="sm">
                Edit
              </UButton>
              <UButton @click="handleDelete(level)" color="error" variant="solid" size="sm">
                Delete
              </UButton>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="levels.length === 0" class="px-6 py-12 text-center text-muted">
            <p class="text-sm font-medium">No levels created yet</p>
            <p class="text-xs mt-1">Click 'Add Level' to get started.</p>
          </div>
        </div>
      </div>

      <div v-if="levels.length > itemsPerPage" class="flex items-center justify-between mt-4">
        <p class="text-sm text-muted">
          Page {{ currentPage }} of {{ totalPages }}
        </p>
        <UPagination v-model:page="currentPage" :total="levels.length" :max="itemsPerPage" :sibling-count="1" size="sm" />
      </div>
    </div>

    <!-- Form Slideover -->
    <USlideover
      v-model:open="showFormModal"
      :title="isEditMode ? 'Edit Level' : 'Add New Level'"
      description="Course levels in progression order"
      :dismissible="false"
    >
      <template #body>
        <NameDescriptionForm
          ref="levelFormRef"
          label="Level"
          icon="i-lucide-layers"
          hint="Define a milestone in the curriculum hierarchy."
          name-hint="Descriptive. Communicates difficulty (e.g., Intermediate, Advanced)."
          name-placeholder="e.g., Intermediate"
          description-hint="Goals, prerequisites, and what this level covers."
          :rows="5"
          :model="selectedLevel"
          @submit="handleSave"
        />
      </template>

      <template #footer="{ close }">
        <UButton label="Cancel" color="neutral" variant="outline" @click="close" />
        <UButton type="submit" form="level-form" color="primary" variant="solid" :loading="levelFormRef?.isSubmitting" icon="i-lucide-check">
          {{ isEditMode ? 'Update Level' : 'Create Level' }}
        </UButton>
      </template>
    </USlideover>

  </div>

  <UModal v-model:open="confirmOpen" :title="confirmMessage">
    <template #footer>
      <UButton label="Cancel" color="neutral" variant="outline" @click="onCancel" />
      <UButton label="Delete" color="error" @click="onConfirm" />
    </template>
  </UModal>
</template>
