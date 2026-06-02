<script setup>
import { ref, onMounted, computed } from 'vue';
import { classAPI, levelAPI, lecturerAPI, studentAPI } from '../../services/api';
import Modal from '../../components/ui/Modal.vue';

import { useConfirm } from '@/composables/useConfirm'
import ClassForm from './ClassForm.vue';

const classes = ref([]);
const levels = ref([]);
const lecturers = ref([]);
const students = ref([]);
const isLoading = ref(true);
const showFormModal = ref(false);
const selectedClass = ref(null);

const { open: confirmOpen, message: confirmMessage, confirm, onConfirm, onCancel } = useConfirm()
const isEditMode = ref(false);
const currentPage = ref(1);
const itemsPerPage = 15;

/** Paginated classes */
const paginatedClasses = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return classes.value.slice(start, end);
});

/** Total pages */
const totalPages = computed(() => {
  return Math.ceil(classes.value.length / itemsPerPage);
});

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

/** Format class schedule for display */
const formatSchedule = (classItem) => {
  const schedules = [];
  
  // Primary schedule
  if (classItem.schedule_day && classItem.schedule_time) {
    const day = classItem.schedule_day.substring(0, 3); // Mon, Tue, etc.
    const time = classItem.schedule_time.substring(0, 5); // HH:MM
    schedules.push(`${day} ${time}`);
  }
  
  // Secondary schedule
  if (classItem.schedule_day_2 && classItem.schedule_time_2) {
    const day = classItem.schedule_day_2.substring(0, 3);
    const time = classItem.schedule_time_2.substring(0, 5);
    schedules.push(`${day} ${time}`);
  }
  
  return schedules.length > 0 ? schedules.join(' & ') : null;
};

/** Fetch all classes from API */
const fetchClasses = async () => {
  try {
    isLoading.value = true;
    const response = await classAPI.getAllClasses();
    if (response.data.success) {
      classes.value = response.data.data;
    }
  } catch (error) {
    toast.add({ title: 'Error', description: 'Failed to load class data.', color: 'error' });
  } finally {
    isLoading.value = false;
  }
};

