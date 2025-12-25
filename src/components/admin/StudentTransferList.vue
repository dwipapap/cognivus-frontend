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
const hasChanges = ref(false);

const enrolledStudents = computed(() => {
  return props.allStudents.filter(s => s.classid === props.currentClassId);
});

const availableStudents = computed(() => {
  let students = props.allStudents.filter(s => s.classid !== props.currentClassId);
  
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
  hasChanges.value = true;
  selectedAvailable.value.clear();
};

const moveToAvailable = () => {
  hasChanges.value = true;
  selectedEnrolled.value.clear();
};

const moveAllToEnrolled = () => {
  availableStudents.value.forEach(s => selectedAvailable.value.add(s.studentid));
  hasChanges.value = true;
  selectedAvailable.value.clear();
};

const moveAllToAvailable = () => {
  enrolledStudents.value.forEach(s => selectedEnrolled.value.add(s.studentid));
  hasChanges.value = true;
  selectedEnrolled.value.clear();
};

const handleSave = () => {
  const currentEnrolledIds = enrolledStudents.value.map(s => s.studentid);
  const studentsToAdd = Array.from(selectedAvailable.value);
  const studentsToRemove = Array.from(selectedEnrolled.value);
  
  const finalEnrolled = currentEnrolledIds
    .filter(id => !studentsToRemove.includes(id))
    .concat(studentsToAdd);
  
  emit('save', {
    enrolledStudentIds: finalEnrolled,
    toAdd: studentsToAdd,
    toRemove: studentsToRemove
  });
};

const clearSelections = () => {
  selectedAvailable.value.clear();
  selectedEnrolled.value.clear();
};
</script>

<template>
  <div class="space-y-6">
    <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div class="flex items-start gap-3">
        <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <div class="text-sm text-gray-700">
          <p class="font-medium">Transfer Students</p>
          <p class="mt-1">Use the controls below to assign students to <span class="font-semibold text-blue-600">{{ currentClassName }}</span>. Select students from the left panel and move them to the right panel to enroll them in this class.</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="space-y-4">
        <div>
          <BaseInput
            v-model="searchQuery"
            placeholder="Search students by name or email..."
            size="md"
          >
            <template #icon>
              <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </template>
          </BaseInput>
        </div>

        <div>
          <BaseSelect v-model="filterClassId" label="Filter by Class">
            <option value="">All Classes</option>
            <option value="unassigned">Unassigned Students</option>
            <option v-for="cls in allClasses.filter(c => c.classid !== currentClassId)" :key="cls.classid" :value="cls.classid">
              {{ cls.class_code }}
            </option>
          </BaseSelect>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-7 gap-4">
      <div class="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
              Available Students
            </h3>
            <span class="text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded-md border border-gray-200">
              {{ availableStudents.length }} students
            </span>
          </div>
        </div>

        <div class="h-96 overflow-y-auto">
          <div v-if="availableStudents.length === 0" class="flex flex-col items-center justify-center h-full text-gray-400 p-6">
            <svg class="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
            </svg>
            <p class="text-sm font-medium">No students available</p>
            <p class="text-xs mt-1">Try adjusting your search or filter</p>
          </div>

          <div v-for="student in availableStudents" :key="student.studentid" 
            class="border-b border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer"
            @click="toggleAvailableSelection(student.studentid)"
          >
            <div class="flex items-start gap-3 px-4 py-3">
              <input
                type="checkbox"
                :checked="selectedAvailable.has(student.studentid)"
                @click.stop="toggleAvailableSelection(student.studentid)"
                class="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">{{ student.fullname }}</p>
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 mt-1">
                  {{ getClassCode(student.classid) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="lg:col-span-1 flex flex-col items-center justify-center gap-2">
        <BaseButton
          @click="() => { moveToEnrolled(); }"
          variant="primary"
          size="sm"
          :disabled="selectedAvailable.size === 0"
          class="w-full lg:w-auto"
          rounded="full"
        >
          <template #icon>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </template>
          <span class="hidden lg:inline">Move</span>
          <span class="lg:hidden">Add Selected</span>
        </BaseButton>

        <BaseButton
          @click="moveToAvailable"
          variant="primary"
          size="sm"
          :disabled="selectedEnrolled.size === 0"
          class="w-full lg:w-auto"
          rounded="full"
        >
          <template #icon>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17l-5-5m0 0l5-5m-5 5h12"/>
            </svg>
          </template>
          <span class="hidden lg:inline">Remove</span>
          <span class="lg:hidden">Remove Selected</span>
        </BaseButton>

        <div class="hidden lg:block w-full border-t border-gray-300 my-2"></div>

        <BaseButton
          @click="moveAllToEnrolled"
          variant="primary"
          size="sm"
          :disabled="availableStudents.length === 0"
          class="w-full lg:w-auto"
          rounded="full"
        >
          <span class="text-xs">Add All</span>
        </BaseButton>

        <BaseButton
          @click="moveAllToAvailable"
          variant="primary"
          size="sm"
          :disabled="enrolledStudents.length === 0"
          class="w-full lg:w-auto"
          rounded="full"
        >
          <span class="text-xs">Remove All</span>
        </BaseButton>
      </div>

      <div class="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-blue-200">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Enrolled in {{ currentClassName }}
            </h3>
            <span class="text-xs font-medium text-blue-700 bg-white px-2 py-1 rounded-md border border-blue-200">
              {{ enrolledStudents.length }} students
            </span>
          </div>
        </div>

        <div class="h-96 overflow-y-auto">
          <div v-if="enrolledStudents.length === 0" class="flex flex-col items-center justify-center h-full text-gray-400 p-6">
            <svg class="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <p class="text-sm font-medium">No students enrolled</p>
            <p class="text-xs mt-1">Select students from the left to enroll</p>
          </div>

          <div v-for="student in enrolledStudents" :key="student.studentid" 
            class="border-b border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer"
            @click="toggleEnrolledSelection(student.studentid)"
          >
            <div class="flex items-start gap-3 px-4 py-3">
              <input
                type="checkbox"
                :checked="selectedEnrolled.has(student.studentid)"
                @click.stop="toggleEnrolledSelection(student.studentid)"
                class="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">{{ student.fullname }}</p>
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 mt-1">
                  Currently Enrolled
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedAvailable.size > 0 || selectedEnrolled.size > 0" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div class="flex items-start gap-3">
        <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <div class="text-sm text-blue-800">
          <p class="font-medium">Pending Changes</p>
          <p class="mt-1">
            <span v-if="selectedAvailable.size > 0">{{ selectedAvailable.size }} student(s) selected to add. </span>
            <span v-if="selectedEnrolled.size > 0">{{ selectedEnrolled.size }} student(s) selected to remove.</span>
          </p>
          <button @click="clearSelections" class="text-xs underline mt-2 hover:text-blue-900">Clear selections</button>
        </div>
      </div>
    </div>

    <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
      <BaseButton type="button" variant="secondary" @click="$emit('cancel')" rounded="full">
        Cancel
      </BaseButton>
      <BaseButton type="button" variant="primary" @click="handleSave" :loading="isLoading" rounded="full">
        <template #icon>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        </template>
        Save Student Assignments
      </BaseButton>
    </div>
  </div>
</template>
