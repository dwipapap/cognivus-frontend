<script setup>
import { ref, onMounted, computed } from 'vue';
import { studentAPI, classAPI, levelAPI } from '../../services/api';
import Modal from '../../components/ui/Modal.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import StudentForm from './StudentForm.vue';

const students = ref([]);
const classes = ref([]);
const levels = ref([]);
const isLoading = ref(true);
const showFormModal = ref(false);
const showNotificationModal = ref(false);
const notificationMessage = ref('');
const notificationType = ref('info');
const selectedStudent = ref(null);
const isEditMode = ref(false);

/** Get class code by classid */
const getClassCode = (classid) => {
  if (!classid) return 'Unassigned';
  const cls = classes.value.find(c => c.classid === classid);
  return cls?.class_code || 'Unassigned';
};

/** Enrich classes with level names */
const enrichedClasses = computed(() => {
  return classes.value.map(cls => ({
    ...cls,
    level: levels.value.find(l => l.levelid === cls.levelid)
  }));
});

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

/** Fetch levels for class display */
const fetchLevels = async () => {
  try {
    const response = await levelAPI.getAllLevels();
    if (response.data.success) {
      levels.value = response.data.data;
    }
  } catch (error) {
    console.error('Failed to fetch levels:', error);
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
  fetchLevels();
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
        <!-- Loading State -->
    <div v-if="loading" class="max-w-2xl mx-auto py-20">
      <LoadingBar :loading="true" color="blue" :duration="2000" />
      <p class="text-center text-gray-600 mt-4">Loading students...</p>
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
                {{ getClassCode(student.classid) }}
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
    <Modal 
      :show="showFormModal" 
      @close="showFormModal = false" 
      size="5xl" 
      :persistent="true"
      :title="isEditMode ? 'Edit Student' : 'Add New Student'"
      variant="gradient"
      :hide-footer="true"
    >
      <template #icon>
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </template>
      <template #content>
        <StudentForm
          :student="selectedStudent"
          :classes="enrichedClasses"
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