const fetchOptions = async () => {
  try {
    const [levelRes, lecturerRes, studentRes] = await Promise.all([
      levelAPI.getAllLevels(),
      lecturerAPI.getAllLecturers(),
      studentAPI.getAllStudents()
    ]);
    
    if (levelRes.data.success) {
      levels.value = levelRes.data.data;
    }
    
    if (lecturerRes.data.success) {
      lecturers.value = lecturerRes.data.data;
    }

    if (studentRes.data.success) {
      students.value = studentRes.data.data;
    }
  } catch (error) {
    console.error('Failed to fetch options:', error);
  }
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

const handleSave = async (formData) => {
  try {
    if (isEditMode.value) {
      await classAPI.updateClass(selectedClass.value.classid, formData);
      toast.add({ title: 'Success', description: 'Class updated successfully.', color: 'success' });
    } else {
      await classAPI.createClass(formData);
      toast.add({ title: 'Success', description: 'Class created successfully.', color: 'success' });
    }
    showFormModal.value = false;
    fetchClasses();
  } catch (error) {
    const message = error.response?.data?.message || 'An error occurred.';
    toast.add({ title: 'Error', description: `Failed to save class: ${message}`, color: 'error' });
  }
};

const handleStudentSave = async (studentData) => {
  try {
    const { toAdd, toRemove } = studentData;
    const classid = selectedClass.value.classid;

    const updatePromises = [];

    toAdd.forEach(studentid => {
      const student = students.value.find(s => s.studentid === studentid);
      if (student) {
        const userid = student.tbuser?.userid || student.userid;
        updatePromises.push(
          studentAPI.updateStudent(userid, { classid: classid })
        );
      }
    });

    toRemove.forEach(studentid => {
      const student = students.value.find(s => s.studentid === studentid);
      if (student) {
        const userid = student.tbuser?.userid || student.userid;
        updatePromises.push(
          studentAPI.updateStudent(userid, { classid: null })
        );
      }
    });

    await Promise.all(updatePromises);

    toast.add({ title: 'Success', description: `Successfully updated ${toAdd.length + toRemove.length} student(s).`, color: 'success' });
    showFormModal.value = false;
    
    await fetchOptions();
  } catch (error) {
    const message = error.response?.data?.message || 'An error occurred.';
    toast.add({ title: 'Error', description: `Failed to update students: ${message}`, color: 'error' });
  }
};

/** Delete class */
const handleDelete = async (classItem) => {
  if (await confirm(`Delete class "${classItem.class_code}"? This action cannot be undone.`)) {
    try {
      await classAPI.deleteClass(classItem.classid);
      toast.add({ title: 'Success', description: 'Class deleted successfully.', color: 'success' });
      fetchClasses();
    } catch (error) {
      toast.add({ title: 'Error', description: 'Failed to delete class.', color: 'error' });
    }
  }
};

onMounted(() => {
  fetchClasses();
  fetchOptions();
});
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-default">Manage Classes</h1>
        <p class="text-toned mt-1">Create, edit, and manage class records</p>
      </div>
      <UButton @click="openAddModal" color="primary" variant="solid" icon="i-lucide-plus">
        Add Class
      </UButton>
    </div>

    <div v-if="isLoading" class="flex justify-center py-16">
      <UIcon name="i-lucide-loader-circle" class="w-8 h-8 animate-spin text-muted" />
    </div>

    <div v-else class="bg-default rounded-xl shadow-sm border border-default overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-muted border-b border-default">
              <th class="px-6 py-4 text-left text-xs font-semibold text-default uppercase tracking-wider w-16">#</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-default uppercase tracking-wider">Class Code</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-default uppercase tracking-wider">Schedule</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-default uppercase tracking-wider">Level</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-default uppercase tracking-wider">Lecturer</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-default uppercase tracking-wider">Description</th>
              <th class="px-6 py-4 text-center text-xs font-semibold text-default uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(classItem, index) in paginatedClasses" 
              :key="classItem.classid"
              :class="index % 2 === 0 ? 'bg-default' : 'bg-muted'"
              class="border-b border-muted transition-colors"
            >
              <!-- Row Number -->
              <td class="px-6 py-4 text-sm text-muted text-right">
                {{ (currentPage - 1) * itemsPerPage + index + 1 }}
              </td>

              <!-- Class Code -->
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-default">{{ classItem.class_code }}</div>
              </td>

              <!-- Schedule -->
              <td class="px-6 py-4">
                <div v-if="formatSchedule(classItem)" class="flex items-center gap-1.5">
                  <UIcon name="i-lucide-clock" class="w-4 h-4 text-toned flex-shrink-0" />
                  <span class="text-sm text-default font-medium">{{ formatSchedule(classItem) }}</span>
                </div>
                <span v-else class="text-sm text-muted italic">No schedule</span>
              </td>

              <!-- Level -->
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-default">
                  {{ getLevelName(classItem.levelid) }}
                </span>
              </td>

              <!-- Lecturer -->
              <td class="px-6 py-4 text-sm text-default">
                {{ getLecturerName(classItem.lecturerid) }}
              </td>

              <!-- Description -->
              <td class="px-6 py-4 text-sm text-toned">
                {{ classItem.description || '-' }}
              </td>

              <!-- Actions -->
              <td class="px-6 py-4">
                <div class="flex justify-center gap-2">
                    <UButton @click="openEditModal(classItem)" color="primary" variant="solid" size="sm">
                      Edit
                    </UButton>
                  <UButton @click="handleDelete(classItem)" color="error" variant="solid" size="sm">
                    Delete
                  </UButton>
                </div>
              </td>
            </tr>
            <tr v-if="classes.length === 0">
              <td colspan="7" class="px-6 py-12 text-center">
                <div class="flex flex-col items-center justify-center text-muted">
                  <UIcon name="i-lucide-folder" class="w-12 h-12 mb-3 text-muted" />
                  <p class="text-sm font-medium">No classes found</p>
                  <p class="text-xs mt-1">Click "Add Class" to create one.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="totalPages > 1" class="px-6 py-4 bg-muted border-t border-default flex items-center justify-between">
        <p class="text-sm text-toned">
          Showing <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> to 
          <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, classes.length) }}</span> of 
          <span class="font-medium">{{ classes.length }}</span> classes
        </p>
        <UPagination v-model:page="currentPage" :total="classes.length" :max="itemsPerPage" :sibling-count="1" size="sm" />
      </div>
    </div>

    <!-- Form Modal -->
    <Modal 
      :show="showFormModal" 
      @close="showFormModal = false" 
      :persistent="true" 
      :title="isEditMode ? 'Edit Class' : 'Add New Class'"
      size="5xl"
      :hide-footer="true"
    >
      <template #icon>
        <UIcon name="i-lucide-users" class="w-6 h-6 text-white" />
      </template>
      <template #content>
        <ClassForm
          :class-item="selectedClass"
          :is-edit-mode="isEditMode"
          :levels="levels"
          :lecturers="lecturers"
          :all-students="students"
          :all-classes="classes"
          @close="showFormModal = false"
          @save="handleSave"
          @saveStudents="handleStudentSave"
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