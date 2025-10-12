<script setup>
import { ref, onMounted, computed } from 'vue';
import { useLecturerProfile } from '../../composables/useLecturerProfile';
import { classAPI, courseAPI, levelAPI } from '../../services/api';

const { lecturerProfile, isLoading: profileLoading } = useLecturerProfile();

const myClasses = ref([]);
const allCourses = ref([]);
const levels = ref([]);
const selectedClass = ref(null);
const isLoading = ref(true);
const errorMessage = ref('');
const successMessage = ref('');

/** Modal and form state */
const showModal = ref(false);
const editingCourse = ref(null);
const formData = ref({
  title: '',
  course_code: '',
  file: '',
  video_link: ''
});

/** Get courses for selected class */
const classCourses = computed(() => {
  if (!selectedClass.value) return [];
  return allCourses.value.filter(c => c.classid === selectedClass.value.classid);
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

    await fetchCourses();
  } catch (error) {
    errorMessage.value = 'Failed to load classes';
    console.error('Error fetching classes:', error);
  } finally {
    isLoading.value = false;
  }
};

/** Fetch all courses */
const fetchCourses = async () => {
  try {
    const res = await courseAPI.getAllCourses();
    if (res.data.success) {
      allCourses.value = res.data.data;
    }
  } catch (error) {
    console.error('Error fetching courses:', error);
  }
};

/** Reset form */
const resetForm = () => {
  formData.value = {
    title: '',
    course_code: '',
    file: '',
    video_link: ''
  };
  editingCourse.value = null;
  showModal.value = false;
};

/** Open add form */
const openAddForm = () => {
  resetForm();
  showModal.value = true;
};

/** Open edit form */
const openEditForm = (course) => {
  editingCourse.value = course;
  formData.value = {
    title: course.title,
    course_code: course.course_code || '',
    file: course.file || '',
    video_link: course.video_link || ''
  };
  showModal.value = true;
};

/** Save material */
const saveMaterial = async () => {
  if (!formData.value.title.trim()) {
    errorMessage.value = 'Title is required';
    return;
  }

  if (!selectedClass.value) {
    errorMessage.value = 'Please select a class';
    return;
  }

  try {
    const payload = {
      ...formData.value,
      classid: selectedClass.value.classid
    };

    if (editingCourse.value) {
      await courseAPI.updateCourse(editingCourse.value.courseid, payload);
      successMessage.value = 'Material updated successfully';
    } else {
      await courseAPI.createCourse(payload);
      successMessage.value = 'Material added successfully';
    }

    await fetchCourses();
    resetForm();
    
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
  } catch (error) {
    errorMessage.value = 'Failed to save material';
    console.error('Error saving material:', error);
  }
};

/** Delete material */
const deleteMaterial = async (courseid) => {
  if (!confirm('Are you sure you want to delete this material?')) return;

  try {
    await courseAPI.deleteCourse(courseid);
    successMessage.value = 'Material deleted successfully';
    await fetchCourses();
    
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
  } catch (error) {
    errorMessage.value = 'Failed to delete material';
    console.error('Error deleting material:', error);
  }
};

/** Format date */
const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-GB');
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
    <h1 class="text-4xl font-bold text-gray-900 mb-8">Manage Materials</h1>

    <!-- Messages -->
    <div v-if="successMessage" class="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
      <p class="text-green-800">{{ successMessage }}</p>
    </div>
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

      <!-- Materials Section -->
      <div v-if="selectedClass" class="bg-white rounded-2xl shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Materials</h2>
            <p class="text-sm text-gray-600">Class: {{ selectedClass.class_code }}</p>
          </div>
          <button
            @click="openAddForm"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add Material
          </button>
        </div>

        <!-- Materials List -->
        <div v-if="classCourses.length === 0" class="text-center py-12 text-gray-500">
          No materials yet. Click "Add Material" to get started.
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="course in classCourses"
            :key="course.courseid"
            class="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-lg font-bold text-gray-900">{{ course.title }}</h3>
                  <span v-if="course.course_code" class="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    {{ course.course_code }}
                  </span>
                </div>
                <p class="text-sm text-gray-500 mb-3">Uploaded: {{ formatDate(course.upload_date) }}</p>
                <div class="flex gap-2">
                  <a
                    v-if="course.file"
                    :href="course.file"
                    target="_blank"
                    class="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                  >
                    📄 File
                  </a>
                  <a
                    v-if="course.video_link"
                    :href="course.video_link"
                    target="_blank"
                    class="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                  >
                    🎥 Video
                  </a>
                </div>
              </div>
              <div class="flex gap-2 ml-4">
                <button
                  @click="openEditForm(course)"
                  class="px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  @click="deleteMaterial(course.courseid)"
                  class="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium"
                >
                  Delete
                </button>
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

    <!-- Material Form Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          @click.self="resetForm"
        >
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <!-- Modal Header -->
            <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h3 class="text-xl font-bold text-gray-900">
                {{ editingCourse ? 'Edit Material' : 'Add New Material' }}
              </h3>
              <button
                @click="resetForm"
                class="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Modal Body -->
            <div class="px-6 py-6 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Title <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.title"
                  type="text"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter material title"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Course Code</label>
                <input
                  v-model="formData.course_code"
                  type="text"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., ENG-101"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">File URL</label>
                <input
                  v-model="formData.file"
                  type="text"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/file.pdf"
                />
                <p class="text-xs text-gray-500 mt-1">Link to PDF, document, or other file</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Video Link</label>
                <input
                  v-model="formData.video_link"
                  type="text"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://youtube.com/watch?v=..."
                />
                <p class="text-xs text-gray-500 mt-1">YouTube, Vimeo, or other video platform</p>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
              <button
                @click="resetForm"
                class="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                @click="saveMaterial"
                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {{ editingCourse ? 'Update Material' : 'Save Material' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/** Modal transition animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.2s ease;
}

.modal-enter-from .bg-white {
  transform: scale(0.95);
}

.modal-leave-to .bg-white {
  transform: scale(0.95);
}
</style>
