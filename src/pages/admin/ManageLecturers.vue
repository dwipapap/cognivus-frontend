<script setup>
import { ref, onMounted, computed } from 'vue';
import { lecturerAPI, userAPI } from '../../services/api';
import Modal from '../../components/ui/Modal.vue';

import { useConfirm } from '@/composables/useConfirm'
import LecturerForm from './LecturerForm.vue';

const lecturers = ref([]);
const isLoading = ref(true);
const showFormModal = ref(false);
const selectedLecturer = ref(null);

const { open: confirmOpen, message: confirmMessage, confirm, onConfirm, onCancel } = useConfirm()
const isEditMode = ref(false);

const getUserId = (lecturer) => lecturer.tbuser?.userid || lecturer.userid;
const currentPage = ref(1);
const itemsPerPage = 15;

/** Paginated lecturers */
const paginatedLecturers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return lecturers.value.slice(start, end);
});

/** Total pages */
const totalPages = computed(() => {
  return Math.ceil(lecturers.value.length / itemsPerPage);
});

const fetchLecturers = async () => {
  try {
    isLoading.value = true;
    const response = await lecturerAPI.getAllLecturers();
    if (response.data.success) {
      lecturers.value = response.data.data;
    }
  } catch (error) {
    toast.add({ title: 'Error', description: 'Failed to load lecturer data.', color: 'error' });
  } finally {
    isLoading.value = false;
  }
};

const openAddModal = () => {
  isEditMode.value = false;
  selectedLecturer.value = null;
  showFormModal.value = true;
};

const openEditModal = (lecturer) => {
  isEditMode.value = true;
  selectedLecturer.value = lecturer;
  showFormModal.value = true;
};

const handleSave = async ({ lecturerData, userData }) => {
  try {
    if (isEditMode.value) {
      const lecturerId = selectedLecturer.value.tbuser?.userid || selectedLecturer.value.userid;
      
      // Update lecturer data
      await lecturerAPI.updateLecturer(lecturerId, lecturerData);
      
      // Update user data (email/password) if provided
      if (userData && Object.keys(userData).length > 0) {
        await userAPI.updateUser(lecturerId, userData);
      }
      
      toast.add({ title: 'Success', description: 'Lecturer data has been successfully updated.', color: 'success' });
    } else {
      // In create mode, all data goes to lecturer endpoint
      const allData = { ...lecturerData, ...userData };
      await lecturerAPI.createLecturer(allData);
      toast.add({ title: 'Success', description: 'New lecturer has been successfully created.', color: 'success' });
    }
    showFormModal.value = false;
    fetchLecturers();
  } catch (error) {
    const message = error.response?.data?.message || 'An error occurred.';
    toast.add({ title: 'Error', description: `Failed to save lecturer: ${message}`, color: 'error' });
  }
};

const handleDelete = async (lecturer) => {
  if (await confirm(`Are you sure you want to delete ${lecturer.fullname}? This action cannot be undone.`)) {
    try {
      await lecturerAPI.deleteLecturer(getUserId(lecturer));
      toast.add({ title: 'Success', description: 'Lecturer has been deleted.', color: 'success' });
      fetchLecturers();
    } catch (error) {
      toast.add({ title: 'Error', description: 'Failed to delete lecturer.', color: 'error' });
    }
  }
};

