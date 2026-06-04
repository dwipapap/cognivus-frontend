<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useLecturerProfile } from '../../composables/useLecturerProfile';
import { classAPI, studentAPI, levelAPI } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import ClassSidebar from '../../components/lecturer/ClassSidebar.vue';
import { getInitials } from '../../utils/formatters';

const router = useRouter();
const { lecturerProfile, isLoading: profileLoading } = useLecturerProfile();

const myClasses = ref([]);
const allStudents = ref([]);
const levels = ref([]);
const selectedClass = ref(null);
const isLoading = ref(true);
const errorMessage = ref('');
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 15;

/** Get students for selected class */
const classStudents = computed(() => {
  if (!selectedClass.value) return [];
  let students = allStudents.value.filter(s => s.classid === selectedClass.value.classid);
  
  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    students = students.filter(s => 
      s.fullname?.toLowerCase().includes(query) ||
      s.tbuser?.email?.toLowerCase().includes(query) ||
      s.tbuser?.username?.toLowerCase().includes(query) ||
      s.phone?.includes(query)
    );
  }
  
  return students;
});

/** Paginated students */
const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return classStudents.value.slice(start, end);
});

/** Total pages */
const totalPages = computed(() => {
  return Math.ceil(classStudents.value.length / itemsPerPage);
});

/** Reset to first page when search or class changes */
const resetPagination = () => {
  currentPage.value = 1;
};

/** Get level name by id */
const getLevelName = (levelid) => {
  const level = levels.value.find(l => l.levelid === levelid);
  return level?.name || '-';
};

/** Fetch lecturer's classes and students in parallel */
const fetchMyClasses = async () => {
  if (!lecturerProfile.value?.lecturerid) {
    errorMessage.value = 'Lecturer profile not found';
    isLoading.value = false;
    return;
  }

  try {
    isLoading.value = true;
    errorMessage.value = '';
    const lecturerid = lecturerProfile.value.lecturerid;

    const [classesRes, levelsRes, studentsRes] = await Promise.all([
      classAPI.getAllClasses(),
      levelAPI.getAllLevels(),
      studentAPI.getAllStudents()
    ]);

    if (classesRes.data.success) {
      myClasses.value = classesRes.data.data.filter(c => c.lecturerid === lecturerid);
    }

    if (levelsRes.data.success) {
      levels.value = levelsRes.data.data;
    }

    if (studentsRes.data.success) {
      allStudents.value = studentsRes.data.data;
    }

    if (myClasses.value.length > 0) {
      selectedClass.value = myClasses.value[0];
    }
  } catch (error) {
    errorMessage.value = 'Failed to load classes';
    console.error('Error fetching classes:', error);
  } finally {
    isLoading.value = false;
  }
};

/** Get gender label */
const getGenderLabel = (gender) => {
  if (gender === 'L') return 'Male';
  if (gender === 'F') return 'Female';
  return '-';
};

/** Get initials from name */

/** Handle class selection */
const selectClass = (cls) => {
  selectedClass.value = cls;
  resetPagination();
};

/** Go to page */
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

/** Navigate to student details */
const viewStudentDetails = (student) => {
  const userId = student.tbuser?.userid || student.userid;
  if (!userId) {
    console.error('User ID not found for student:', student);
    return;
  }
  router.push({ name: 'StudentDetail', params: { id: userId } });
};

/** Auto-fetch classes when lecturer profile becomes available */
watch(
  () => (!profileLoading.value && lecturerProfile.value?.lecturerid) || null,
  (ready) => {
    if (ready) {
      fetchMyClasses();
    }
  },
  { immediate: true }
);
</script>

