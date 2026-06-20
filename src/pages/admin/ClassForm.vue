<script setup>
import { ref, watch } from 'vue';
import { useForm } from '../../composables/useForm';

import StudentTransferList from '../../components/admin/StudentTransferList.vue';

const props = defineProps({
  classItem: {
    type: Object,
    default: null
  },
  isEditMode: {
    type: Boolean,
    default: false
  },
  levels: {
    type: Array,
    default: () => []
  },
  lecturers: {
    type: Array,
    default: () => []
  },
  allStudents: {
    type: Array,
    default: () => []
  },
  allClasses: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['close', 'save', 'saveStudents']);

const activeTab = ref('details');

/** Days of the week for schedule selection */
const daysOfWeek = [
  { value: 'Monday', label: 'Monday' },
  { value: 'Tuesday', label: 'Tuesday' },
  { value: 'Wednesday', label: 'Wednesday' },
  { value: 'Thursday', label: 'Thursday' },
  { value: 'Friday', label: 'Friday' },
  { value: 'Saturday', label: 'Saturday' },
  { value: 'Sunday', label: 'Sunday' }
];

const { formData, errors, isSubmitting, submit, getFieldProps, reset } = useForm(
  {},
  {
    class_code: ['required'],
    levelid: ['required'],
    description: [],
    schedule_day: [],
    schedule_time: [],
    schedule_day_2: [],
    schedule_time_2: []
  }
);

/** Watch for changes to populate form */
watch(() => props.classItem, (newVal) => {
  if (newVal) {
    formData.class_code = newVal.class_code || '';
    formData.description = newVal.description || '';
    formData.levelid = newVal.levelid ? Number(newVal.levelid) : '';
    formData.lecturerid = newVal.lecturerid ? Number(newVal.lecturerid) : '';
    formData.schedule_day = newVal.schedule_day || '';
    formData.schedule_time = newVal.schedule_time || '';
    formData.schedule_day_2 = newVal.schedule_day_2 || '';
    formData.schedule_time_2 = newVal.schedule_time_2 || '';
  } else {
    reset();
  }
}, { immediate: true });

const handleSave = async () => {
  await submit(async (data) => {
    emit('save', data);
  });
};

const handleStudentSave = async (studentData) => {
  emit('saveStudents', studentData);
};
</script>

<template>
  <div class="space-y-6">
    <div v-if="isEditMode" class="border-b border-default">
      <nav class="-mb-px flex space-x-8" aria-label="Tabs">
        <button
          type="button"
          @click="activeTab = 'details'"
          :class="[
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors',
            activeTab === 'details'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted hover:text-default hover:border-default'
          ]"
        >
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-folder" class="w-4 h-4" />
            <span>Class Details</span>
          </div>
        </button>
        <button
          type="button"
          @click="activeTab = 'students'"
          :class="[
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors',
            activeTab === 'students'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted hover:text-default hover:border-default'
          ]"
        >
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-users" class="w-4 h-4" />
            <span>Manage Students</span>
          </div>
        </button>
      </nav>
    </div>

    <div v-show="activeTab === 'details'">
      <form @submit.prevent="handleSave" class="space-y-6">
        <!-- Two Column Grid Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <!-- Left Column: Class Information -->
          <div class="space-y-6">
            <!-- Class Details Section -->
            <div class="bg-default rounded-lg p-6 border border-default">
              <h3 class="text-sm font-semibold text-default mb-4 flex items-center gap-2">
                <UIcon name="i-lucide-folder" class="w-4 h-4 text-toned" />
                Class Information
              </h3>

              <div class="space-y-4">
                <UFormField label="Class Code" required>
                  <UInput v-bind="getFieldProps('class_code')" placeholder="e.g., ENG-A1" class="w-full" />
                </UFormField>

                <UFormField label="Academic Level" required>
                  <USelect v-bind="getFieldProps('levelid')" :items="levels.map(l => ({ label: l.name, value: l.levelid }))" placeholder="Select Level" class="w-full" />
                </UFormField>

                <UFormField label="Description" description="Class objectives, requirements, or other notes.">
                  <UTextarea v-bind="getFieldProps('description')" placeholder="Optional" :rows="4" class="w-full" />
                </UFormField>
              </div>
            </div>
          </div>

          <!-- Right Column: Assignment & Schedule -->
          <div class="space-y-6">
            <!-- Lecturer Assignment Section -->
            <div class="bg-default rounded-lg p-6 border border-default">
              <h3 class="text-sm font-semibold text-default mb-4 flex items-center gap-2">
                <UIcon name="i-lucide-users" class="w-4 h-4 text-toned" />
                Lecturer Assignment
              </h3>

              <UFormField label="Assigned Lecturer" description="Only approved lecturers are shown. Update later if needed.">
                <USelect v-bind="getFieldProps('lecturerid')" :items="lecturers.map(l => ({ label: l.fullname, value: l.lecturerid }))" placeholder="Assign Lecturer" clearable class="w-full" />
              </UFormField>
            </div>

            <!-- Class Schedule Section -->
            <div class="bg-default rounded-lg p-6 border border-default">
              <h3 class="text-sm font-semibold text-default mb-4 flex items-center gap-2">
                <UIcon name="i-lucide-calendar" class="w-4 h-4 text-toned" />
                Class Schedule
              </h3>

              <div class="space-y-4">
                <div class="space-y-3">
                  <p class="text-xs font-medium text-muted uppercase tracking-wider">Primary Session</p>
                  <div class="grid grid-cols-2 gap-4">
                    <UFormField label="Session Day">
                      <USelect v-bind="getFieldProps('schedule_day')" :items="daysOfWeek.map(d => ({ label: d.label, value: d.value }))" placeholder="Select Day" class="w-full" />
                    </UFormField>

                    <UFormField label="Start Time">
                      <UInput v-bind="getFieldProps('schedule_time')" type="time" class="w-full" />
                    </UFormField>
                  </div>
                </div>

                <div class="space-y-3 pt-4 border-t border-default">
                  <p class="text-xs font-medium text-muted uppercase tracking-wider">Secondary Session</p>
                  <div class="grid grid-cols-2 gap-4">
                    <UFormField label="Session Day">
                      <USelect v-bind="getFieldProps('schedule_day_2')" :items="daysOfWeek.map(d => ({ label: d.label, value: d.value }))" placeholder="Select Day" clearable class="w-full" />
                    </UFormField>

                    <UFormField label="Start Time">
                      <UInput v-bind="getFieldProps('schedule_time_2')" type="time" class="w-full" />
                    </UFormField>
                  </div>
                </div>

                <p class="text-xs text-muted">All times use the server's local time.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions Footer -->
        <div class="flex justify-end gap-3 pt-6 border-t border-default">
          <UButton type="button" color="neutral" variant="outline" @click="$emit('close')">
            Cancel
          </UButton>
          <UButton type="submit" color="primary" variant="solid" :loading="isSubmitting" icon="i-lucide-check">
            {{ isEditMode ? 'Update Class' : 'Create Class' }}
          </UButton>
        </div>
      </form>
    </div>

<div v-if="isEditMode" v-show="activeTab === 'students'">
  <StudentTransferList
    :current-class-id="classItem?.classid"
    :current-class-name="classItem?.class_code"
    :all-students="allStudents"
    :all-classes="allClasses"
    @save="handleStudentSave"
    @cancel="$emit('close')"
  />
</div>
</div>
</template>
