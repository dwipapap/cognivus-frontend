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
import IconArrowLeft from '~icons/basil/arrow-left-solid';
import IconArrowRight from '~icons/basil/arrow-right-solid';
import IconPlus from '~icons/solar/add-circle-bold';
import IconPen from '~icons/solar/pen-new-square-bold';
import IconTrash from '~icons/solar/trash-bin-trash-bold';
import IconFile from '~icons/solar/file-text-bold';
import IconVideo from '~icons/solar/videocamera-record-bold';
import IconLink from '~icons/solar/link-bold';
import IconCheck from '~icons/solar/check-circle-bold';
import IconInfo from '~icons/solar/info-circle-bold';
import IconCloudUpload from '~icons/solar/cloud-upload-bold';
import IconClose from '~icons/solar/close-circle-bold';
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
const itemsPerPage = 5;

/** Class selector pagination */
const classCurrentPage = ref(1);
const classItemsPerPage = 5;

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

watch(() => selectedClass.value?.classid, () => {
  currentPage.value = 1;
});

watch(classCourses, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value;
  }
});

watch(myClasses, () => {
  classCurrentPage.value = 1;
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
      <div class="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-blue-900/5 p-6 mb-8">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-2 h-6 bg-blue-600 rounded-full"></div>
          <h2 class="text-lg font-extrabold text-blue-900 tracking-tight uppercase">Select Class</h2>
        </div>
        
        <!-- Horizontal Card Selector with Pagination -->
        <div class="flex items-center gap-2 md:gap-4">
          <!-- Previous Button -->
          <button
            v-if="shouldShowClassNavigation"
            @click="goToClassPage(classCurrentPage - 1)"
            :disabled="classCurrentPage === 1"
            class="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 ring-1 ring-gray-200 bg-white text-gray-400 hover:ring-blue-500 hover:text-blue-600 hover:bg-blue-50 active:scale-90 disabled:opacity-20 disabled:cursor-not-allowed shadow-sm"
            aria-label="Previous classes"
          >
            <IconArrowLeft class="w-4 h-4 md:w-5 md:h-5" />
          </button>

          <!-- Cards Container -->
          <div class="flex-1 grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap gap-3 md:gap-4" :class="classJustifyMode">
            <button
              v-for="cls in paginatedClasses"
              :key="cls.classid"
              @click="selectedClass = cls"
              :class="[
                'group relative min-w-0 md:flex-shrink-0 md:min-w-[180px] md:max-w-[240px] p-3 md:p-5 rounded-2xl border transition-all duration-300 text-left',
                selectedClass?.classid === cls.classid
                  ? 'bg-blue-50/50 border-blue-600 ring-1 ring-blue-600 shadow-lg shadow-blue-500/15'
                  : 'bg-white border-gray-100 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1'
              ]"
            >
              <!-- Selected Indicator -->
              <div 
                v-if="selectedClass?.classid === cls.classid"
                class="absolute top-2 right-2 md:top-3 md:right-3 w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-blue-600 animate-pulse"
              ></div>

              <span class="inline-block px-1.5 py-0.5 rounded-md bg-blue-50 text-[8px] md:text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1 md:mb-2">
                {{ getLevelName(cls.levelid) }}
              </span>
              <h3 class="font-extrabold text-sm md:text-lg text-blue-900 truncate leading-tight mb-1">{{ cls.class_code }}</h3>
              <p class="text-[10px] md:text-xs text-gray-500 line-clamp-2 leading-relaxed h-7 md:h-8 italic">
                {{ cls.description || 'Professional academic path' }}
              </p>
            </button>
          </div>

          <!-- Next Button -->
          <button
            v-if="shouldShowClassNavigation"
            @click="goToClassPage(classCurrentPage + 1)"
            :disabled="classCurrentPage === classTotalPages"
            class="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 ring-1 ring-gray-200 bg-white text-gray-400 hover:ring-blue-500 hover:text-blue-600 hover:bg-blue-50 active:scale-90 disabled:opacity-20 disabled:cursor-not-allowed shadow-sm"
            aria-label="Next classes"
          >
            <IconArrowRight class="w-4 h-4 md:w-5 md:h-5" />
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
          <div class="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[92vh] overflow-hidden flex flex-col border border-gray-100">
            <!-- Modal Header -->
            <div class="sticky top-0 bg-white px-8 py-6 flex justify-between items-center z-10 border-b border-gray-100">
              <h3 class="text-xl font-bold text-gray-900">
                {{ editingCourse ? 'Edit Material' : 'Add Material' }}
              </h3>
              <button
                @click="resetForm"
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
              <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
                
                <!-- Left Column: Material Details (7 cols) -->
                <div class="lg:col-span-7 space-y-8">
                  <div>
                    <div class="flex items-center gap-2 mb-6">
                      <div class="w-1 h-5 bg-blue-600 rounded-full"></div>
                      <h4 class="text-sm font-bold text-gray-900 uppercase tracking-wider">Material Details</h4>
                    </div>
                    
                    <div class="space-y-6">
                      <!-- Title Input -->
                      <BaseInput
                        v-model="formData.title"
                        label="Material Title"
                        placeholder="Enter a descriptive title"
                        required
                      />

                      <!-- Course Code Input -->
                      <BaseInput
                        v-model="formData.course_code"
                        label="Course Code"
                        placeholder="e.g., CS-204"
                      />

                      <!-- Description Textarea -->
                      <BaseTextarea
                        v-model="formData.description"
                        label="Description"
                        placeholder="Provide context or instructions for students..."
                        :rows="5"
                      />
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
                          v-model="formData.video_link"
                          label="Video Resource"
                          placeholder="YouTube or Vimeo link"
                          type="url"
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
                @click="resetForm"
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
