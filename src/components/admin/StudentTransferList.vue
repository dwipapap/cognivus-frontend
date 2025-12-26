<script setup>
import { ref, computed } from 'vue';
import BaseInput from '../form/BaseInput.vue';
import BaseSelect from '../form/BaseSelect.vue';
import BaseButton from '../ui/BaseButton.vue';

const props = defineProps({
  currentClassId: {
    type: Number,
    required: true
  },
  currentClassName: {
    type: String,
    required: true
  },
  allStudents: {
    type: Array,
    default: () => []
  },
  allClasses: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['save', 'cancel']);

const searchQuery = ref('');
const filterClassId = ref('');
const selectedAvailable = ref(new Set());
const selectedEnrolled = ref(new Set());
const pendingToAdd = ref(new Set());
const pendingToRemove = ref(new Set());

// Pagination state
const availablePage = ref(1);
const enrolledPage = ref(1);
const itemsPerPage = 15;

const enrolledStudents = computed(() => {
  const currentlyEnrolled = props.allStudents.filter(s => s.classid === props.currentClassId);
  const enrolledIds = new Set(currentlyEnrolled.map(s => s.studentid));
  
  pendingToAdd.value.forEach(id => enrolledIds.add(id));
  pendingToRemove.value.forEach(id => enrolledIds.delete(id));
  
  return props.allStudents.filter(s => enrolledIds.has(s.studentid));
});

const paginatedEnrolled = computed(() => {
  const start = (enrolledPage.value - 1) * itemsPerPage;
  return enrolledStudents.value.slice(start, start + itemsPerPage);
});

const enrolledTotalPages = computed(() => Math.ceil(enrolledStudents.value.length / itemsPerPage));

const filteredAvailableStudents = computed(() => {
  const currentlyEnrolled = props.allStudents.filter(s => s.classid === props.currentClassId);
  const enrolledIds = new Set(currentlyEnrolled.map(s => s.studentid));
  
  pendingToAdd.value.forEach(id => enrolledIds.add(id));
  pendingToRemove.value.forEach(id => enrolledIds.delete(id));
  
  let students = props.allStudents.filter(s => !enrolledIds.has(s.studentid));
  
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    students = students.filter(s => 
      s.fullname?.toLowerCase().includes(query) ||
      s.tbuser?.email?.toLowerCase().includes(query) ||
      s.tbuser?.username?.toLowerCase().includes(query)
    );
  }
  
  if (filterClassId.value) {
    if (filterClassId.value === 'unassigned') {
      students = students.filter(s => !s.classid);
    } else {
      students = students.filter(s => s.classid === Number(filterClassId.value));
    }
  }
  
  return students;
});

const paginatedAvailable = computed(() => {
  const start = (availablePage.value - 1) * itemsPerPage;
  return filteredAvailableStudents.value.slice(start, start + itemsPerPage);
});

const availableTotalPages = computed(() => Math.ceil(filteredAvailableStudents.value.length / itemsPerPage));

const getClassCode = (classid) => {
  if (!classid) return 'Unassigned';
  const cls = props.allClasses.find(c => c.classid === classid);
  return cls?.class_code || 'Unknown';
};

const toggleAvailableSelection = (studentid) => {
  if (selectedAvailable.value.has(studentid)) {
    selectedAvailable.value.delete(studentid);
  } else {
    selectedAvailable.value.add(studentid);
  }
};

const toggleEnrolledSelection = (studentid) => {
  if (selectedEnrolled.value.has(studentid)) {
    selectedEnrolled.value.delete(studentid);
  } else {
    selectedEnrolled.value.add(studentid);
  }
};

const moveToEnrolled = () => {
  selectedAvailable.value.forEach(id => {
    pendingToAdd.value.add(id);
    pendingToRemove.value.delete(id);
  });
  selectedAvailable.value.clear();
};

const moveToAvailable = () => {
  selectedEnrolled.value.forEach(id => {
    pendingToRemove.value.add(id);
    pendingToAdd.value.delete(id);
  });
  selectedEnrolled.value.clear();
};