onMounted(fetchLecturers);
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-default">Manage Lecturers</h1>
        <p class="text-toned mt-1">Create, edit, and manage lecturer records</p>
      </div>
      <UButton @click="openAddModal" color="primary" variant="solid" icon="i-lucide-plus">
        Add Lecturer
      </UButton>
    </div>

    <div v-if="isLoading" class="flex justify-center py-16">
      <UIcon name="i-lucide-loader-circle" class="w-8 h-8 animate-spin text-muted" />
    </div>

    <!-- Lecturers Table -->
    <div v-else class="bg-default rounded-lg shadow-sm border border-default overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-muted border-b border-default">
              <th class="px-6 py-4 text-left text-xs font-semibold text-default uppercase tracking-wider w-16">#</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-default uppercase tracking-wider">Name</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-default uppercase tracking-wider">Email</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-default uppercase tracking-wider">Class Assignment</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-default uppercase tracking-wider">Education</th>
              <th class="px-6 py-4 text-center text-xs font-semibold text-default uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(lecturer, index) in paginatedLecturers" 
              :key="lecturer.lecturerid"
              :class="index % 2 === 0 ? 'bg-default' : 'bg-muted'"
              class="border-b border-muted transition-colors"
            >
              <!-- Row Number -->
              <td class="px-6 py-4 text-sm text-muted text-right">
                {{ (currentPage - 1) * itemsPerPage + index + 1 }}
              </td>

              <!-- Name -->
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-default">{{ lecturer.fullname }}</div>
                <div class="text-xs text-muted">{{ lecturer.tbuser?.username || 'No username' }}</div>
              </td>

              <!-- Email -->
              <td class="px-6 py-4">
                <a 
                  :href="`mailto:${lecturer.tbuser?.email}`"
                  class="text-sm text-default hover:text-default hover:underline"
                >
                  {{ lecturer.tbuser?.email || '-' }}
                </a>
              </td>

              <!-- Class Assignment -->
              <td class="px-6 py-4">
                <div v-if="lecturer.tbclass && lecturer.tbclass.length > 0" class="space-y-1">
                  <div 
                    v-for="cls in lecturer.tbclass" 
                    :key="cls.classid"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-default mr-1 mb-1"
                  >
                    {{ cls.class_code }}
                    <span v-if="cls.level" class="ml-1 text-muted">
                      ({{ cls.level.name }})
                    </span>
                  </div>
                </div>
                <span v-else class="text-sm text-muted italic">Not assigned</span>
              </td>

              <!-- Education -->
              <td class="px-6 py-4 text-sm text-default">
                {{ lecturer.lasteducation || '-' }}
              </td>

              <!-- Actions -->
              <td class="px-6 py-4">
                <div class="flex justify-center gap-2">
                    <UButton @click="openEditModal(lecturer)" color="primary" variant="solid" size="sm">
                      Edit
                    </UButton>
                  <UButton @click="handleDelete(lecturer)" color="error" variant="solid" size="sm">
                    Delete
                  </UButton>
                </div>
              </td>
            </tr>
            <tr v-if="lecturers.length === 0">
              <td colspan="6" class="px-6 py-12 text-center">
                <div class="flex flex-col items-center justify-center text-muted">
                  <UIcon name="i-lucide-users" class="w-12 h-12 mb-3 text-muted" />
                  <p class="text-sm font-medium">No lecturers found</p>
                  <p class="text-xs mt-1">Click "Add Lecturer" to create one.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="totalPages > 1" class="px-6 py-4 bg-muted border-t border-default flex items-center justify-between">
        <p class="text-sm text-toned">
          Showing <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> to 
          <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, lecturers.length) }}</span> of 
          <span class="font-medium">{{ lecturers.length }}</span> lecturers
        </p>
        <UPagination v-model:page="currentPage" :total="lecturers.length" :max="itemsPerPage" :sibling-count="1" size="sm" />
      </div>
    </div>

    <!-- Form Modal -->
    <Modal 
      :show="showFormModal" 
      @close="showFormModal = false" 
      :persistent="true" 
      size="5xl"
      :title="isEditMode ? 'Edit Lecturer' : 'Add New Lecturer'"
      :hide-footer="true"
    >
      <template #icon>
        <UIcon name="i-lucide-users" class="w-6 h-6 text-white" />
      </template>
      <template #content>
        <LecturerForm
          :lecturer="selectedLecturer"
          :is-edit-mode="isEditMode"
          @close="showFormModal = false"
          @save="handleSave"
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