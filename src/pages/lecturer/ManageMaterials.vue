<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useLecturerProfile } from '../../composables/useLecturerProfile';
import { classAPI, courseAPI, courseFileAPI, levelAPI } from '../../services/api';
import BaseFileUpload from '../../components/form/BaseFileUpload.vue';
import BaseInput from '../../components/form/BaseInput.vue';
import BaseTextarea from '../../components/form/BaseTextarea.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import LoadingSpinner from '../../components/ui/LoadingSpinner.vue';
import ConfirmDialog from '../../components/ui/ConfirmDialog.vue';
import ClassSidebar from '../../components/lecturer/ClassSidebar.vue';
import IconTrash from '~icons/solar/trash-bin-trash-bold';
import IconFile from '~icons/solar/file-text-bold';
import IconVideo from '~icons/solar/videocamera-record-bold';
import { formatDate } from '../../utils/formatters';

const { lecturerProfile, isLoading: profileLoading } = useLecturerProfile();

const myClasses = ref([]);
const allCourses = ref([]);
const levels = ref([]);
const selectedClass = ref(null);
const isLoading = ref(true);
const errorMessage = ref('');
const successMessage = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;

/** Modal and form state */
const showModal = ref(false);
const editingCourse = ref(null);
const existingFiles = ref([]);
const formState = reactive({
  title: '',
  course_code: '',
  description: '',
  video_link: ''
})
const fieldErrors = reactive({
  title: '',
  course_code: '',
  description: '',
  video_link: ''
})
const uploadFiles = ref([]);
const isUploading = ref(false);
const isDeletingFile = ref(false);
const titleInputRef = ref(null)

/** Dirty state tracking for unsaved-changes warning */
const initialFormSnapshot = ref(null)
const isDirty = computed(() => {
  if (!initialFormSnapshot.value) return false
  const s = initialFormSnapshot.value
  return (
    formState.title !== s.title ||
    formState.course_code !== s.course_code ||
    formState.description !== s.description ||
    formState.video_link !== s.video_link ||
    uploadFiles.value.length > 0
  )
})

const takeFormSnapshot = () => ({
  title: formState.title,
  course_code: formState.course_code,
  description: formState.description,
  video_link: formState.video_link
})