const moveAllToEnrolled = () => {
  filteredAvailableStudents.value.forEach(s => {
    pendingToAdd.value.add(s.studentid);
    pendingToRemove.value.delete(s.studentid);
  });
  selectedAvailable.value.clear();
};

const moveAllToAvailable = () => {
  enrolledStudents.value.forEach(s => {
    pendingToRemove.value.add(s.studentid);
    pendingToAdd.value.delete(s.studentid);
  });
  selectedEnrolled.value.clear();
};

const handleSave = () => {
  const studentsToAdd = Array.from(pendingToAdd.value);
  const studentsToRemove = Array.from(pendingToRemove.value);
  
  const currentEnrolledIds = props.allStudents
    .filter(s => s.classid === props.currentClassId)
    .map(s => s.studentid);
  
  const finalEnrolled = currentEnrolledIds
    .filter(id => !studentsToRemove.includes(id))
    .concat(studentsToAdd);
  
  emit('save', {
    enrolledStudentIds: finalEnrolled,
    toAdd: studentsToAdd,
    toRemove: studentsToRemove
  });
  
  pendingToAdd.value.clear();
  pendingToRemove.value.clear();
};

const clearSelections = () => {
  selectedAvailable.value.clear();
  selectedEnrolled.value.clear();
};

const hasChanges = computed(() => {
  return pendingToAdd.value.size > 0 || pendingToRemove.value.size > 0;
});
</script>

