<script setup>
import { ref, onMounted, computed } from 'vue';
import { lecturerAPI, userAPI } from '../../services/api';
import Modal from '../../components/ui/Modal.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import LecturerForm from './LecturerForm.vue';

const lecturers = ref([]);
const isLoading = ref(true);
const showFormModal = ref(false);
const showNotificationModal = ref(false);
const notificationMessage = ref('');
const notificationType = ref('info');
const selectedLecturer = ref(null);
const isEditMode = ref(false);
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

/** Go to specific page */
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const fetchLecturers = async () => {
  try {
    isLoading.value = true;
    const response = await lecturerAPI.getAllLecturers();
    if (response.data.success) {
      lecturers.value = response.data.data;
    }
  } catch (error) {
    showNotification('error', 'Failed to load lecturer data.');
  } finally {
    isLoading.value = false;
  }
};

const showNotification = (type, message) => {
  notificationType.value = type;
  notificationMessage.value = message;
  showNotificationModal.value = true;
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
      
      showNotification('success', 'Lecturer data has been successfully updated.');
    } else {
      // In create mode, all data goes to lecturer endpoint
      const allData = { ...lecturerData, ...userData };
      await lecturerAPI.createLecturer(allData);
      showNotification('success', 'New lecturer has been successfully created.');
    }
    showFormModal.value = false;
    fetchLecturers();
  } catch (error) {
    const message = error.response?.data?.message || 'An error occurred.';
    showNotification('error', `Failed to save lecturer: ${message}`);
  }
};

const handleDelete = async (lecturer) => {
  if (confirm(`Are you sure you want to delete ${lecturer.fullname}? This action cannot be undone.`)) {
    try {
      await lecturerAPI.deleteLecturer(lecturer.lecturerid);
      showNotification('success', 'Lecturer has been deleted.');
      fetchLecturers();
    } catch (error) {
      showNotification('error', 'Failed to delete lecturer.');
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
        <h1 class="text-2xl font-bold text-gray-800">Manage Lecturers</h1>
        <p class="text-gray-600 mt-1">Create, edit, and manage lecturer records</p>
      </div>
      <BaseButton @click="openAddModal" variant="primary">
        <span class="mr-2">+</span> Add Lecturer
      </BaseButton>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Lecturers Table -->
    <div v-else class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-16">#</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Class Assignment</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Education</th>
              <th class="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(lecturer, index) in paginatedLecturers" 
              :key="lecturer.lecturerid"
              :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-50'"
              class="border-b border-gray-100 hover:bg-blue-50 transition-colors"
            >
              <!-- Row Number -->
              <td class="px-6 py-4 text-sm text-gray-500 text-right">
                {{ (currentPage - 1) * itemsPerPage + index + 1 }}
              </td>

              <!-- Name -->
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900">{{ lecturer.fullname }}</div>
                <div class="text-xs text-gray-500">{{ lecturer.tbuser?.username || 'No username' }}</div>
              </td>

              <!-- Email -->
              <td class="px-6 py-4">
                <a 
                  :href="`mailto:${lecturer.tbuser?.email}`"
                  class="text-sm text-blue-600 hover:text-blue-800 hover:underline"
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
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-1 mb-1"
                  >
                    {{ cls.class_code }}
                    <span v-if="cls.level" class="ml-1 text-blue-600">
                      ({{ cls.level.name }})
                    </span>
                  </div>
                </div>
                <span v-else class="text-sm text-gray-400 italic">Not assigned</span>
              </td>

              <!-- Education -->
              <td class="px-6 py-4 text-sm text-gray-700">
                {{ lecturer.lasteducation || '-' }}
              </td>

              <!-- Actions -->
              <td class="px-6 py-4">
                <div class="flex justify-center gap-2">
                  <BaseButton 
                    @click="openEditModal(lecturer)" 
                    variant="secondary"
                    size="sm"
                  >
                    Edit
                  </BaseButton>
                  <BaseButton 
                    @click="handleDelete(lecturer)" 
                    variant="danger"
                    size="sm"
                  >
                    Delete
                  </BaseButton>
                </div>
              </td>
            </tr>
            <tr v-if="lecturers.length === 0">
              <td colspan="6" class="px-6 py-12 text-center">
                <div class="flex flex-col items-center justify-center text-gray-500">
                  <svg class="w-12 h-12 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                  </svg>
                  <p class="text-sm font-medium">No lecturers found</p>
                  <p class="text-xs mt-1">Click "Add Lecturer" to create one.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <p class="text-sm text-gray-600">
          Showing <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> to 
          <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, lecturers.length) }}</span> of 
          <span class="font-medium">{{ lecturers.length }}</span> lecturers
        </p>
        <div class="flex gap-2">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <button
            v-for="page in totalPages"
            :key="page"
            @click="goToPage(page)"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              currentPage === page
                ? 'bg-blue-600 text-white border border-blue-600'
                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
            ]"
          >
            {{ page }}
          </button>
          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
      size="5xl"
      :title="isEditMode ? 'Edit Lecturer' : 'Add New Lecturer'"
      variant="gradient"
      :hide-footer="true"
    >
      <template #icon>
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
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

    <!-- Notification Modal -->
    <Modal 
      :show="showNotificationModal" 
      :type="notificationType" 
      :message="notificationMessage" 
      @close="showNotificationModal = false"
      variant="gradient"
      :hide-footer="true"
    />
  </div>
</template>