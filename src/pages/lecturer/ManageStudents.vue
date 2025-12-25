<script setup>
import { ref, onMounted, computed, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import { useLecturerProfile } from '../../composables/useLecturerProfile';
import { classAPI, studentAPI, levelAPI } from '../../services/api';
import LoadingBar from '../../components/ui/LoadingBar.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import IconArrowLeft from '~icons/basil/arrow-left-solid';
import IconArrowRight from '~icons/basil/arrow-right-solid';

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

/** Class selector pagination */
const classCurrentPage = ref(1);
const classItemsPerPage = 5;

/** Class selector pagination computed properties */
const classTotalPages = computed(() => {
  if (myClasses.value.length === 0) return 1;
  return Math.ceil(myClasses.value.length / classItemsPerPage);
});

const shouldShowClassNavigation = computed(() => myClasses.value.length > classItemsPerPage);

const paginatedClasses = computed(() => {
  if (!shouldShowClassNavigation.value) return myClasses.value;
  const start = (classCurrentPage.value - 1) * classItemsPerPage;
  return myClasses.value.slice(start, start + classItemsPerPage);
});

const classJustifyMode = computed(() => {
  const count = paginatedClasses.value.length;
  return count <= 3 ? 'justify-center gap-4' : 'justify-start gap-3';
});

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
const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

/** Handle class selection */
const selectClass = (cls) => {
  selectedClass.value = cls;
  resetPagination();
  classCurrentPage.value = 1;
};

/** Go to page */
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const goToClassPage = (page) => {
  if (page >= 1 && page <= classTotalPages.value) {
    classCurrentPage.value = page;
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

/** Auto-fetch classes when profile loads */
watchEffect(() => {
  if (!profileLoading.value && lecturerProfile.value) {
    fetchMyClasses();
  }
});

onMounted(() => {
  // Trigger initial fetch if profile already loaded
  if (!profileLoading.value && lecturerProfile.value) {
    fetchMyClasses();
  }
});
</script>

<template>
  <h1 class="text-4xl font-bold text-gray-900 mb-8">Manage Students</h1>

    <!-- Error Message -->
    <div v-if="errorMessage" class="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
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
      <LoadingBar :loading="true" color="blue" :duration="2000" />
    </div>

    <!-- Main Content -->
    <div v-else-if="myClasses.length > 0" class="space-y-6">
      <!-- Class Selection -->
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Select Class</h2>
        
        <!-- Horizontal Card Selector with Pagination -->
        <div class="flex items-center gap-3">
          <!-- Previous Button -->
          <button
            v-if="shouldShowClassNavigation"
            @click="goToClassPage(classCurrentPage - 1)"
            :disabled="classCurrentPage === 1"
            class="flex-shrink-0 w-10 h-10 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center text-gray-600 transition-all hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-400 hover:text-blue-700 hover:scale-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-sm hover:shadow-md"
            aria-label="Previous classes"
          >
            <IconArrowLeft class="w-5 h-5" />
          </button>

          <!-- Cards Container -->
          <div class="flex-1 flex flex-wrap" :class="classJustifyMode">
            <button
              v-for="cls in paginatedClasses"
              :key="cls.classid"
              @click="selectClass(cls)"
              :class="[
                'flex-shrink-0 min-w-[160px] max-w-[220px] p-3 rounded-xl border-2 text-left transition-all shadow-sm hover:shadow-md',
                selectedClass?.classid === cls.classid
                  ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-indigo-50 scale-105'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'
              ]"
            >
              <h3 class="font-bold text-base text-gray-900 truncate">{{ cls.class_code }}</h3>
              <p class="text-xs text-gray-600 mt-1">{{ getLevelName(cls.levelid) }}</p>
              <p class="text-xs text-gray-500 mt-1 line-clamp-2">{{ cls.description || 'No description' }}</p>
            </button>
          </div>

          <!-- Next Button -->
          <button
            v-if="shouldShowClassNavigation"
            @click="goToClassPage(classCurrentPage + 1)"
            :disabled="classCurrentPage === classTotalPages"
            class="flex-shrink-0 w-10 h-10 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center text-gray-600 transition-all hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-400 hover:text-blue-700 hover:scale-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-sm hover:shadow-md"
            aria-label="Next classes"
          >
            <IconArrowRight class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Students Section -->
      <div v-if="selectedClass" class="bg-white rounded-2xl shadow-lg p-6">
        <div class="mb-4">
          <h2 class="text-2xl font-bold text-gray-900">Students</h2>
          <p class="text-sm text-gray-600">Class: {{ selectedClass.class_code }}</p>
        </div>

        <!-- Search Bar -->
        <div class="mb-4">
          <div class="relative">
            <input
              v-model="searchQuery"
              @input="resetPagination"
              type="text"
              placeholder="Search by name, email, username, or phone..."
              class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <p class="text-sm text-gray-500 mt-2">Total: {{ classStudents.length }} student(s)</p>
        </div>

        <!-- No Students -->
        <div v-if="classStudents.length === 0" class="text-center py-12 text-gray-500">
          {{ searchQuery ? 'No students found matching your search.' : 'No students enrolled in this class yet.' }}
        </div>

        <!-- Students Table -->
        <div v-else>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
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
                      class="inline-flex items-center justify-center w-10 h-10 border-2 border-blue-200 text-blue-600 rounded-full text-lg font-semibold transition-all hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-400 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 shadow-sm hover:shadow-md"
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
          <div v-if="totalPages > 1" class="mt-4 flex items-center justify-between">
            <p class="text-sm text-gray-600">
              Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, classStudents.length) }} of {{ classStudents.length }}
            </p>
            <div class="flex gap-2">
              <button
                @click="goToPage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="px-4 py-2 border-2 border-gray-300 text-gray-600 rounded-full text-sm font-semibold transition-all hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-400 hover:text-blue-700 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-sm hover:shadow-md"
              >
                Previous
              </button>
              <button
                v-for="page in totalPages"
                :key="page"
                @click="goToPage(page)"
                :class="[
                  'px-4 py-2 border-2 rounded-full text-sm font-semibold transition-all shadow-sm hover:shadow-md',
                  currentPage === page
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 scale-105'
                    : 'border-gray-300 text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-400 hover:text-blue-700 hover:scale-105 active:scale-95'
                ]"
              >
                {{ page }}
              </button>
              <button
                @click="goToPage(currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="px-4 py-2 border-2 border-gray-300 text-gray-600 rounded-full text-sm font-semibold transition-all hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-400 hover:text-blue-700 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-sm hover:shadow-md"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Classes -->
    <div v-else class="bg-white rounded-2xl shadow-lg p-12 text-center">
      <p class="text-gray-500 text-lg">You are not assigned to any classes yet.</p>
    </div>
</template>
