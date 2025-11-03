<script setup>
import { ref, onMounted, computed, watch, watchEffect } from 'vue';
import { useLecturerProfile } from '../../composables/useLecturerProfile';
import { classAPI, courseAPI, courseFileAPI, levelAPI } from '../../services/api';
import BaseFileUpload from '../../components/form/BaseFileUpload.vue';
import BaseInput from '../../components/form/BaseInput.vue';
import BaseTextarea from '../../components/form/BaseTextarea.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import LoadingBar from '../../components/ui/LoadingBar.vue';
import ConfirmDialog from '../../components/ui/ConfirmDialog.vue';

const { lecturerProfile, isLoading: profileLoading } = useLecturerProfile();

const myClasses = ref([]);
const allCourses = ref([]);
const levels = ref([]);
const selectedClass = ref(null);
const isLoading = ref(true);
const errorMessage = ref('');
const successMessage = ref('');
const currentPage = ref(1);
const itemsPerPage = 5;

/** Modal and form state */
const showModal = ref(false);
const editingCourse = ref(null);
const existingFiles = ref([]);
const formData = ref({
  title: '',
  course_code: '',
  description: '',
  video_link: ''
});
const uploadFiles = ref([]);
const isUploading = ref(false);
const isDeletingFile = ref(false);

/** Confirmation dialog state */
const showConfirmDialog = ref(false);
const confirmAction = ref(null);
const confirmConfig = ref({
  title: '',
  message: '',
  variant: 'danger'
});

/** Get courses for selected class with file count */
const classCourses = computed(() => {
  if (!selectedClass.value) return [];
  return allCourses.value.filter(c => c.classid === selectedClass.value.classid);
});

const totalPages = computed(() => {
  if (classCourses.value.length === 0) return 1;
  return Math.ceil(classCourses.value.length / itemsPerPage);
});

const shouldPaginate = computed(() => classCourses.value.length > itemsPerPage);

const paginatedClassCourses = computed(() => {
  if (!shouldPaginate.value) return classCourses.value;
  const start = (currentPage.value - 1) * itemsPerPage;
  return classCourses.value.slice(start, start + itemsPerPage);
});

/** Get file count for a course */
const getFileCount = (course) => {
  return course.tbcourse_files?.length || 0;
};

/** Get level name by id */
const getLevelName = (levelid) => {
  const level = levels.value.find(l => l.levelid === levelid);
  return level?.name || '-';
};

/** Fetch lecturer's classes and courses in parallel */
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

    const [classesRes, levelsRes, coursesRes] = await Promise.all([
      classAPI.getAllClasses(),
      levelAPI.getAllLevels(),
      courseAPI.getAllCourses()
    ]);

    if (classesRes.data.success) {
      myClasses.value = classesRes.data.data.filter(c => c.lecturerid === lecturerid);
    }

    if (levelsRes.data.success) {
      levels.value = levelsRes.data.data;
    }

    if (coursesRes.data.success) {
      allCourses.value = coursesRes.data.data;
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
    description: '',
    video_link: ''
  };
  uploadFiles.value = [];
  existingFiles.value = [];
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
    description: course.description || '',
    video_link: course.video_link || ''
  };
  existingFiles.value = course.tbcourse_files || [];
  showModal.value = true;
};

/** Show confirmation dialog */
const showConfirmation = (config, action) => {
  confirmConfig.value = config;
  confirmAction.value = action;
  showConfirmDialog.value = true;
};

/** Handle confirmation */
const handleConfirm = async () => {
  if (confirmAction.value) {
    await confirmAction.value();
  }
  showConfirmDialog.value = false;
};

/** Handle cancel */
const handleCancel = () => {
  showConfirmDialog.value = false;
  confirmAction.value = null;
};

/** Delete an existing course file */
const deleteExistingFile = (fileId) => {
  showConfirmation(
    {
      title: 'Delete File',
      message: 'Are you sure you want to delete this file? This action cannot be undone.',
      variant: 'danger'
    },
    async () => {
      try {
        isDeletingFile.value = true;
        await courseFileAPI.deleteCourseFile(fileId);
        existingFiles.value = existingFiles.value.filter(f => f.cfid !== fileId);
        successMessage.value = 'File deleted successfully';
        setTimeout(() => successMessage.value = '', 3000);
      } catch (error) {
        errorMessage.value = 'Failed to delete file';
        console.error('Error deleting file:', error);
      } finally {
        isDeletingFile.value = false;
      }
    }
  );
};

