<script setup>
import { ref, onMounted } from 'vue';
import { lecturerAPI } from '../../services/api';
import Modal from '../../components/ui/Modal.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import LecturerForm from './LecturerForm.vue'; // <-- Impor komponen form baru

const lecturers = ref([]);
const isLoading = ref(true);
const showFormModal = ref(false);
const showNotificationModal = ref(false);
const notificationMessage = ref('');
const notificationType = ref('info');
const selectedLecturer = ref(null);
const isEditMode = ref(false);

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
  <div>
    <h1 class="text-3xl font-bold text-white mb-6">Manage Lecturers</h1>

    <div class="mb-6 flex justify-end">
      <BaseButton @click="openAddModal" variant="glass-primary">
        + Add New Lecturer
      </BaseButton>
    </div>

    <div class="bg-gray-800 p-6 rounded-2xl shadow-lg">
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm text-left text-gray-300">
          <thead class="text-xs text-gray-400 uppercase bg-gray-700">
            <tr>
              <th scope="col" class="px-6 py-3">Full Name</th>
              <th scope="col" class="px-6 py-3">Email</th>
              <th scope="col" class="px-6 py-3">Phone Number</th>
              <th scope="col" class="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading">
              <td colspan="4" class="text-center py-4">Loading data...</td>
            </tr>
            <tr v-else-if="lecturers.length === 0">
              <td colspan="4" class="text-center py-4">No lecturers found.</td>
            </tr>
            <tr v-for="lecturer in lecturers" :key="lecturer.lecturerid" class="border-b border-gray-700 hover:bg-gray-700">
              <td class="px-6 py-4 font-medium text-white">{{ lecturer.fullname }}</td>
              <td class="px-6 py-4">{{ lecturer.tbuser?.email || 'N/A' }}</td>
              <td class="px-6 py-4">{{ lecturer.phone || 'N/A' }}</td>
              <td class="px-6 py-4 flex space-x-2">
                <button @click="openEditModal(lecturer)" class="font-medium text-blue-500 hover:underline">Edit</button>
                <button @click="handleDelete(lecturer)" class="font-medium text-red-500 hover:underline">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Modal :show="showFormModal" @close="showFormModal = false" :persistent="true" size="lg">
        <template #content>
            <LecturerForm
                :lecturer="selectedLecturer"
                :is-edit-mode="isEditMode"
                @close="showFormModal = false"
                @save="handleSave"
            />
        </template>
    </Modal>

    <Modal :show="showNotificationModal" :type="notificationType" :message="notificationMessage" @close="showNotificationModal = false" />
  </div>
</template>