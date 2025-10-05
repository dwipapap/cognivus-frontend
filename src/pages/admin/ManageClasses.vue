<script setup>
import { ref, onMounted } from 'vue';
import { classAPI, levelAPI, lecturerAPI } from '../../services/api';
import Modal from '../../components/ui/Modal.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import ClassForm from './ClassForm.vue';

const classes = ref([]);
const levels = ref([]);
const lecturers = ref([]);
const isLoading = ref(true);
const showFormModal = ref(false);
const showNotificationModal = ref(false);
const notificationMessage = ref('');
const notificationType = ref('info');
const selectedClass = ref(null);
const isEditMode = ref(false);

/** Fetch all classes from API */
const fetchClasses = async () => {
  try {
    isLoading.value = true;
    const response = await classAPI.getAllClasses();
    if (response.data.success) {
      classes.value = response.data.data;
    }
  } catch (error) {
    showNotification('error', 'Failed to load class data.');
  } finally {
    isLoading.value = false;
  }
};

/** Fetch dropdown options */
const fetchOptions = async () => {
  try {
    const [levelRes, lecturerRes] = await Promise.all([
      levelAPI.getAllLevels(),
      lecturerAPI.getAllLecturers()
    ]);
    
    if (levelRes.data.success) {
      levels.value = levelRes.data.data;
    }
    
    if (lecturerRes.data.success) {
      lecturers.value = lecturerRes.data.data;
    }
  } catch (error) {
    console.error('Failed to fetch options:', error);
  }
};

/** Show notification modal */
const showNotification = (type, message) => {
  notificationType.value = type;
  notificationMessage.value = message;
  showNotificationModal.value = true;
};

/** Open modal to add new class */
const openAddModal = () => {
  isEditMode.value = false;
  selectedClass.value = null;
  showFormModal.value = true;
};

/** Open modal to edit class */
const openEditModal = (classItem) => {
  isEditMode.value = true;
  selectedClass.value = classItem;
  showFormModal.value = true;
};

/** Handle save (create or update) */
const handleSave = async (formData) => {
  try {
    if (isEditMode.value) {
      await classAPI.updateClass(selectedClass.value.classid, formData);
      showNotification('success', 'Class updated successfully.');
    } else {
      await classAPI.createClass(formData);
      showNotification('success', 'Class created successfully.');
    }
    showFormModal.value = false;
    fetchClasses();
  } catch (error) {
    const message = error.response?.data?.message || 'An error occurred.';
    showNotification('error', `Failed to save class: ${message}`);
  }
};

/** Delete class */
const handleDelete = async (classItem) => {
  if (confirm(`Delete class "${classItem.class_code}"? This action cannot be undone.`)) {
    try {
      await classAPI.deleteClass(classItem.classid);
      showNotification('success', 'Class deleted successfully.');
      fetchClasses();
    } catch (error) {
      showNotification('error', 'Failed to delete class.');
    }
  }
};

/** Get level name by ID */
const getLevelName = (levelId) => {
  const level = levels.value.find(l => l.levelid === levelId);
  return level?.name || 'N/A';
};

/** Get lecturer name by ID */
const getLecturerName = (lecturerId) => {
  const lecturer = lecturers.value.find(l => l.lecturerid === lecturerId);
  return lecturer?.fullname || 'Unassigned';
};

onMounted(() => {
  fetchClasses();
  fetchOptions();
});
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-white mb-6">Manage Classes</h1>

    <div class="mb-6 flex justify-end">
      <BaseButton @click="openAddModal" variant="glass-primary">
        + Add New Class
      </BaseButton>
    </div>

    <div class="bg-gray-800 p-6 rounded-2xl shadow-lg">
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm text-left text-gray-300">
          <thead class="text-xs text-gray-400 uppercase bg-gray-700">
            <tr>
              <th scope="col" class="px-6 py-3">Class Code</th>
              <th scope="col" class="px-6 py-3">Level</th>
              <th scope="col" class="px-6 py-3">Lecturer</th>
              <th scope="col" class="px-6 py-3">Description</th>
              <th scope="col" class="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading">
              <td colspan="5" class="text-center py-4">Loading data...</td>
            </tr>
            <tr v-else-if="classes.length === 0">
              <td colspan="5" class="text-center py-4">No classes found.</td>
            </tr>
            <tr v-for="classItem in classes" :key="classItem.classid" class="border-b border-gray-700 hover:bg-gray-700">
              <td class="px-6 py-4 font-medium text-white">{{ classItem.class_code }}</td>
              <td class="px-6 py-4">{{ getLevelName(classItem.levelid) }}</td>
              <td class="px-6 py-4">{{ getLecturerName(classItem.lecturerid) }}</td>
              <td class="px-6 py-4">{{ classItem.description || '-' }}</td>
              <td class="px-6 py-4 flex space-x-2">
                <button @click="openEditModal(classItem)" class="font-medium text-blue-500 hover:underline">Edit</button>
                <button @click="handleDelete(classItem)" class="font-medium text-red-500 hover:underline">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Modal :show="showFormModal" @close="showFormModal = false" :persistent="true" size="lg">
      <template #content>
        <ClassForm
          :class-item="selectedClass"
          :is-edit-mode="isEditMode"
          :levels="levels"
          :lecturers="lecturers"
          @close="showFormModal = false"
          @save="handleSave"
        />
      </template>
    </Modal>

    <Modal :show="showNotificationModal" :type="notificationType" :message="notificationMessage" @close="showNotificationModal = false" />
  </div>
</template>