/** Save material (files optional) */
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
    isUploading.value = true;
    const payload = {
      title: formData.value.title,
      course_code: formData.value.course_code,
      description: formData.value.description,
      video_link: formData.value.video_link,
      classid: selectedClass.value.classid
    };

    // Upload files only if provided
    const filesToUpload = uploadFiles.value.length > 0 ? uploadFiles.value : null;
    
    if (editingCourse.value) {
      await courseAPI.updateCourse(editingCourse.value.courseid, payload, filesToUpload);
      successMessage.value = 'Material updated successfully';
    } else {
      await courseAPI.createCourse(payload, filesToUpload);
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
  } finally {
    isUploading.value = false;
  }
};

/** Delete material */
const deleteMaterial = (courseid) => {
  showConfirmation(
    {
      title: 'Delete Material',
      message: 'Are you sure you want to delete this material? All associated files will also be deleted. This action cannot be undone.',
      variant: 'danger'
    },
    async () => {
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
    }
  );
};

/** Format date */
const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-GB');
};

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

watch(() => selectedClass.value?.classid, () => {
  currentPage.value = 1;
});

watch(classCourses, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value;
  }
});

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
  <div class="max-w-7xl mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold text-gray-900 mb-8">Manage Materials</h1>

    <!-- Messages -->
    <div v-if="successMessage" class="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
      <p class="text-green-800">{{ successMessage }}</p>
    </div>
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
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            v-for="cls in myClasses"
            :key="cls.classid"
            @click="selectedClass = cls"
            :class="[
              'p-4 rounded-2xl border-2 text-left transition-all shadow-sm hover:shadow-lg',
              selectedClass?.classid === cls.classid
                ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-indigo-50 scale-105'
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'
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
            class="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full hover:from-blue-700 hover:to-blue-800 hover:scale-105 active:scale-95 transition-all shadow-md hover:shadow-lg font-semibold"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Material
          </button>
        </div>

        <!-- Materials List -->
        <div v-if="classCourses.length === 0" class="text-center py-12 text-gray-500">
          No materials yet. Click "Add Material" to get started.
        </div>

          <div v-else class="space-y-3">
          <div
              v-for="course in paginatedClassCourses"
            :key="course.courseid"
              v-memo="[course.courseid, course.title, getFileCount(course)]"
              class="border border-gray-200 rounded-xl bg-white px-4 py-3 shadow-sm hover:shadow-md transition-all"
          >
              <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div class="flex-1 min-w-0">
                  <div class="flex flex-wrap items-center gap-2 mb-2">
                    <h3 class="text-base font-semibold text-gray-900 truncate">{{ course.title }}</h3>
                    <span v-if="course.course_code" class="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600">
                      {{ course.course_code }}
                    </span>
                    <span v-if="getFileCount(course) > 0" class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600">
                      <span aria-hidden="true">📎</span>
                      {{ getFileCount(course) }} file{{ getFileCount(course) > 1 ? 's' : '' }}
                    </span>
                  </div>
                  <p v-if="course.description" class="text-sm text-gray-600">{{ course.description }}</p>
                  <div class="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span>Uploaded: {{ formatDate(course.upload_date) }}</span>
                    <a
                      v-if="course.video_link"
                      :href="course.video_link"
                      target="_blank"
                      class="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-1 font-semibold text-rose-600 hover:bg-rose-100"
                    >
                      <span aria-hidden="true">🎥</span>
                      Video
                    </a>
                  </div>
              </div>
              <div class="flex gap-2 md:ml-4">
                <button
                  @click="openEditForm(course)"
                  class="inline-flex items-center rounded-full border border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50 px-4 py-1.5 text-xs font-semibold text-yellow-700 transition-all hover:from-yellow-100 hover:to-amber-100 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                >
                  Edit
                </button>
                <button
                  @click="deleteMaterial(course.courseid)"
                  class="inline-flex items-center rounded-full border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 px-4 py-1.5 text-xs font-semibold text-red-700 transition-all hover:from-red-100 hover:to-rose-100 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

          <div
            v-if="shouldPaginate"
            class="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4 md:flex-row md:items-center md:justify-between"
          >
            <p class="text-xs text-gray-500">
              Showing
              {{ (currentPage - 1) * itemsPerPage + 1 }}
              -
              {{ Math.min(currentPage * itemsPerPage, classCourses.length) }}
              of
              {{ classCourses.length }}
            </p>
            <div class="flex items-center gap-2">
              <button
                @click="goToPage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-gray-300 text-sm text-gray-600 transition-all hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-400 hover:text-blue-700 hover:scale-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 shadow-sm hover:shadow-md"
              >
                <span aria-hidden="true">‹</span>
                <span class="sr-only">Previous page</span>
              </button>
              <button
                v-for="page in totalPages"
                :key="page"
                @click="goToPage(page)"
                :class="[
                  'inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-full border-2 text-sm font-semibold transition-all shadow-sm hover:shadow-md',
                  currentPage === page
                    ? 'border-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 scale-110'
                    : 'border-gray-300 text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-400 hover:text-blue-700 hover:scale-110 active:scale-95'
                ]"
              >
                {{ page }}
              </button>
              <button
                @click="goToPage(currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-gray-300 text-sm text-gray-600 transition-all hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-400 hover:text-blue-700 hover:scale-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 shadow-sm hover:shadow-md"
              >
                <span aria-hidden="true">›</span>
                <span class="sr-only">Next page</span>
              </button>
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
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          @click.self="resetForm"
        >
          <div class="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <!-- Modal Header with Gradient -->
            <div class="sticky top-0 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 px-8 py-6 flex justify-between items-center shadow-lg">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 class="text-2xl font-bold text-white">
                  {{ editingCourse ? 'Edit Material' : 'Add New Material' }}
                </h3>
              </div>
              <button
                @click="resetForm"
                class="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-2 transition-all hover:scale-110 active:scale-95"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Modal Body - Scrollable -->
            <div class="flex-1 overflow-y-auto px-8 py-6 space-y-6 bg-gradient-to-b from-gray-50/50 to-white">
              <!-- Title Input -->
              <BaseInput
                v-model="formData.title"
                label="Title"
                placeholder="Enter material title"
                required
                size="lg"
              />

              <!-- Course Code Input -->
              <BaseInput
                v-model="formData.course_code"
                label="Course Code"
                placeholder="e.g., ENG-101"
                size="lg"
              />

              <!-- Description Textarea -->
              <BaseTextarea
                v-model="formData.description"
                label="Description"
                placeholder="Describe the course material..."
                :rows="3"
              />

              <!-- Existing Files (Edit Mode) -->
              <div v-if="editingCourse && existingFiles.length > 0" class="space-y-3">
                <label class="block text-sm font-semibold text-gray-700">Existing Files</label>
                <div class="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 space-y-3">
                  <div
                    v-for="file in existingFiles"
                    :key="file.cfid"
                    class="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
                  >
                    <div class="flex items-center gap-3 flex-1 min-w-0">
                      <div class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                        <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
                        </svg>
                      </div>
                      <div class="flex-1 min-w-0">
                        <a 
                          :href="file.url || file.path" 
                          target="_blank"
                          class="text-sm font-semibold text-blue-600 hover:text-blue-800 truncate block transition-colors"
                        >
                          File {{ file.cfid }}
                        </a>
                        <p class="text-xs text-gray-500 mt-0.5">Uploaded: {{ formatDate(file.upload_date) }}</p>
                      </div>
                    </div>
                    <button
                      @click="deleteExistingFile(file.cfid)"
                      :disabled="isDeletingFile"
                      class="ml-3 flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-50 to-rose-50 text-red-600 hover:from-red-100 hover:to-rose-100 border-2 border-red-200 hover:border-red-300 rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              <!-- File Upload -->
              <BaseFileUpload
                v-model="uploadFiles"
                label="Upload New Files (Optional)"
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                :max-size="50"
                :multiple="true"
                hint="Optional: PDF, Word, or PowerPoint (max 50MB each). Multiple files allowed."
              />

              <!-- Video Link Input -->
              <div>
                <BaseInput
                  v-model="formData.video_link"
                  label="Video Link (Optional)"
                  placeholder="https://youtube.com/watch?v=..."
                  type="url"
                />
                <div class="flex items-start gap-2 mt-2">
                  <svg class="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                  </svg>
                  <p class="text-xs text-gray-500">YouTube, Vimeo, or other video platform link</p>
                </div>
              </div>
            </div>

            <!-- Modal Footer with Actions -->
            <div class="sticky bottom-0 bg-white border-t border-gray-200 px-8 py-5 flex justify-end gap-3 shadow-lg">
              <BaseButton 
                type="button" 
                variant="glass-secondary" 
                @click="resetForm"
                size="lg"
              >
                Cancel
              </BaseButton>
              <BaseButton 
                type="button" 
                variant="glass-primary" 
                @click="saveMaterial"
                :loading="isUploading"
                size="lg"
              >
                <span v-if="!isUploading">
                  <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {{ editingCourse ? 'Update Material' : 'Save Material' }}
                </span>
              </BaseButton>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Confirmation Dialog -->
    <ConfirmDialog
      :show="showConfirmDialog"
      :title="confirmConfig.title"
      :message="confirmConfig.message"
      :variant="confirmConfig.variant"
      confirm-text="Delete"
      cancel-text="Cancel"
      @confirm="handleConfirm"
      @cancel="handleCancel"
      @close="handleCancel"
    />
  </div>
</template>

<style scoped>
/** Modal transition animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-enter-from .bg-white {
  transform: scale(0.9) translateY(-20px);
}

.modal-leave-to .bg-white {
  transform: scale(0.95) translateY(10px);
}
</style>
