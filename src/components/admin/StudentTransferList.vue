<script setup>
import { ref, computed } from 'vue';


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

const changesSummary = computed(() => {
  const parts = [];
  if (pendingToAdd.value.size > 0) parts.push(`${pendingToAdd.value.size} to add`);
  if (pendingToRemove.value.size > 0) parts.push(`${pendingToRemove.value.size} to remove`);
  return parts.join(' · ');
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h3 class="text-lg font-semibold text-default">Transfer Students</h3>
      <p class="text-sm text-muted mt-1">
        Manage enrollment for <span class="font-medium text-default">{{ currentClassName }}</span>. Select students and move them to enroll.
      </p>
    </div>

    <!-- Filters -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFormField label="Search">
        <UInput v-model="searchQuery" placeholder="Search by name, email or username" />
      </UFormField>
      <UFormField label="Filter by class">
        <USelect v-model="filterClassId" :items="[
          { label: 'Unassigned only', value: 'unassigned' },
          ...allClasses.filter(c => c.classid !== currentClassId).map(cls => ({ label: cls.class_code, value: cls.classid }))
        ]" placeholder="All students" clearable />
      </UFormField>
    </div>

    <!-- Transfer panes -->
    <div class="grid grid-cols-1 lg:grid-cols-7 gap-4">
      <!-- Available -->
      <div class="lg:col-span-3 flex flex-col border border-default rounded-lg overflow-hidden">
        <div class="px-4 py-3 border-b border-default flex items-center justify-between">
          <h4 class="text-sm font-semibold text-default">Available</h4>
          <span class="text-xs text-muted">{{ filteredAvailableStudents.length }}</span>
        </div>

        <div class="h-[400px] overflow-y-auto p-2 space-y-1">
          <div v-if="filteredAvailableStudents.length === 0" class="flex items-center justify-center h-full text-sm text-muted">
            No matching students.
          </div>

          <div v-for="student in paginatedAvailable" :key="student.studentid"
            class="rounded-md p-2.5 flex items-center gap-3 cursor-pointer hover:bg-elevated border border-transparent"
            :class="{ 'bg-elevated border-default': selectedAvailable.has(student.studentid) }"
            @click="toggleAvailableSelection(student.studentid)"
          >
            <UCheckbox
              :model-value="selectedAvailable.has(student.studentid)"
              @click.stop="toggleAvailableSelection(student.studentid)"
            />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-default truncate">{{ student.fullname }}</p>
              <p class="text-xs text-muted">{{ getClassCode(student.classid) }}</p>
            </div>
          </div>
        </div>

        <div v-if="availableTotalPages > 1" class="px-3 py-2 border-t border-default">
          <UPagination v-model:page="availablePage" :total="filteredAvailableStudents.length" :max="itemsPerPage" :sibling-count="0" size="xs" />
        </div>
      </div>

      <!-- Controls -->
      <div class="lg:col-span-1 flex lg:flex-col items-center justify-center gap-2">
        <UButton
          @click="moveToEnrolled"
          color="primary"
          variant="solid"
          size="sm"
          :disabled="selectedAvailable.size === 0"
          icon="i-lucide-chevron-right"
          aria-label="Add selected students"
        >
          <span class="hidden lg:inline ml-1">Add</span>
        </UButton>
        <UButton
          @click="moveToAvailable"
          color="neutral"
          variant="outline"
          size="sm"
          :disabled="selectedEnrolled.size === 0"
          icon="i-lucide-chevron-left"
          aria-label="Remove selected students"
        >
          <span class="hidden lg:inline ml-1">Remove</span>
        </UButton>
        <div class="hidden lg:block w-full border-t border-default my-2"></div>
        <button
          @click="moveAllToEnrolled"
          :disabled="filteredAvailableStudents.length === 0"
          class="text-xs font-medium text-primary hover:underline disabled:text-muted disabled:no-underline"
        >
          Add all
        </button>
        <button
          @click="moveAllToAvailable"
          :disabled="enrolledStudents.length === 0"
          class="text-xs font-medium text-muted hover:text-default disabled:opacity-50"
        >
          Clear all
        </button>
      </div>

      <!-- Enrolled -->
      <div class="lg:col-span-3 flex flex-col border border-default rounded-lg overflow-hidden">
        <div class="px-4 py-3 border-b border-default flex items-center justify-between">
          <h4 class="text-sm font-semibold text-default">Enrolled</h4>
          <span class="text-xs text-muted">{{ enrolledStudents.length }}</span>
        </div>

        <div class="h-[400px] overflow-y-auto p-2 space-y-1">
          <div v-if="enrolledStudents.length === 0" class="flex items-center justify-center h-full text-sm text-muted">
            No students enrolled.
          </div>

          <div v-for="student in paginatedEnrolled" :key="student.studentid"
            class="rounded-md p-2.5 flex items-center gap-3 cursor-pointer hover:bg-elevated border border-transparent"
            :class="{ 'bg-elevated border-default': selectedEnrolled.has(student.studentid) }"
            @click="toggleEnrolledSelection(student.studentid)"
          >
            <UCheckbox
              :model-value="selectedEnrolled.has(student.studentid)"
              @click.stop="toggleEnrolledSelection(student.studentid)"
            />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-default truncate">{{ student.fullname }}</p>
              <p class="text-xs text-muted">
                {{ pendingToAdd.has(student.studentid) ? 'Pending add' : 'Enrolled' }}
              </p>
            </div>
          </div>
        </div>

        <div v-if="enrolledTotalPages > 1" class="px-3 py-2 border-t border-default">
          <UPagination v-model:page="enrolledPage" :total="enrolledStudents.length" :max="itemsPerPage" :sibling-count="0" size="xs" />
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center justify-between gap-4 pt-6 border-t border-default">
      <div class="text-sm">
        <span v-if="changesSummary" class="text-default">{{ changesSummary }}</span>
        <span v-else class="text-muted">No pending changes</span>
        <button
          v-if="selectedAvailable.size > 0 || selectedEnrolled.size > 0"
          @click="clearSelections"
          class="ml-3 text-xs font-medium text-primary hover:underline"
        >
          Clear selection
        </button>
      </div>
      <div class="flex items-center gap-3">
        <UButton type="button" color="neutral" variant="outline" @click="$emit('cancel')">
          Cancel
        </UButton>
        <UButton
          type="button"
          color="primary"
          variant="solid"
          @click="handleSave"
          :loading="isLoading"
          :disabled="!hasChanges"
          icon="i-lucide-check"
        >
          Confirm Changes
        </UButton>
      </div>
    </div>
  </div>
</template>