/** Confirmation dialog state */
const showConfirmDialog = ref(false);
const confirmAction = ref(null);
const confirmConfig = ref({
  title: '',
  message: '',
  variant: 'danger',
  confirmText: 'Delete',
  cancelText: 'Cancel'
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

const clearFieldErrors = () => {
  fieldErrors.title = ''
  fieldErrors.course_code = ''
  fieldErrors.description = ''
  fieldErrors.video_link = ''
}

const resetForm = () => {
  formState.title = ''
  formState.course_code = ''
  formState.description = ''
  formState.video_link = ''
  uploadFiles.value = [];
  existingFiles.value = [];
  editingCourse.value = null;
  showModal.value = false;
};

const openAddForm = () => {
  clearFieldErrors()
  formState.title = ''
  formState.course_code = ''
  formState.description = ''
  formState.video_link = ''
  uploadFiles.value = [];
  existingFiles.value = [];
  editingCourse.value = null;
  initialFormSnapshot.value = takeFormSnapshot()
  showModal.value = true;
  nextTick(() => titleInputRef.value?.focus?.())
};

const openEditForm = (course) => {
  clearFieldErrors()
  editingCourse.value = course;
  formState.title = course.title
  formState.course_code = course.course_code || ''
  formState.description = course.description || ''
  formState.video_link = course.video_link || ''
  existingFiles.value = course.tbcourse_files || [];
  initialFormSnapshot.value = takeFormSnapshot()
  showModal.value = true;
};

const showConfirmation = (config, action) => {
  confirmConfig.value = config;
  confirmAction.value = action;
  showConfirmDialog.value = true;
};

const handleConfirm = async () => {
  if (confirmAction.value) {
    await confirmAction.value();
  }
  showConfirmDialog.value = false;
};

const handleCancel = () => {
  showConfirmDialog.value = false;
  confirmAction.value = null;
};

/** Dirty close confirmation */
const attemptClose = () => {
  if (isDirty.value) {
    showConfirmation(
      {
        title: 'Unsaved Changes',
        message: 'You have unsaved changes. Are you sure you want to close? Your changes will be lost.',
        variant: 'warning',
        confirmText: 'Discard Changes',
        cancelText: 'Keep Editing'
      },
      () => {
        resetForm()
      }
    )
  } else {
    resetForm()
  }
}

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

const validateForm = () => {
  clearFieldErrors()
  let valid = true

  if (!formState.title.trim()) {
    fieldErrors.title = 'Title is required'
    valid = false
  } else if (formState.title.length > 200) {
    fieldErrors.title = 'Title must be under 200 characters'
    valid = false
  }

  if (formState.course_code && formState.course_code.length > 50) {
    fieldErrors.course_code = 'Course code must be under 50 characters'
    valid = false
  }

  if (formState.description && formState.description.length > 2000) {
    fieldErrors.description = 'Description must be under 2000 characters'
    valid = false
  }

  if (formState.video_link) {
    try {
      new URL(formState.video_link)
    } catch {
      fieldErrors.video_link = 'Enter a valid URL (e.g., https://youtube.com/...)'
      valid = false
    }
  }

  if (!selectedClass.value) {
    valid = false
  }

  return valid
}

const scrollToFirstError = () => {
  nextTick(() => {
    const firstError = document.querySelector('[class*="fieldErrors"]') || document.querySelector('.text-brand-danger, .text-red-600')
    firstError?.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
  })
}

const saveMaterial = async () => {
  if (!validateForm()) {
    if (!selectedClass.value) {
      errorMessage.value = 'Please select a class first'
    }
    scrollToFirstError()
    return
  }

  try {
    isUploading.value = true;
    errorMessage.value = ''
    const payload = {
      title: formState.title,
      course_code: formState.course_code,
      description: formState.description,
      video_link: formState.video_link,
      classid: selectedClass.value.classid
    };

    const filesToUpload = uploadFiles.value.length > 0 ? uploadFiles.value : [];
    
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
    const msg = error?.response?.data?.message || error?.message || 'Failed to save material'
    errorMessage.value = msg;
    console.error('Error saving material:', error);
    setTimeout(() => { errorMessage.value = '' }, 5000)
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



/** Auto-fetch classes when profile loads (handles both immediate and async cases) */
watch(
  () => ({ loading: profileLoading.value, profile: lecturerProfile.value }),
  ({ loading, profile }) => {
    if (!loading && profile) {
      fetchMyClasses();
    }
  },
  { immediate: true }
);

/** Keyboard shortcut: Cmd+Enter / Ctrl+Enter to submit */
const handleKeydown = (e) => {
  if (showModal.value && (e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    e.preventDefault()
    saveMaterial()
  }
}

onMounted(() => document.addEventListener('keydown', handleKeydown))
onUnmounted(() => document.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <h1 class="text-4xl font-bold text-gray-900 mb-8">Manage Materials</h1>

    <!-- Messages -->
    <div v-if="successMessage" class="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
      <p class="text-green-800">{{ successMessage }}</p>
    </div>
    <div v-if="errorMessage" class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-center justify-between">
        <p class="text-red-800">{{ errorMessage }}</p>
        <button 
          @click="errorMessage = ''"
          class="px-4 py-2 text-sm font-semibold text-red-700 hover:text-red-800 bg-white border-2 border-red-200 hover:border-red-400 rounded-full transition-all"
        >
          Dismiss
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
          @select="selectedClass = $event"
        />
      </div>

      <!-- Materials Section -->
      <div v-if="selectedClass" class="flex-1 min-w-0 flex flex-col gap-6">
        <div class="flex justify-between items-end">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 tracking-tight">Materials</h2>
            <p class="text-sm text-gray-500 mt-1">Class Code: {{ selectedClass.class_code }}</p>
          </div>
          <button
            @click="openAddForm"
            class="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-full hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all shadow-md font-semibold"
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

        <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <ul class="divide-y divide-gray-100">
            <li v-for="course in paginatedClassCourses" :key="course.courseid" class="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-3 mb-1">
                    <h3 class="text-base font-semibold text-gray-900 truncate">{{ course.title }}</h3>
                    <span v-if="course.course_code" class="text-xs font-medium text-gray-500">
                      {{ course.course_code }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-500 line-clamp-1 mb-2">{{ course.description }}</p>
                  
                  <div class="flex items-center gap-4 text-xs text-gray-400">
                    <div v-if="getFileCount(course) > 0" class="flex items-center gap-1">
                      <IconFile class="w-3.5 h-3.5 text-gray-400" />
                      {{ getFileCount(course) }} file{{ getFileCount(course) > 1 ? 's' : '' }}
                    </div>
                    <span>Uploaded: {{ formatDate(course.upload_date) }}</span>
                    <a
                      v-if="course.video_link"
                      :href="course.video_link"
                      target="_blank"
                      class="flex items-center gap-1 text-rose-600 hover:text-rose-700 font-semibold"
                    >
                      <IconVideo class="w-3.5 h-3.5" />
                      Video
                    </a>
                  </div>
                </div>
                <div class="flex gap-2">
                  <button
                    @click="openEditForm(course)"
                    class="px-4 py-1.5 text-xs font-semibold text-yellow-700 bg-yellow-50 hover:bg-yellow-100 rounded-full transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    @click="deleteMaterial(course.courseid)"
                    class="px-4 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-full transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </div>

        <!-- Pagination -->
        <div v-if="shouldPaginate" class="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4 md:flex-row md:items-center md:justify-between">
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
                class="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-gray-300 text-sm text-blue-700 transition-all hover:bg-blue-100 hover:border-blue-400 hover:text-blue-800 hover:scale-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 shadow-sm hover:shadow-md"
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
                    ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700 scale-110'
                    : 'border-gray-300 text-blue-700 hover:bg-blue-100 hover:border-blue-400 hover:text-blue-800 hover:scale-110 active:scale-95'
                ]"
              >
                {{ page }}
              </button>
              <button
                @click="goToPage(currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-gray-300 text-sm text-blue-700 transition-all hover:bg-blue-100 hover:border-blue-400 hover:text-blue-800 hover:scale-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 shadow-sm hover:shadow-md"
              >
                <span aria-hidden="true">›</span>
                <span class="sr-only">Next page</span>
              </button>
            </div>
          </div>
      </div>
    </div>

    <!-- No Classes -->
    <div v-else class="bg-white rounded-lg shadow-lg p-12 text-center">
      <p class="text-gray-500 text-lg">You are not assigned to any classes yet.</p>
    </div>

    <!-- Material Form Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          @click.self="attemptClose"
        >
          <div class="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col border border-gray-100">
            <!-- Modal Header -->
            <div class="sticky top-0 bg-white px-8 py-6 flex justify-between items-center z-10 border-b border-gray-100">
              <h3 class="text-xl font-bold text-gray-900">
                {{ editingCourse ? 'Edit Material' : 'Add Material' }}
              </h3>
              <button
                @click="attemptClose"
                class="text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg p-2 transition-all"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Modal Body - Scrollable -->
            <div class="flex-1 overflow-y-auto px-8 py-6 bg-white">
              <!-- Two Column Grid Layout -->
              <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                <!-- Left Column: Material Details (7 cols) -->
                <div class="lg:col-span-7 space-y-8">
                  <div>
                    <div class="flex items-center gap-2 mb-6">
                      <div class="w-1 h-5 bg-blue-600 rounded-full"></div>
                      <h4 class="text-sm font-bold text-gray-900 uppercase tracking-wider">Material Details</h4>
                    </div>
                    
                    <div class="space-y-6">
                      <!-- Title Input -->
                      <div>
                        <BaseInput
                          ref="titleInputRef"
                          v-model="formState.title"
                          label="Material Title"
                          placeholder="Enter a descriptive title"
                          required
                          :error="fieldErrors.title"
                        />
                        <span class="text-[10px] text-gray-400 mt-0.5 block text-right">{{ formState.title.length }}/200</span>
                      </div>

                      <div>
                        <BaseInput
                          v-model="formState.course_code"
                          label="Course Code"
                          placeholder="e.g., CS-204"
                          :error="fieldErrors.course_code"
                        />
                        <span class="text-[10px] text-gray-400 mt-0.5 block text-right">{{ formState.course_code.length }}/50</span>
                      </div>

                      <div>
                        <BaseTextarea
                          v-model="formState.description"
                          label="Description"
                          placeholder="Provide context or instructions for students..."
                          :rows="5"
                          :error="fieldErrors.description"
                        />
                        <span class="text-[10px] text-gray-400 mt-0.5 block text-right">{{ formState.description.length }}/2000</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Right Column: Files & Media (5 cols) -->
                <div class="lg:col-span-5 space-y-8">
                  <div>
                    <div class="flex items-center gap-2 mb-6">
                      <div class="w-1 h-5 bg-blue-600 rounded-full"></div>
                      <h4 class="text-sm font-bold text-gray-900 uppercase tracking-wider">Files & Resources</h4>
                    </div>

                    <div class="space-y-6">
                      <!-- Existing Files (Edit Mode) -->
                      <div v-if="editingCourse && existingFiles.length > 0" class="space-y-3">
                        <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider">Attached Files</label>
                        <div class="space-y-2 max-h-48 overflow-y-auto pr-2">
                          <div
                            v-for="file in existingFiles"
                            :key="file.cfid"
                            class="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg p-3 hover:bg-gray-100 transition-colors"
                          >
                            <div class="flex items-center gap-3 flex-1 min-w-0">
                              <IconFile class="w-5 h-5 text-blue-600 flex-shrink-0" />
                              <div class="flex-1 min-w-0">
                                <a 
                                  :href="file.url || file.path" 
                                  target="_blank"
                                  class="text-sm font-semibold text-gray-900 hover:text-blue-600 truncate block transition-colors"
                                >
                                  {{ file.filename || 'Resource ' + file.cfid }}
                                </a>
                              </div>
                            </div>
                            <button
                              @click="deleteExistingFile(file.cfid)"
                              :disabled="isDeletingFile"
                              class="ml-3 p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete File"
                            >
                              <IconTrash class="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <!-- File Upload -->
                      <BaseFileUpload
                        v-model="uploadFiles"
                        label="Upload Materials"
                        accept=".pdf,.doc,.docx,.ppt,.pptx"
                        :max-size="50"
                        :multiple="true"
                        hint="PDF, Word, PowerPoint (Max 50MB)"
                      />

                      <!-- Video Link Input -->
                      <div class="pt-4 border-t border-gray-50">
                        <BaseInput
                          v-model="formState.video_link"
                          label="Video Resource"
                          placeholder="YouTube or Vimeo link"
                          type="url"
                          :error="fieldErrors.video_link"
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <!-- Modal Footer -->
            <div class="sticky bottom-0 bg-white border-t border-gray-100 px-8 py-6 flex justify-end items-center gap-4 z-10">
              <button 
                type="button" 
                @click="attemptClose"
                class="px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <BaseButton 
                type="button" 
                variant="primary" 
                @click="saveMaterial"
                :loading="isUploading"
                class="min-w-[140px]"
              >
                {{ editingCourse ? 'Save Changes' : 'Add Material' }}
              </BaseButton>
              <span class="text-xs text-gray-400 hidden sm:inline">
                <kbd class="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-mono">⌘⏎</kbd>
              </span>
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
      :confirm-text="confirmConfig.confirmText"
      :cancel-text="confirmConfig.cancelText"
      @confirm="handleConfirm"
      @cancel="handleCancel"
      @close="handleCancel"
    />
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
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-enter-from .bg-white {
  transform: scale(0.9) translateY(-20px);
}

.modal-leave-to .bg-white {
  transform: scale(0.95) translateY(10px);
}

@media (prefers-reduced-motion: reduce) {
  .modal-enter-active,
  .modal-leave-active {
    transition: none;
  }
  .modal-enter-active .bg-white,
  .modal-leave-active .bg-white {
    transition: none;
  }
  .modal-enter-from .bg-white,
  .modal-leave-to .bg-white {
    transform: none;
  }
}
</style>
