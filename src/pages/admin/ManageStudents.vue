<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { studentAPI, userAPI, classAPI, levelAPI } from '../../services/api';
import Modal from '../../components/ui/Modal.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import BaseSelect from '../../components/form/BaseSelect.vue';
import StudentForm from './StudentForm.vue';

const router = useRouter();
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
const selectedClassFilter = ref('');

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

/** Filtered students based on selected class */
const filteredStudents = computed(() => {
  if (!selectedClassFilter.value) {
    return students.value;
  }
  return students.value.filter(student => student.classid === selectedClassFilter.value);
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

/** Navigate to student detail page */
const viewStudentDetail = (student) => {
  const userId = student.tbuser?.userid || student.userid;
  router.push({ name: 'AdminStudentDetail', params: { id: userId } });
};

/** Handle save */
const handleSave = async (formData) => {
  try {
    if (isEditMode.value) {
      // Get userid for update operations
      const userId = selectedStudent.value.tbuser?.userid || selectedStudent.value.userid;
      if (!userId) {
        throw new Error('User ID not found for update operation');
      }

      // Prepare student data (fields that go to tbstudent)
      const studentData = {
        fullname: formData.fullname,
        gender: formData.gender === 'Male' ? 'L' : formData.gender === 'Female' ? 'P' : formData.gender,
        birthdate: formData.birthdate || null,
        birthplace: formData.birthplace || null,
        phone: formData.phone || null,
        address: formData.address || null,
        parentname: formData.parentname || null,
        parentphone: formData.parentphone || null,
        classid: formData.classid ? Number(formData.classid) : null,
        payment_type: formData.payment_type || null
      };

      // Prepare user data (fields that go to tbuser) - only if provided
      const userData = {};
      if (formData.email && formData.email.trim()) userData.email = formData.email;
      if (formData.password && formData.password.trim()) userData.password = formData.password;
      if (formData.username && formData.username.trim()) userData.username = formData.username;

      // Update student data
      await studentAPI.updateStudent(userId, studentData);
      
      // Update user credentials if any were provided
      if (Object.keys(userData).length > 0) {
        await userAPI.updateUser(userId, userData);
      }

      showNotification('success', 'Student updated successfully!');
    } else {
      // Create mode: combine all data
      const createData = {
        ...formData,
        gender: formData.gender === 'Male' ? 'L' : formData.gender === 'Female' ? 'P' : formData.gender,
        classid: formData.classid ? Number(formData.classid) : null,
        birthdate: formData.birthdate || null,
        birthplace: formData.birthplace || null,
        phone: formData.phone || null,
        address: formData.address || null,
        parentname: formData.parentname || null,
        parentphone: formData.parentphone || null,
        payment_type: formData.payment_type || null
      };
      
      await studentAPI.createStudent(createData);
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
  if (!confirm(`Delete student "${student.fullname}"? This will permanently remove all student and user account data.`)) return;

  try {
    // Get userid for deletion (backend expects userid, not studentid)
    const userId = student.tbuser?.userid || student.userid;
    if (!userId) {
      throw new Error('User ID not found for delete operation');
    }

    // Delete from both tbstudent and tbuser tables
    await studentAPI.deleteStudent(userId);
    await userAPI.deleteUser(userId);
    
    showNotification('success', 'Student and user account deleted successfully!');
    fetchStudents();
  } catch (error) {
    showNotification('error', error.response?.data?.message || 'Failed to delete student.');
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
    <div class="mb-6">
      <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Manage Students</h1>
          <p class="text-gray-600 mt-1">Create, edit, and manage student records</p>
        </div>
        <BaseButton @click="openAddModal" variant="primary" size="md">
          <template #icon>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
          </template>
          Add Student
        </BaseButton>
      </div>

      <!-- Filter Section -->
      <div class="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div class="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <label class="text-sm font-medium text-gray-700 whitespace-nowrap">Filter by Class:</label>
          <div class="w-full md:w-64">
            <select 
              v-model="selectedClassFilter"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">All Classes</option>
              <option v-for="cls in classes" :key="cls.classid" :value="cls.classid">
                {{ cls.class_code }} - {{ cls.level?.level_name || 'Unknown Level' }}
              </option>
            </select>
          </div>
          <div class="text-sm text-gray-500">
            Showing {{ filteredStudents.length }} of {{ students.length }} students
          </div>
        </div>
      </div>
    </div>

    <!-- Students Table -->
    <div v-if="isLoading" class="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
      <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
      <p class="text-gray-600 mt-4">Loading students...</p>
    </div>

    <div v-else class="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider w-16">#</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Class</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(student, index) in filteredStudents" :key="student.studentid" 
              class="border-b border-gray-200 transition-colors"
              :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-50'"
            >
              <td class="px-4 py-3 text-right text-sm text-gray-500 font-medium">{{ index + 1 }}</td>
              <td class="px-4 py-3">
                <div class="text-sm font-semibold text-gray-900">{{ student.fullname }}</div>
              </td>
              <td class="px-4 py-3">
                <a v-if="student.tbuser?.email" 
                  :href="`mailto:${student.tbuser.email}`"
                  class="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                  {{ student.tbuser.email }}
                </a>
                <span v-else class="text-sm text-gray-400">No email</span>
              </td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                  {{ getClassCode(student.classid) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span v-if="student.payment_type" 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium" 
                  :class="student.payment_type === 'Full' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'">
                  {{ student.payment_type }}
                </span>
                <span v-else class="text-sm text-gray-400">-</span>
              </td>
              <td class="px-4 py-3">
                <div class="flex justify-center gap-2">
                  <BaseButton 
                    @click="viewStudentDetail(student)" 
                    variant="primary" 
                    size="sm"
                  >
                    View
                  </BaseButton>
                  <BaseButton 
                    @click="handleDelete(student)" 
                    variant="danger" 
                    size="sm"
                  >
                    Delete
                  </BaseButton>
                </div>
              </td>
            </tr>
            <tr v-if="filteredStudents.length === 0">
              <td colspan="6" class="px-4 py-12 text-center">
                <div class="text-gray-400">
                  <svg class="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                  </svg>
                  <p class="text-sm font-medium text-gray-900">No students found</p>
                  <p class="text-sm text-gray-500 mt-1">
                    {{ selectedClassFilter ? 'Try selecting a different class or clear the filter' : 'Click "Add Student" to create one' }}
                  </p>
                </div>
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
