<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useToast } from '@nuxt/ui/composables';
import { useRouter } from 'vue-router';
import { studentAPI, userAPI, classAPI, levelAPI } from '../../services/api';
import Modal from '../../components/ui/Modal.vue';
import { useConfirm } from '@/composables/useConfirm'
import StudentForm from './StudentForm.vue';

const router = useRouter();
const students = ref([]);
const classes = ref([]);
const levels = ref([]);
const isLoading = ref(true);
const showFormModal = ref(false);
const selectedStudent = ref(null);
const toast = useToast();

const { open: confirmOpen, message: confirmMessage, confirm, onConfirm, onCancel } = useConfirm()
const isEditMode = ref(false);
const selectedClassFilter = ref('');
const searchQuery = ref('');
const studentPage = ref(1);
const studentPageSize = 20;

/** Get class code by classid */
const getClassCode = (classid) => {
  if (!classid) return 'Unassigned';
  const cls = classes.value.find(c => c.classid === classid);
  return cls?.class_code || 'Unassigned';
};

/** Get level name by student's classid */
const getStudentLevel = (classid) => {
  if (!classid) return 'Unassigned';
  const cls = classes.value.find(c => c.classid === classid);
  if (!cls?.levelid) return 'Unassigned';
  const level = levels.value.find(l => l.levelid === cls.levelid);
  return level?.name || 'Unassigned';
};

/** Enrich classes with level names */
const enrichedClasses = computed(() => {
  return classes.value.map(cls => ({
    ...cls,
    level: levels.value.find(l => l.levelid === cls.levelid)
  }));
});

/** Filtered students based on class and name */
const filteredStudents = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  return students.value.filter(student =>
    (!selectedClassFilter.value || student.classid === selectedClassFilter.value) &&
    (!query || student.fullname?.toLowerCase().includes(query))
  );
});

watch([selectedClassFilter, searchQuery], () => {
  studentPage.value = 1;
});

const clearFilters = () => {
  selectedClassFilter.value = '';
  searchQuery.value = '';
};

const paginatedStudents = computed(() => {
  const start = (studentPage.value - 1) * studentPageSize;
  const end = start + studentPageSize;
  return filteredStudents.value.slice(start, end);
});

/** Fetch all students */
const fetchStudents = async () => {
  try {
    isLoading.value = true;
    const response = await studentAPI.getAllStudents();
    if (response.data.success) {
      students.value = response.data.data;
      studentPage.value = Math.min(studentPage.value, Math.ceil(filteredStudents.value.length / studentPageSize) || 1);
    }
  } catch (error) {
    toast.add({ title: 'Error', description: 'Failed to load student data.', color: 'error' });
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
        relationship: formData.relationship || null,
        classid: formData.classid ? Number(formData.classid) : null,
        payment_type: formData.payment_type || null,
        occupation: formData.occupation || null,
        program_interest: formData.program_interest || null,
        english_level: formData.english_level || null,
        referral_source: formData.referral_source || null,
        learning_mode: formData.learning_mode || null,
        preferred_time: formData.preferred_time || null,
        studied_before: formData.studied_before || null,
        learning_reason: formData.learning_reason || null
      };
      const previousStudentData = {
        fullname: selectedStudent.value.fullname,
        gender: selectedStudent.value.gender,
        birthdate: selectedStudent.value.birthdate || null,
        birthplace: selectedStudent.value.birthplace || null,
        phone: selectedStudent.value.phone || null,
        address: selectedStudent.value.address || null,
        parentname: selectedStudent.value.parentname || null,
        parentphone: selectedStudent.value.parentphone || null,
        relationship: selectedStudent.value.relationship || null,
        classid: selectedStudent.value.classid ?? null,
        payment_type: selectedStudent.value.payment_type || null,
        occupation: selectedStudent.value.occupation || null,
        program_interest: selectedStudent.value.program_interest || null,
        english_level: selectedStudent.value.english_level || null,
        referral_source: selectedStudent.value.referral_source || null,
        learning_mode: selectedStudent.value.learning_mode || null,
        preferred_time: selectedStudent.value.preferred_time || null,
        studied_before: selectedStudent.value.studied_before || null,
        learning_reason: selectedStudent.value.learning_reason || null
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
        try {
          await userAPI.updateUser(userId, userData);
        } catch (error) {
          await studentAPI.updateStudent(userId, previousStudentData);
          throw new Error('Account update failed; the student profile was restored.');
        }
      }

      toast.add({ title: 'Success', description: 'Student updated successfully!', color: 'success' });
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
      toast.add({ title: 'Success', description: 'Student created successfully!', color: 'success' });
    }
    
    showFormModal.value = false;
    fetchStudents();
  } catch (error) {
    toast.add({ title: 'Error', description: error.response?.data?.message || 'Failed to save student.', color: 'error' });
  }
};

