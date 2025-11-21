<script setup>
import { ref, watch } from 'vue';
import { useForm } from '../../composables/useForm';
import BaseInput from '../../components/form/BaseInput.vue';
import BaseSelect from '../../components/form/BaseSelect.vue';
import BaseTextarea from '../../components/form/BaseTextarea.vue';
import BaseButton from '../../components/ui/BaseButton.vue';

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
  }
});

const emit = defineEmits(['close', 'save']);

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

/** Handle form submission */
const handleSave = async () => {
  await submit(async (data) => {
    emit('save', data);
  });
};
</script>

<template>
  <form @submit.prevent="handleSave" class="space-y-6">
    <!-- Two Column Grid Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      <!-- Left Column: Class Information -->
      <div class="space-y-6">
        <!-- Class Details Section -->
        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 class="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            Class Details
          </h3>
          
          <div class="space-y-4">
            <!-- Class Code -->
            <BaseInput 
              v-bind="getFieldProps('class_code')" 
              label="Class Code" 
              placeholder="e.g., ENG-A1"
              required 
            />

            <!-- Level -->
            <BaseSelect 
              v-bind="getFieldProps('levelid')" 
              label="Level" 
              required
            >
              <option value="">Select Level</option>
              <option v-for="level in levels" :key="level.levelid" :value="level.levelid">
                {{ level.name }}
              </option>
            </BaseSelect>
          </div>
        </div>

        <!-- Description Section -->
        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 class="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"/>
            </svg>
            Description
          </h3>
          
          <BaseTextarea 
            v-bind="getFieldProps('description')" 
            label="Class Description"
            placeholder="Enter class description or notes..."
            :rows="6"
          />
        </div>
      </div>

      <!-- Right Column: Assignment -->
      <div class="space-y-6">
        <!-- Lecturer Assignment Section -->
        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 class="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
            Lecturer Assignment
          </h3>
          
          <div class="space-y-4">
            <BaseSelect 
              v-bind="getFieldProps('lecturerid')" 
              label="Assigned Lecturer"
            >
              <option value="">No Lecturer Assigned</option>
              <option v-for="lecturer in lecturers" :key="lecturer.lecturerid" :value="lecturer.lecturerid">
                {{ lecturer.fullname }}
              </option>
            </BaseSelect>
            
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div class="flex items-start gap-2">
                <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div class="text-sm text-blue-800">
                  <p class="font-medium">Assignment Info</p>
                  <p class="text-xs mt-1">You can assign a lecturer to this class now or leave it unassigned and assign one later.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Class Schedule Section -->
        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 class="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            Class Schedule
          </h3>
          
          <div class="space-y-4">
            <!-- Primary Schedule -->
            <div class="space-y-3">
              <p class="text-xs font-medium text-gray-700">Primary Schedule</p>
              <div class="grid grid-cols-2 gap-3">
                <BaseSelect 
                  v-bind="getFieldProps('schedule_day')" 
                  label="Day"
                >
                  <option value="">Select Day</option>
                  <option v-for="day in daysOfWeek" :key="day.value" :value="day.value">
                    {{ day.label }}
                  </option>
                </BaseSelect>
                
                <BaseInput 
                  v-bind="getFieldProps('schedule_time')" 
                  label="Start Time"
                  type="time"
                />
              </div>
            </div>

            <!-- Secondary Schedule (Optional) -->
            <div class="space-y-3">
              <p class="text-xs font-medium text-gray-700">Secondary Schedule (Optional)</p>
              <div class="grid grid-cols-2 gap-3">
                <BaseSelect 
                  v-bind="getFieldProps('schedule_day_2')" 
                  label="Day"
                >
                  <option value="">Select Day</option>
                  <option v-for="day in daysOfWeek" :key="day.value" :value="day.value">
                    {{ day.label }}
                  </option>
                </BaseSelect>
                
                <BaseInput 
                  v-bind="getFieldProps('schedule_time_2')" 
                  label="Start Time"
                  type="time"
                />
              </div>
            </div>

            <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div class="flex items-start gap-2">
                <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div class="text-sm text-blue-800">
                  <p class="font-medium">Schedule Info</p>
                  <p class="text-xs mt-1">You can set up to two weekly schedules for this class. Both schedules are optional.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Info Card -->
        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
          <h4 class="text-sm font-semibold text-gray-900 mb-3">Quick Guide</h4>
          <ul class="space-y-2 text-xs text-gray-700">
            <li class="flex items-start gap-2">
              <svg class="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <span>Class code should be unique (e.g., ENG-A1, ENG-B2)</span>
            </li>
            <li class="flex items-start gap-2">
              <svg class="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <span>Select the appropriate level for this class</span>
            </li>
            <li class="flex items-start gap-2">
              <svg class="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <span>Lecturer assignment is optional</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Actions Footer -->
    <div class="flex justify-end gap-3 pt-6 border-t border-gray-200">
      <BaseButton type="button" variant="secondary" @click="$emit('close')">
        Cancel
      </BaseButton>
      <BaseButton type="submit" variant="primary" :loading="isSubmitting">
        <template #icon>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        </template>
        {{ isEditMode ? 'Update Class' : 'Create Class' }}
      </BaseButton>
    </div>
  </form>
</template>
