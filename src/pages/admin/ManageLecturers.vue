<script setup>
import { ref, onMounted, computed } from 'vue';
import { lecturerAPI } from '../../services/api';
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

/** Get initials from name */
const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
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

const handleSave = async (formData) => {
  try {
    if (isEditMode.value) {
      const lecturerId = selectedLecturer.value.userid;
      await lecturerAPI.updateLecturer(lecturerId, formData);
      showNotification('success', 'Lecturer data has been successfully updated.');
    } else {
      await lecturerAPI.createLecturer(formData);
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
        <!-- Loading State -->
    <div v-if="loading" class="max-w-2xl mx-auto py-20">
      <LoadingBar :loading="true" color="blue" :duration="2000" />
      <p class="text-center text-gray-600 mt-4">Loading lecturers...</p>
    </div>

    <!-- Lecturers Table -->
    <div v-else class="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Lecturer</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Contact</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Education</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Gender</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="lecturer in paginatedLecturers" :key="lecturer.lecturerid" class="hover:bg-blue-50 transition-colors">
              <!-- Lecturer Info -->
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                    {{ getInitials(lecturer.fullname) }}
                  </div>
                  <div class="ml-3">
                    <div class="text-sm font-medium text-gray-900">{{ lecturer.fullname }}</div>
                    <div class="text-sm text-gray-500">{{ lecturer.tbuser?.username || 'No username' }}</div>
                  </div>
                </div>
              </td>

              <!-- Contact Info -->
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900">{{ lecturer.tbuser?.email || '-' }}</div>
                <div class="text-sm text-gray-500">{{ lecturer.phone || '-' }}</div>
              </td>

              <!-- Education -->
              <td class="px-6 py-4 text-sm text-gray-700">
                {{ lecturer.lasteducation || '-' }}
              </td>

              <!-- Gender -->
              <td class="px-6 py-4 text-sm text-gray-700">
                {{ lecturer.gender || '-' }}
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 text-sm">
                <div class="flex gap-2">
                  <button @click="openEditModal(lecturer)" class="text-blue-600 hover:text-blue-800 font-medium">
                    Edit
                  </button>
                  <button @click="handleDelete(lecturer)" class="text-red-600 hover:text-red-800 font-medium">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="lecturers.length === 0">
              <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                No lecturers found. Click "Add Lecturer" to create one.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <p class="text-sm text-gray-600">
          Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, lecturers.length) }} of {{ lecturers.length }}
        </p>
        <div class="flex gap-2">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
                : 'border-gray-300 hover:bg-gray-50'
            ]"
          >
            {{ page }}
          </button>
          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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