/** Handle delete */
const handleDelete = async (student) => {
  if (!await confirm(`Delete student "${student.fullname}"? This will permanently remove all student and user account data.`)) return;

  try {
    // Get userid for deletion (backend expects userid, not studentid)
    const userId = student.tbuser?.userid || student.userid;
    if (!userId) {
      throw new Error('User ID not found for delete operation');
    }

    // These two deletes require a backend transaction to be atomic.
    await studentAPI.deleteStudent(userId);
    try {
      await userAPI.deleteUser(userId);
    } catch (error) {
      throw new Error('Student data was deleted, but the user account could not be deleted. Please contact support before retrying.');
    }
    
    toast.add({ title: 'Success', description: 'Student and user account deleted successfully!', color: 'success' });
    fetchStudents();
  } catch (error) {
    toast.add({ title: 'Error', description: error.response?.data?.message || 'Failed to delete student.', color: 'error' });
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
          <h1 class="text-2xl font-bold text-default">Manage Students</h1>
          <p class="text-toned mt-1">Create, edit, and manage student records</p>
        </div>
        <UButton @click="openAddModal" color="primary" variant="solid" icon="i-lucide-plus">
          Add Student
        </UButton>
      </div>

      <!-- Filter Section -->
      <div class="bg-default rounded-lg border border-default p-4 shadow-sm">
        <div class="flex flex-col md:flex-row gap-4 items-end">
          <div class="w-full md:flex-1">
            <UFormField label="Search">
              <UInput v-model="searchQuery" icon="i-lucide-search" placeholder="Search by student name..." />
            </UFormField>
          </div>
          <div class="w-full md:w-64">
            <UFormField label="Class">
              <USelect v-model="selectedClassFilter" :items="classes.map(cls => ({ label: cls.class_code + (cls.branch ? ' (' + cls.branch + ')' : '') + ' - ' + (cls.level?.name || 'Unknown Level'), value: cls.classid }))" placeholder="All Classes" clearable />
            </UFormField>
          </div>
          <UButton v-if="selectedClassFilter || searchQuery" @click="clearFilters" color="neutral" variant="ghost" size="xs" icon="i-lucide-x">
            Clear Filters
          </UButton>
        </div>
        <div class="mt-3 text-sm text-muted">
          Showing {{ filteredStudents.length }} of {{ students.length }} students
        </div>
      </div>
    </div>

    <!-- Students Table skeleton -->
    <div v-if="isLoading" class="bg-default rounded-lg border border-default shadow-sm overflow-hidden">
      <div class="divide-y divide-muted">
        <div v-for="i in 6" :key="i" class="flex items-center gap-4 px-4 py-4">
          <USkeleton class="h-4 w-8" />
          <USkeleton class="h-4 flex-1" />
          <USkeleton class="h-4 w-48" />
          <USkeleton class="h-4 w-24" />
          <USkeleton class="h-4 w-24" />
          <USkeleton class="h-8 w-32" />
        </div>
      </div>
    </div>

    <div v-else class="bg-default rounded-lg border border-default shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-muted border-b border-default">
              <th class="px-4 py-3 text-right text-xs font-semibold text-toned uppercase tracking-wider w-16">#</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-toned uppercase tracking-wider">Name</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-toned uppercase tracking-wider">Email</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-toned uppercase tracking-wider">Class</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-toned uppercase tracking-wider">Level</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-toned uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(student, index) in paginatedStudents" :key="student.studentid" 
              class="border-b border-default transition-colors"
              :class="index % 2 === 0 ? 'bg-default' : 'bg-muted'"
            >
              <td class="px-4 py-3 text-right text-sm text-muted font-medium">{{ (studentPage - 1) * studentPageSize + index + 1 }}</td>
              <td class="px-4 py-3">
                <div class="text-sm font-semibold text-default">{{ student.fullname }}</div>
              </td>
              <td class="px-4 py-3">
                <a v-if="student.tbuser?.email" 
                  :href="`mailto:${student.tbuser.email}`"
                  class="text-sm text-default hover:text-default hover:underline">
                  {{ student.tbuser.email }}
                </a>
                <span v-else class="text-sm text-muted">No email</span>
              </td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-muted text-default">
                  {{ getClassCode(student.classid) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-muted text-default">
                  {{ getStudentLevel(student.classid) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex justify-center gap-2">
                  <UButton @click="viewStudentDetail(student)" color="neutral" variant="soft" size="sm">
                    View
                  </UButton>
                  <UButton @click="openEditModal(student)" color="primary" variant="solid" size="sm">
                    Edit
                  </UButton>
                  <UButton @click="handleDelete(student)" color="error" variant="solid" size="sm">
                    Delete
                  </UButton>
                </div>
              </td>
            </tr>
            <tr v-if="paginatedStudents.length === 0">
              <td colspan="6" class="px-4 py-12 text-center">
                <div class="text-muted">
                  <UIcon name="i-lucide-users" class="mx-auto h-12 w-12 mb-4" />
                  <p class="text-sm font-medium text-default">No students found</p>
                  <p class="text-sm text-muted mt-1">
                    {{ searchQuery || selectedClassFilter ? 'Try adjusting your search or filters' : 'Click "Add Student" to create one' }}
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="filteredStudents.length > studentPageSize" class="flex items-center justify-between px-4 py-3 bg-muted border-t border-default">
      <p class="text-sm text-toned">
        Showing {{ (studentPage - 1) * studentPageSize + 1 }} to {{ Math.min(studentPage * studentPageSize, filteredStudents.length) }} of {{ filteredStudents.length }} students
      </p>
      <UPagination v-model:page="studentPage" :total="filteredStudents.length" :max="studentPageSize" :sibling-count="1" size="sm" />
    </div>

    <!-- Form Modal -->
    <Modal 
      :show="showFormModal" 
      @close="showFormModal = false" 
      size="5xl" 
      :persistent="true"
      :title="isEditMode ? 'Edit Student' : 'Add New Student'"
      :hide-footer="true"
    >
      <template #icon>
        <UIcon name="i-lucide-users" class="w-6 h-6 text-white" />
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

  </div>

  <UModal v-model:open="confirmOpen" :title="confirmMessage">
    <template #footer>
      <UButton label="Cancel" color="neutral" variant="outline" @click="onCancel" />
      <UButton label="Delete" color="error" @click="onConfirm" />
    </template>
  </UModal>
</template>
