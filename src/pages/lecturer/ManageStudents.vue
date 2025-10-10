<script setup>
import { ref, onMounted, computed } from 'vue';
import { useLecturerProfile } from '../../composables/useLecturerProfile';
import { classAPI, studentAPI, levelAPI } from '../../services/api';

const { lecturerProfile, isLoading: profileLoading } = useLecturerProfile();

const myClasses = ref([]);
const allStudents = ref([]);
const levels = ref([]);
const selectedClass = ref(null);
const isLoading = ref(true);
const errorMessage = ref('');

/** Get students for selected class */
const classStudents = computed(() => {
  if (!selectedClass.value) return [];
  return allStudents.value.filter(s => s.classid === selectedClass.value.classid);
});

/** Get level name by id */
const getLevelName = (levelid) => {
  const level = levels.value.find(l => l.levelid === levelid);
  return level?.name || '-';
};

/** Fetch lecturer's classes */
const fetchMyClasses = async () => {
  if (!lecturerProfile.value?.lecturerid) {
    errorMessage.value = 'Lecturer profile not found';
    isLoading.value = false;
    return;
  }

  try {
    isLoading.value = true;
    const lecturerid = lecturerProfile.value.lecturerid;

    const [classesRes, levelsRes] = await Promise.all([
      classAPI.getAllClasses(),
      levelAPI.getAllLevels()
    ]);

    if (classesRes.data.success) {
      myClasses.value = classesRes.data.data.filter(c => c.lecturerid === lecturerid);
    }

    if (levelsRes.data.success) {
      levels.value = levelsRes.data.data;
    }

    if (myClasses.value.length > 0) {
      selectedClass.value = myClasses.value[0];
    }

    await fetchStudents();
  } catch (error) {
    errorMessage.value = 'Failed to load classes';
    console.error('Error fetching classes:', error);
  } finally {
    isLoading.value = false;
  }
};

/** Fetch all students */
const fetchStudents = async () => {
  try {
    const res = await studentAPI.getAllStudents();
    if (res.data.success) {
      allStudents.value = res.data.data;
    }
  } catch (error) {
    console.error('Error fetching students:', error);
  }
};

/** Get gender label */
const getGenderLabel = (gender) => {
  if (gender === 'L') return 'Male';
  if (gender === 'P') return 'Female';
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

onMounted(async () => {
  if (!profileLoading.value && lecturerProfile.value) {
    await fetchMyClasses();
  } else {
    const interval = setInterval(() => {
      if (!profileLoading.value && lecturerProfile.value) {
        clearInterval(interval);
        fetchMyClasses();
      }
    }, 100);
  }
});
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold text-gray-900 mb-8">Manage Students</h1>

    <!-- Error Message -->
    <div v-if="errorMessage" class="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
      <p class="text-red-800">{{ errorMessage }}</p>
    </div>

    <!-- Loading -->
    <div v-if="isLoading || profileLoading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Main Content -->
    <div v-else-if="myClasses.length > 0" class="space-y-6">
      <!-- Class Selection -->
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Select Class</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            v-for="cls in myClasses"
            :key="cls.classid"
            @click="selectedClass = cls"
            :class="[
              'p-4 rounded-xl border-2 text-left transition-all',
              selectedClass?.classid === cls.classid
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            ]"
          >
            <h3 class="font-bold text-lg text-gray-900">{{ cls.class_code }}</h3>
            <p class="text-sm text-gray-600">{{ getLevelName(cls.levelid) }}</p>
            <p class="text-xs text-gray-500 mt-2">{{ cls.description || 'No description' }}</p>
          </button>
        </div>
      </div>

      <!-- Students Section -->
      <div v-if="selectedClass" class="bg-white rounded-2xl shadow-lg p-6">
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Students</h2>
          <p class="text-sm text-gray-600">Class: {{ selectedClass.class_code }}</p>
          <p class="text-sm text-gray-500 mt-1">Total: {{ classStudents.length }} student(s)</p>
        </div>

        <!-- No Students -->
        <div v-if="classStudents.length === 0" class="text-center py-12 text-gray-500">
          No students enrolled in this class yet.
        </div>

        <!-- Students List -->
        <div v-else class="space-y-4">
          <div
            v-for="student in classStudents"
            :key="student.studentid"
            class="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
          >
            <div class="flex items-start gap-4">
              <!-- Avatar -->
              <div class="flex-shrink-0">
                <div class="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                  {{ getInitials(student.fullname) }}
                </div>
              </div>

              <!-- Student Info -->
              <div class="flex-1 min-w-0">
                <h3 class="text-lg font-bold text-gray-900 mb-1">{{ student.fullname }}</h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <!-- Email -->
                  <div v-if="student.tbuser?.email" class="flex items-center gap-2 text-sm">
                    <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                    </svg>
                    <span class="text-gray-700 truncate">{{ student.tbuser.email }}</span>
                  </div>

                  <!-- Username -->
                  <div v-if="student.tbuser?.username" class="flex items-center gap-2 text-sm">
                    <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
                    </svg>
                    <span class="text-gray-700">@{{ student.tbuser.username }}</span>
                  </div>

                  <!-- Phone -->
                  <div v-if="student.phone" class="flex items-center gap-2 text-sm">
                    <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
                    </svg>
                    <span class="text-gray-700">{{ student.phone }}</span>
                  </div>

                  <!-- Gender -->
                  <div v-if="student.gender" class="flex items-center gap-2 text-sm">
                    <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd"></path>
                    </svg>
                    <span class="text-gray-700">{{ getGenderLabel(student.gender) }}</span>
                  </div>
                </div>

                <!-- Parent Info -->
                <div v-if="student.parentname || student.parentphone" class="mt-4 pt-4 border-t border-gray-100">
                  <p class="text-xs font-semibold text-gray-500 mb-2">PARENT/GUARDIAN</p>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div v-if="student.parentname" class="flex items-center gap-2 text-sm">
                      <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
                      </svg>
                      <span class="text-gray-700">{{ student.parentname }}</span>
                    </div>
                    <div v-if="student.parentphone" class="flex items-center gap-2 text-sm">
                      <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
                      </svg>
                      <span class="text-gray-700">{{ student.parentphone }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Classes -->
    <div v-else class="bg-white rounded-2xl shadow-lg p-12 text-center">
      <p class="text-gray-500 text-lg">You are not assigned to any classes yet.</p>
    </div>
  </div>
</template>