<template>
  <h1 class="text-4xl font-bold text-gray-900 mb-8">Manage Students</h1>

  <!-- Error Message -->
  <div v-if="errorMessage" class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
    <div class="flex items-center justify-between">
      <p class="text-red-800">{{ errorMessage }}</p>
      <button 
        @click="fetchMyClasses"
        class="px-4 py-2 text-sm font-semibold text-red-700 hover:text-white bg-gradient-to-r from-red-50 to-rose-50 hover:from-red-600 hover:to-rose-600 border-2 border-red-200 hover:border-red-600 rounded-full transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
      >
        Retry
      </button>
    </div>
  </div>

  <!-- Loading -->
  <div v-if="isLoading || profileLoading" class="max-w-2xl mx-auto py-20">
    <LoadingSpinner size="lg" color="blue" :center="true" />
  </div>

  <!-- Main Content -->
  <div v-else-if="myClasses.length > 0" class="flex flex-col md:flex-row gap-6 items-start">
    
    <!-- Sidebar Class Selector -->
    <div class="w-full md:w-64 flex-shrink-0">
      <ClassSidebar
        :classes="myClasses"
        :levels="levels"
        :selected-class="selectedClass"
        @select="selectClass"
      />
    </div>

    <!-- Students Section -->
    <div v-if="selectedClass" class="flex-1 min-w-0 flex flex-col gap-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 tracking-tight">Students</h2>
        <p class="text-sm text-gray-500 mt-1">Class: {{ selectedClass.class_code }}</p>
      </div>

      <!-- Search Bar -->
      <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-2">
        <div class="relative">
          <input
            v-model="searchQuery"
            @input="resetPagination"
            type="text"
            placeholder="Search by name, email, username, or phone..."
            class="w-full px-4 py-3 pl-11 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-blue-500 transition-all text-sm"
          />
          <svg class="absolute left-4 top-3.5 w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path>
          </svg>
        </div>
        <p class="text-xs text-gray-500 font-medium px-1">Total: {{ classStudents.length }} student(s)</p>
      </div>

      <!-- Content Container -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <!-- No Students -->
        <div v-if="classStudents.length === 0" class="text-center py-16 text-gray-500">
          {{ searchQuery ? 'No students found matching your search.' : 'No students enrolled in this class yet.' }}
        </div>

        <!-- Students Table -->
        <div v-else class="w-full max-w-full overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-100">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr 
              v-for="student in paginatedStudents"
              :key="student.studentid"
              v-memo="[student.studentid, student.fullname]"
              class="hover:bg-gray-50"
            >
              <!-- Student Info -->
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {{ getInitials(student.fullname) }}
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">{{ student.fullname }}</p>
                    <p v-if="student.tbuser?.username" class="text-xs text-gray-500">@{{ student.tbuser.username }}</p>
                  </div>
                </div>
              </td>

              <!-- Contact Info -->
              <td class="px-4 py-3">
                <div class="space-y-1">
                  <p v-if="student.tbuser?.email" class="text-sm text-gray-700 truncate">{{ student.tbuser.email }}</p>
                  <p v-if="student.phone" class="text-xs text-gray-500">{{ student.phone }}</p>
                </div>
              </td>

              <!-- Gender -->
              <td class="px-4 py-3">
                <span class="text-sm text-gray-700">{{ getGenderLabel(student.gender) }}</span>
              </td>

              <!-- Parent Info -->
              <td class="px-4 py-3">
                <div v-if="student.parentname || student.parentphone" class="space-y-1">
                  <p v-if="student.parentname" class="text-sm text-gray-700">{{ student.parentname }}</p>
                  <p v-if="student.parentphone" class="text-xs text-gray-500">{{ student.parentphone }}</p>
                </div>
                <span v-else class="text-sm text-gray-400">-</span>
              </td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                  {{ selectedClass?.class_code || 'Unassigned' }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800">
                  {{ getLevelName(selectedClass?.levelid) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <button
                  type="button"
                  @click="viewStudentDetails(student)"
                  class="inline-flex items-center justify-center w-10 h-10 border-2 border-blue-200 text-blue-600 rounded-full text-lg font-semibold transition-all hover:bg-blue-50 hover:border-blue-400 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 shadow-sm hover:shadow-md"
                >
                  <span aria-hidden="true">&gt;</span>
                  <span class="sr-only">View details</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <p class="text-sm text-gray-600">
            Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, classStudents.length) }} of {{ classStudents.length }}
          </p>
          <div class="flex gap-2">
            <button
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-4 py-2 border border-gray-200 bg-white text-gray-600 rounded-full text-sm font-semibold transition-all hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Previous
            </button>
            <button
              v-for="page in totalPages"
              :key="page"
              @click="goToPage(page)"
              :class="[
                'w-9 h-9 border rounded-full text-sm font-semibold transition-all shadow-sm flex items-center justify-center',
                currentPage === page
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
              ]"
            >
              {{ page }}
            </button>
            <button
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="px-4 py-2 border border-gray-200 bg-white text-gray-600 rounded-full text-sm font-semibold transition-all hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- No Classes -->
  <div v-else class="bg-white rounded-lg shadow-lg p-12 text-center">
    <p class="text-gray-500 text-lg">You are not assigned to any classes yet.</p>
  </div>
</template>
