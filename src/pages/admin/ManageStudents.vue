<script setup>
import { ref, onMounted } from 'vue';
import { studentAPI, classAPI } from '../../services/api';
import Modal from '../../components/ui/Modal.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import StudentForm from './StudentForm.vue';

const students = ref([]);
const classes = ref([]);
const isLoading = ref(true);
const showFormModal = ref(false);
const showNotificationModal = ref(false);
const notificationMessage = ref('');
const notificationType = ref('info');
const selectedStudent = ref(null);
const isEditMode = ref(false);

/** Fetch all students */
const fetchStudents = async () => {
  try {
    isLoading.value = true;
    const response = await studentAPI.getAllStudents();
    if (response.data.success) {
      students.value = response.data.data;
    }
  } catch (error) {
    showNotification('error', 'Failed to load student data.');
  } finally {
    isLoading.value = false;
  }
};

/** Fetch classes for dropdown */
const fetchClasses = async () => {
  try {
    const response = await classAPI.getAllClasses();
    if (response.data.success) {
      classes.value = response.data.data;
    }
  } catch (error) {
    console.error('Failed to fetch classes:', error);
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
  selectedStudent.value = null;
  showFormModal.value = true;
};

/** Open edit modal */
const openEditModal = (student) => {
  isEditMode.value = true;
  selectedStudent.value = student;
  showFormModal.value = true;
};

/** Handle save */
const handleSave = async (formData) => {
  try {
    if (isEditMode.value) {
      await studentAPI.updateStudent(selectedStudent.value.studentid, formData);
      showNotification('success', 'Student updated successfully!');
    } else {
      await studentAPI.createStudent(formData);
      showNotification('success', 'Student created successfully!');
    }
    showFormModal.value = false;
    fetchStudents();
  } catch (error) {
    showNotification('error', error.response?.data?.message || 'Failed to save student.');
  }
};

/** Handle delete */
const handleDelete = async (student) => {
  if (!confirm(`Delete student "${student.fullname}"?`)) return;

  try {
    await studentAPI.deleteStudent(student.studentid);
    showNotification('success', 'Student deleted successfully!');
    fetchStudents();
  } catch (error) {
    showNotification('error', 'Failed to delete student.');
  }
};

onMounted(() => {
  fetchStudents();
  fetchClasses();
});
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Manage Students</h1>
        <p class="text-gray-600 mt-1">Create, edit, and manage student records</p>
      </div>
      <BaseButton @click="openAddModal" variant="primary">
        <span class="mr-2">+</span> Add Student
      </BaseButton>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-gray-600">Loading students...</p>
    </div>

    <!-- Students Table -->
    <div v-else class="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Gender</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Class</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Phone</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Payment</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="student in students" :key="student.studentid" class="hover:bg-blue-50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {{ student.fullname?.charAt(0) || '?' }}
                  </div>
                  <div class="ml-3">
                    <div class="text-sm font-medium text-gray-900">{{ student.fullname }}</div>
                    <div class="text-sm text-gray-500">{{ student.tbuser?.email || 'No email' }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ student.gender || '-' }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">
                {{ student.tbclass?.class_code || 'Unassigned' }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ student.phone || '-' }}</td>
              <td class="px-6 py-4">
                <span v-if="student.payment_type" class="px-2 py-1 text-xs font-semibold rounded-full" 
                  :class="student.payment_type === 'Full' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'">
                  {{ student.payment_type }}
                </span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="px-6 py-4 text-sm">
                <div class="flex gap-2">
                  <button @click="openEditModal(student)" class="text-blue-600 hover:text-blue-800 font-medium">
                    Edit
                  </button>
                  <button @click="handleDelete(student)" class="text-red-600 hover:text-red-800 font-medium">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="students.length === 0">
              <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                No students found. Click "Add Student" to create one.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Form Modal -->
    <Modal :show="showFormModal" @close="showFormModal = false">
      <template #header>
        <h2 class="text-xl font-bold text-gray-800">
          {{ isEditMode ? 'Edit Student' : 'Add New Student' }}
        </h2>
      </template>
      <template #body>
        <StudentForm
          :student="selectedStudent"
          :classes="classes"
          :is-edit-mode="isEditMode"
          @submit="handleSave"
          @cancel="showFormModal = false"
        />
      </template>
    </Modal>

    <!-- Notification Modal -->
    <Modal :show="showNotificationModal" @close="showNotificationModal = false">
      <template #header>
        <h2 class="text-xl font-bold" :class="{
          'text-green-600': notificationType === 'success',
          'text-red-600': notificationType === 'error',
          'text-blue-600': notificationType === 'info'
        }">
          {{ notificationType === 'success' ? 'Success' : notificationType === 'error' ? 'Error' : 'Info' }}
        </h2>
      </template>
      <template #body>
        <p class="text-gray-700">{{ notificationMessage }}</p>
      </template>
      <template #footer>
        <BaseButton @click="showNotificationModal = false" variant="primary">
          OK
        </BaseButton>
      </template>
    </Modal>
  </div>
</template>