<template>
  <div class="space-y-8">
    <!-- Header Section -->
    <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div class="flex items-start gap-4">
        <div class="p-3 bg-blue-50 rounded-xl">
          <svg class="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
        </div>
        <div class="text-gray-900">
          <h3 class="text-lg font-bold">Transfer Students</h3>
          <p class="text-sm text-gray-500 mt-1 leading-relaxed">
            Manage student enrollment for <span class="font-bold text-blue-600 px-2 py-0.5 bg-blue-50 rounded">{{ currentClassName }}</span>. 
            Select students from the available list and move them to enroll.
          </p>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div class="space-y-4">
        <BaseInput
          v-model="searchQuery"
          placeholder="Search by name, email or username..."
          label="Search Students"
          size="md"
        >
          <template #icon>
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </template>
        </BaseInput>
      </div>

      <div class="space-y-4">
        <BaseSelect v-model="filterClassId" label="Filter by Current Class">
          <option value="">All Students</option>
          <option value="unassigned">Unassigned Students Only</option>
          <optgroup label="Filter by Class">
            <option v-for="cls in allClasses.filter(c => c.classid !== currentClassId)" :key="cls.classid" :value="cls.classid">
              {{ cls.class_code }}
            </option>
          </optgroup>
        </BaseSelect>
      </div>
    </div>

    <!-- Main Transfer Section -->
    <div class="grid grid-cols-1 lg:grid-cols-7 gap-6">
      <!-- Available Students Column -->
      <div class="lg:col-span-3 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="bg-gray-50/50 px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-gray-400"></div>
            <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wider">Available</h3>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-gray-500 bg-white px-2.5 py-1 rounded-full border border-gray-100 shadow-sm">
              {{ filteredAvailableStudents.length }}
            </span>
            <div v-if="availableTotalPages > 1" class="flex items-center bg-white rounded-full border border-gray-100 shadow-sm p-0.5">
              <button 
                @click="availablePage = Math.max(1, availablePage - 1)"
                :disabled="availablePage === 1"
                class="p-1 hover:bg-gray-50 rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
              </button>
              <span class="text-[10px] font-bold px-1">{{ availablePage }}/{{ availableTotalPages }}</span>
              <button 
                @click="availablePage = Math.min(availableTotalPages, availablePage + 1)"
                :disabled="availablePage === availableTotalPages"
                class="p-1 hover:bg-gray-50 rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        </div>

        <div class="h-[400px] overflow-y-auto p-2 space-y-1">
          <div v-if="filteredAvailableStudents.length === 0" class="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
            <div class="p-4 bg-gray-50 rounded-full mb-4">
              <svg class="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
              </svg>
            </div>
            <p class="text-sm font-bold text-gray-900">No students found</p>
            <p class="text-xs mt-1 leading-relaxed">Try adjusting your search or filters to find more students.</p>
          </div>

          <div v-for="student in paginatedAvailable" :key="student.studentid" 
            class="group rounded-xl p-3 flex items-center gap-4 cursor-pointer transition-all hover:bg-blue-50/50 border border-transparent hover:border-blue-100"
            @click="toggleAvailableSelection(student.studentid)"
            :class="{ 'bg-blue-50 border-blue-100 shadow-sm': selectedAvailable.has(student.studentid) }"
          >
            <div class="relative flex items-center justify-center">
              <input
                type="checkbox"
                :checked="selectedAvailable.has(student.studentid)"
                @click.stop="toggleAvailableSelection(student.studentid)"
                class="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded-lg focus:ring-blue-500 focus:ring-offset-0 transition-all"
              />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-gray-900 truncate">{{ student.fullname }}</p>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Class:</span>
                <span class="text-[10px] font-bold text-gray-600 px-1.5 py-0.5 bg-gray-100 rounded">
                  {{ getClassCode(student.classid) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Controls Column -->
      <div class="lg:col-span-1 flex flex-col items-center justify-center gap-3">
        <div class="w-full lg:w-auto flex lg:flex-col gap-3">
          <BaseButton
            @click="moveToEnrolled"
            variant="primary"
            size="sm"
            :disabled="selectedAvailable.size === 0"
            class="flex-1 lg:flex-none shadow-lg shadow-blue-100"
            rounded="full"
          >
            <template #icon>
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </template>
            <span class="hidden lg:inline">Add</span>
          </BaseButton>

          <BaseButton
            @click="moveToAvailable"
            variant="secondary"
            size="sm"
            :disabled="selectedEnrolled.size === 0"
            class="flex-1 lg:flex-none"
            rounded="full"
          >
            <template #icon>
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17l-5-5m0 0l5-5m-5 5h12"/>
              </svg>
            </template>
            <span class="hidden lg:inline">Remove</span>
          </BaseButton>
        </div>

        <div class="hidden lg:block w-full border-t border-gray-100 my-4"></div>

        <div class="w-full lg:w-auto flex lg:flex-col gap-3">
          <button
            @click="moveAllToEnrolled"
            :disabled="filteredAvailableStudents.length === 0"
            class="flex-1 lg:flex-none text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-700 disabled:text-gray-300 transition-colors"
          >
            Add All
          </button>
          <button
            @click="moveAllToAvailable"
            :disabled="enrolledStudents.length === 0"
            class="flex-1 lg:flex-none text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-500 disabled:text-gray-300 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      <!-- Enrolled Students Column -->
      <div class="lg:col-span-3 flex flex-col bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
        <div class="bg-blue-50/50 px-5 py-4 border-b border-blue-100 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
            <h3 class="text-sm font-bold text-blue-900 uppercase tracking-wider">Enrolled</h3>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-blue-700 bg-white px-2.5 py-1 rounded-full border border-blue-100 shadow-sm">
              {{ enrolledStudents.length }}
            </span>
            <div v-if="enrolledTotalPages > 1" class="flex items-center bg-white rounded-full border border-blue-100 shadow-sm p-0.5">
              <button 
                @click="enrolledPage = Math.max(1, enrolledPage - 1)"
                :disabled="enrolledPage === 1"
                class="p-1 hover:bg-gray-50 rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg class="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
              </button>
              <span class="text-[10px] font-bold px-1 text-blue-900">{{ enrolledPage }}/{{ enrolledTotalPages }}</span>
              <button 
                @click="enrolledPage = Math.min(enrolledTotalPages, enrolledPage + 1)"
                :disabled="enrolledPage === enrolledTotalPages"
                class="p-1 hover:bg-gray-50 rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg class="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        </div>

        <div class="h-[400px] overflow-y-auto p-2 space-y-1">
          <div v-if="enrolledStudents.length === 0" class="flex flex-col items-center justify-center h-full text-blue-200 p-8 text-center">
            <div class="p-4 bg-blue-50/50 rounded-full mb-4">
              <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
            <p class="text-sm font-bold text-blue-900/40">No students enrolled</p>
            <p class="text-xs mt-1 leading-relaxed">Move students from the available list to enroll them in this class.</p>
          </div>

          <div v-for="student in paginatedEnrolled" :key="student.studentid" 
            class="group rounded-xl p-3 flex items-center gap-4 cursor-pointer transition-all hover:bg-blue-50 border border-transparent hover:border-blue-100"
            @click="toggleEnrolledSelection(student.studentid)"
            :class="{ 'bg-blue-50 border-blue-200 shadow-sm': selectedEnrolled.has(student.studentid) }"
          >
            <div class="relative flex items-center justify-center">
              <input
                type="checkbox"
                :checked="selectedEnrolled.has(student.studentid)"
                @click.stop="toggleEnrolledSelection(student.studentid)"
                class="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded-lg focus:ring-blue-500 focus:ring-offset-0 transition-all"
              />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-gray-900 truncate">{{ student.fullname }}</p>
              <div class="flex items-center gap-2 mt-1">
                <span 
                  v-if="pendingToAdd.has(student.studentid)"
                  class="text-[10px] font-bold uppercase tracking-wider text-green-600 px-1.5 py-0.5 bg-green-50 rounded border border-green-100"
                >
                  Pending Addition
                </span>
                <span 
                  v-else
                  class="text-[10px] font-bold uppercase tracking-wider text-blue-500 px-1.5 py-0.5 bg-blue-50/50 rounded"
                >
                  Enrolled
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary & Footer Actions -->
    <div class="flex flex-col lg:flex-row items-center justify-between gap-6 pt-8 border-t border-gray-100">
      <div v-if="hasChanges || selectedAvailable.size > 0 || selectedEnrolled.size > 0" class="flex items-center gap-4">
        <div class="flex -space-x-2">
          <div v-if="pendingToAdd.size > 0" class="w-8 h-8 rounded-full bg-green-500 border-2 border-white flex items-center justify-center shadow-sm">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
          </div>
          <div v-if="pendingToRemove.size > 0" class="w-8 h-8 rounded-full bg-red-500 border-2 border-white flex items-center justify-center shadow-sm">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
            </svg>
          </div>
        </div>
        <div class="text-sm">
          <p class="font-bold text-gray-900">
            <span v-if="pendingToAdd.size > 0">{{ pendingToAdd.size }} to add</span>
            <span v-if="pendingToAdd.size > 0 && pendingToRemove.size > 0" class="mx-2 text-gray-300">|</span>
            <span v-if="pendingToRemove.size > 0" class="text-red-600">{{ pendingToRemove.size }} to remove</span>
          </p>
          <button @click="clearSelections" class="text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest mt-1">
            Clear Selection
          </button>
        </div>
      </div>
      <div v-else class="hidden lg:block"></div>

      <div class="flex items-center gap-4 w-full lg:w-auto">
        <BaseButton 
          type="button" 
          variant="secondary" 
          @click="$emit('cancel')" 
          class="flex-1 lg:flex-none px-8"
          rounded="full"
        >
          Cancel
        </BaseButton>
        <BaseButton 
          type="button" 
          variant="primary" 
          @click="handleSave" 
          :loading="isLoading" 
          :disabled="!hasChanges"
          class="flex-1 lg:flex-none px-8 shadow-lg shadow-blue-200"
          rounded="full"
        >
          <template #icon>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </template>
          Confirm Changes
        </BaseButton>
      </div>
    </div>
  </div>
</template>
